import React, { memo, useEffect, useRef, useState } from 'react'
import styled from 'styled-components';
import create from "zustand"

import JitsiConnection from '../../components/JitsiConnection/JitsiConnection'
import { ErrorHandler } from '../../components/common/Info/ErrorHandler'
import { useConnectionStore } from './../../store/ConnectionStore'
import { useConferenceStore, VideoTrack } from './../../store/ConferenceStore';
import {useParams} from 'react-router-dom'
import { useLocalStore } from '../../store/LocalStore'

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-position: 50% 50%;
  display: block;
  object-fit: cover;
`

const ScreenShareVideo:React.FC<{track:VideoTrack}> = memo(({track}) => {
  const myRef:any = useRef()
  const room = useConferenceStore(store => store.conferenceObject)

  useEffect(()=> {
    const el = myRef.current
    if(track?.containers?.length === 0) track.attach(el)
    return (() => {
      track.detach(el)
    })
  },[track])

  useEffect(() => {
    room?.addTrack(track)
      .catch(error => {});//the track might have been added already, handle the promise error
  },[room, track])

  return (
    <Video autoPlay={true} ref={myRef} className={`localTrack videoTrack`}/>
  )
})

type DesiredConnectionState = "INIT" | "SHARE" | "RESHARE"

type ITrack = {
  dispose: () => void;
}

type IScreenShareStore = {
  desiredConnectionState: DesiredConnectionState,
  linkAnnounced: boolean,
  track: ITrack | null,
  setDesiredConnectionState: (DesiredConnectionState) => void,
  setLinkAnnounced: (boolean) => void,
  setTrack: (ITrack) => void,
};

const useScreenShareStore = create<IScreenShareStore>((set, get) => {
  const initialState = {
    desiredConnectionState: "INIT",
    linkAnnounced: false,
    track: null,
  } as const;

  const setDesiredConnectionState = (desiredConnectionState: DesiredConnectionState) => {
    set({desiredConnectionState});
  };

  const setLinkAnnounced = (linkAnnounced: boolean) => {
    set({linkAnnounced});
  };

  const setTrack = (track: ITrack) => {
    set({track});
  };

  return {
    ...initialState,
    setDesiredConnectionState,
    setLinkAnnounced,
    setTrack,
  };
});


export const ScreenShare = () => {
  const conference = useConferenceStore(state => state.conferenceObject)
  const setLocalTracks = useLocalStore(store => store.setLocalTracks)
  const initJitsiMeet = useConnectionStore(store => store.initJitsiMeet)
  const disconnectServer = useConnectionStore(store => store.disconnectServer)
  const jsMeet = useConnectionStore(store => store.jsMeet)
  const connectServer = useConnectionStore(store => store.connectServer)
  const connected = useConnectionStore(store => store.connected)
  const initConference = useConferenceStore(store => store.init)
  const conferenceIsJoined = useConferenceStore(store => store.isJoined)
  let {id, displayName, linkPrimary} = useParams() //get Id from url, should error check here I guess

  const videoTrack = useLocalStore((store) => store.video)
  const desiredConnectionState = useScreenShareStore((store) => store.desiredConnectionState);
  const linkAnnounced = useScreenShareStore((store) => store.linkAnnounced);
  const track = useScreenShareStore((store) => store.track);
  const setDesiredConnectionState = useScreenShareStore((store) => store.setDesiredConnectionState);
  const setLinkAnnounced = useScreenShareStore((store) => store.setLinkAnnounced);
  const setTrack = useScreenShareStore((store) => store.setTrack);

  const announceLink = () => {
    conference?.sendCommand('link', {value: JSON.stringify({id: conference.myUserId(), main: linkPrimary})})

    setLinkAnnounced(true);
  }

  const createTrack = () => {
    jsMeet
    ?.createLocalTracks({ devices: [ 'desktop' ] }, true)
    .then(tracks => {
      console.log(tracks);
      setLocalTracks(tracks)
    })
    .catch(error => {
      console.log(error)
    });
  }

  const startSharing = () => {
    setDesiredConnectionState("SHARE");
  }

  const disposeTrack = () => {
    track?.dispose();
    setTrack(null);
  }

  const disposeLink = () => {
    setLinkAnnounced(false);
  }

  const disposeConference = () => {
    conference?.leave();
  }

  const operate = () => {
    if(!jsMeet) {
      initJitsiMeet();
      return;
    }
    if(!connected) {
      connectServer(id);
      return;
    }

    if(desiredConnectionState == "SHARE"){
      if(!conferenceIsJoined){
        initConference(id);
        return;
      }
      if(!linkAnnounced){
        announceLink();
        return;
      }
      if(!track){
        createTrack();
        return;
      }
    }
    if(desiredConnectionState == "INIT"){
      if(track){
        disposeTrack();
        return;
      }
      if(linkAnnounced){
        disposeLink();
        return;
      }
      if(conferenceIsJoined){
        disposeConference();
        return;
      }
    }
    if(desiredConnectionState == "RESHARE"){
      if(track){
        disposeTrack();
        return;
      }
      setDesiredConnectionState("SHARE");
    }
  }

  useEffect(operate, [jsMeet, connected, desiredConnectionState, conferenceIsJoined, linkAnnounced, track])

  return (
    <React.Fragment>
      <button onClick={startSharing}>start video</button>
      <ErrorHandler />

      {videoTrack && (
        <ScreenShareVideo key={videoTrack.track.id} track={videoTrack} />
      )}
    </React.Fragment>
  )
}

export default ScreenShare;
