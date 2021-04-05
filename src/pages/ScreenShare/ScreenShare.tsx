import React, { memo, useEffect, useRef } from 'react'
import styled from 'styled-components';
import create from "zustand"

import { ErrorHandler } from '../../components/common/Info/ErrorHandler'
import { useConnectionStore } from './../../store/ConnectionStore'
import { useConferenceStore, VideoTrack } from './../../store/ConferenceStore';
import { useParams } from 'react-router-dom'
import { useLocalStore } from '../../store/LocalStore'

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-position: 50% 50%;
  display: block;
  object-fit: cover;
`

const ScreenShareVideo: React.FC<{ track: VideoTrack }> = memo(({ track }) => {
  const myRef: any = useRef()
  const room = useConferenceStore(store => store.conferenceObject)

  useEffect(() => {
    const el = myRef.current
    if (track?.containers?.length === 0) track.attach(el)
    return (() => {
      track.detach(el)
    })
  }, [track])

  useEffect(() => {
    room?.addTrack(track)
      .catch(error => { });//the track might have been added already, handle the promise error
  }, [room, track])

  return (
    <Video autoPlay={true} ref={myRef} className={`localTrack videoTrack`} />
  )
})

type DesiredConnectionState = "INIT" | "SHARE" | "RESHARE"

type IScreenShareStore = {
  desiredConnectionState: DesiredConnectionState,
  linkAnnounced: boolean,
  setDesiredConnectionState: (DesiredConnectionState) => void,
  setLinkAnnounced: (boolean) => void,
};

const useScreenShareStore = create<IScreenShareStore>((set, get) => {
  const initialState = {
    desiredConnectionState: "INIT",
    linkAnnounced: false,
  } as const;

  const setDesiredConnectionState = (desiredConnectionState: DesiredConnectionState) => {
    set({ desiredConnectionState });
  };

  const setLinkAnnounced = (linkAnnounced: boolean) => {
    set({ linkAnnounced });
  };

  return {
    ...initialState,
    setDesiredConnectionState,
    setLinkAnnounced,
  };
});


export const ScreenShare = () => {
  const conference = useConferenceStore(state => state.conferenceObject)
  const setLocalTracks = useLocalStore(store => store.setLocalTracks)
  const initJitsiMeet = useConnectionStore(store => store.initJitsiMeet)
  const jsMeet = useConnectionStore(store => store.jsMeet)
  const connectServer = useConnectionStore(store => store.connectServer)
  const connected = useConnectionStore(store => store.connected)
  const initConference = useConferenceStore(store => store.init)
  let { id, displayName, linkPrimary } = useParams() //get Id from url, should error check here I guess

  const videoTrack = useLocalStore((store) => store.video)
  const desiredConnectionState = useScreenShareStore((store) => store.desiredConnectionState);
  const linkAnnounced = useScreenShareStore((store) => store.linkAnnounced);
  const setDesiredConnectionState = useScreenShareStore((store) => store.setDesiredConnectionState);
  const setLinkAnnounced = useScreenShareStore((store) => store.setLinkAnnounced);

  const announceLink = () => {
    conference?.sendCommand('link', { value: JSON.stringify({ id: conference.myUserId(), main: linkPrimary }) })
    conference?.on(jsMeet?.events.conference.USER_LEFT, idLeft => {
      if (idLeft === linkPrimary) {
        setDesiredConnectionState("INIT");
      }
    })
    setLinkAnnounced(true);
  }

  const createTrack = () => {
    jsMeet
      ?.createLocalTracks({ devices: ['desktop'] }, true)
      .then(tracks => {
        for(const t of tracks){
          // set desired state to INIT, when screensharing is stopped via browser ui button "stop sharing"
          t.addEventListener(jsMeet.events.track.LOCAL_TRACK_STOPPED, () => {
            setDesiredConnectionState("INIT");
          })
        }
        setLocalTracks(tracks)
      })
      .catch(error => {
        console.log(error)
      });
  }

  const trackReady = () => {
    return videoTrack && !videoTrack.disposed
  }

  const conferenceReady = () => {
    return (conference !== undefined) && (conference.isJoined() !== null);
  }

  const disposeTrack = () => {
    videoTrack?.dispose().then(operate);
  }

  const disposeLink = () => {
    setLinkAnnounced(false);
  }

  const disposeConference = () => {
    conference?.leave();
  }

  const joinConfernce = () => {
    initConference(id);
  }

  const operate = () => {
    if (!jsMeet) {
      initJitsiMeet();
      return;
    }
    if (!connected) {
      connectServer(id);
      return;
    }

    console.log(desiredConnectionState);
    if (desiredConnectionState == "SHARE") {
      if (!conferenceReady()) {
        joinConfernce();
        return;
      }
      if (!linkAnnounced) {
        conference?.setDisplayName(displayName);
        announceLink();
        return;
      }
      if (!trackReady()) {
        createTrack();
        return;
      }
    }
    if (desiredConnectionState == "INIT") {
      if (trackReady()) {
        disposeTrack();
        return;
      }
      if (linkAnnounced) {
        disposeLink();
        return;
      }
      if (conferenceReady()) {
        disposeConference();
        return;
      }
    }
    if (desiredConnectionState == "RESHARE") {
      if (trackReady()) {
        disposeTrack();
        return;
      }
      setDesiredConnectionState("SHARE");
    }
  }

  useEffect(operate, [jsMeet, connected, desiredConnectionState, conference, linkAnnounced, videoTrack])


  const startSharing = () => {
    setDesiredConnectionState("SHARE");
  };

  const stopSharing = () => {
    setDesiredConnectionState("INIT");
  };

  const reshare = () => {
    setDesiredConnectionState("RESHARE");
  };

  return (
    <React.Fragment>
      {!trackReady() && (
        <button onClick={startSharing}>start sharing</button>
      )}
      {trackReady() && (
        <button onClick={stopSharing}>stop sharing</button>
      )}
      {trackReady() && (
        <button onClick={reshare}>share something different</button>
      )}
      <ErrorHandler />

      { trackReady() && videoTrack && (
        <ScreenShareVideo key={videoTrack.track.id} track={videoTrack} />
      )}
    </React.Fragment>
  )
}

export default ScreenShare;
