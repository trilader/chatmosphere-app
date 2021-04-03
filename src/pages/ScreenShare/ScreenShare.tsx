import React, { memo, useEffect, useRef, useState } from 'react'
import styled from 'styled-components';

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

  useEffect(() => {
    initJitsiMeet()
  }, [initJitsiMeet])

  useEffect(() => {
    connectServer(id)
    return ()=> disconnectServer()
  },[id, connectServer, disconnectServer])

  useEffect(() => {
    if(jsMeet && connected) {
      initConference(id)
    }
  },[jsMeet, connected, initConference, id])

  const announceAndCreateTrack = () => {
    conference?.sendCommand('link', {value: JSON.stringify({id: conference.myUserId(), main: linkPrimary})})

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

  const startSharing = (trigger) => {
    if(conferenceIsJoined){
      announceAndCreateTrack();
    }
  }

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
