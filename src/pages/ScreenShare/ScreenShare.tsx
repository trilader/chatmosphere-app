//@ts-nocheck
import React, { useEffect } from 'react'
import create from "zustand"
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { ErrorHandler } from '../../components/common/Info/ErrorHandler'
import { useConnectionStore } from './../../store/ConnectionStore'
import { useConferenceStore } from './../../store/ConferenceStore';
import { useParams } from 'react-router-dom'
import { useLocalStore } from '../../store/LocalStore'
import { ScreenShareVideo } from './Video';



const useScreenShareStore = create<IScreenShareStore>((set, get) => {
  const initialState = {
    desiredConnectionState: "SHARE",
    linkAnnounced: false,
    creatingTrack: false,
  } as const;

  const setDesiredConnectionState = (desiredConnectionState: DesiredConnectionState) => {
    set({ desiredConnectionState: desiredConnectionState });
  };

  const setLinkAnnounced = (linkAnnounced: boolean) => {
    set({ linkAnnounced: linkAnnounced });
  };

  const setCreatingTrack = (creatingTrack: boolean) => {
    set({ creatingTrack: creatingTrack });
  };

  return {
    ...initialState,
    setDesiredConnectionState,
    setLinkAnnounced,
    setCreatingTrack,
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
  const clearScreenTrack = useLocalStore(store => store.clearScreenTrack)
  // let { id, displayName, linkPrimary } = useParams() //get Id from url, should error check here I guess
  let { session, user } = useParams() //get Id from url, should error check here I guess

  const videoTrack = useLocalStore((store) => store.desktop)
  const desiredConnectionState = useScreenShareStore((store) => store.desiredConnectionState); //SHARE
  const linkAnnounced = useScreenShareStore((store) => store.linkAnnounced); // false
  const creatingTrack = useScreenShareStore((store) => store.creatingTrack); // false
  const setDesiredConnectionState = useScreenShareStore((store) => store.setDesiredConnectionState);
  const setLinkAnnounced = useScreenShareStore((store) => store.setLinkAnnounced);
  const setCreatingTrack = useScreenShareStore((store) => store.setCreatingTrack);

  // used to link screenshareuser to other user
  const announceLink = () => {
    // sends a custom link command that others can receive; userID and PrimrayLink (some kind of uuid?)
    conference?.sendCommand('link', { value: JSON.stringify({ id: conference.myUserId(), main: linkPrimary }) })
    // if screenshare user leaves there is a value "idLeft" and connection State is set to INIT
    conference?.on(jsMeet?.events.conference.USER_LEFT, idLeft => {
      if (idLeft === linkPrimary) {
        setDesiredConnectionState("INIT");
      }
    })
    // link was announced to true
    setLinkAnnounced(true);
  }

  // ScreenShare Method used to create a track for screenshare user
  const createTrack = () => {
    if(creatingTrack) return;

    setCreatingTrack(true);
    jsMeet
      ?.createLocalTracks({ devices: ['desktop'] })
      .then(tracks => {
        setCreatingTrack(false); //why is this happening?
        for (const t of tracks) {
          // set desired state to INIT, when screensharing is stopped via browser ui button "stop sharing"
          t.addEventListener(jsMeet.events.track.LOCAL_TRACK_STOPPED, () => {
            setDesiredConnectionState("INIT");
          })
        }
        setLocalTracks(tracks) //this user just has one track (video - desktop)
      })
      .catch(error => {
        setCreatingTrack(false);
        setDesiredConnectionState("INIT");
        console.log(error);
      });
  }

  const trackReady = () => {
    return videoTrack && !videoTrack?.disposed
  }

  const conferenceReady = () => {
    return (conference !== undefined) && (conference.isJoined() !== null);
  }

  const disposeTrack = () => {
    clearScreenTrack()
  }

  const disposeLink = () => {
    setLinkAnnounced(false);
  }

  const disposeConference = () => {
    conference?.leave();
  }

  const joinConfernce = () => {
    initConference(session);
  }

  useEffect(() => {
    if (!jsMeet) {
      initJitsiMeet();
      return;
    }
    if (!connected) {
      connectServer(session);
      return;
    }

    console.log(desiredConnectionState);
    if (desiredConnectionState === "SHARE") {
      if (!trackReady()) {
        createTrack();
        return;
      }
      if (!conferenceReady()) {
        joinConfernce();
        return;
      }
      // if (!linkAnnounced) {
      //   conference?.setDisplayName(displayName);
      //   announceLink();
      //   return;
      // }
    }
    if (desiredConnectionState === "INIT") {
      if (trackReady()) {
        disposeTrack();
        
        return; //why return here? shouldnt the link be disposed too? anyway
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
    if (desiredConnectionState === "RESHARE") {
      if (trackReady()) {
        disposeTrack();
        return;
      }
      setDesiredConnectionState("SHARE");
    }
  },[jsMeet, connected, desiredConnectionState, conference, linkAnnounced, videoTrack])

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
      {!videoTrack && !videoTrack?.disposed && (
        <button onClick={startSharing}>start sharing</button>
      )}
      {videoTrack !== undefined && (
        <button onClick={stopSharing}>stop sharing</button>
      )}
      {videoTrack && !videoTrack?.disposed && (
        <button onClick={reshare}>share something else</button>
      )}
      <ErrorHandler />

      { videoTrack && !videoTrack?.disposed && (
        <ScreenShareVideo key={videoTrack.track.id} track={videoTrack} />  
      )}
    </React.Fragment>
  )
}

export default ScreenShare;


if (process.env.NODE_ENV === "development") {
  let root = document.createElement('div');
  root.id = 'screen-share-devtools';
  document.body.appendChild(root);
  // @ts-ignore: Unreachable code error
  mountStoreDevtool("ScreenShareStore", useScreenShareStore, root)
}