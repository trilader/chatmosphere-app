//@ts-nocheck
import React, { useEffect } from 'react'
import create from "zustand"
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { ErrorHandler } from '../../components/common/Info/ErrorHandler'
import { useConnectionStore } from './../../store/ConnectionStore'
import { useConferenceStore } from './../../store/ConferenceStore';
import { useParams } from 'react-router-dom'
import { useLocalStore } from '../../store/LocalStore'
import { ScreenShareVideo } from './ScreenShareVideo';



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
  const jsMeet = useConnectionStore(store => store.jsMeet)
  const conference = useConferenceStore(state => state.conferenceObject)
  const users = useConferenceStore(state => state.users)
  const isJoined = useConferenceStore(state => state.isJoined)
  const isConnected = useConnectionStore(store => store.connected)
  const initJitsiMeet = useConnectionStore(store => store.initJitsiMeet)
  const connectServer = useConnectionStore(store => store.connectServer)
  const initConference = useConferenceStore(store => store.init)
  const setLocalTracks = useLocalStore(store => store.setLocalTracks)
  const leaveConference = useConferenceStore(store => store.leave)
  const clearScreenTrack = useLocalStore(store => store.clearScreenTrack)
  let { session: sessionName, linkPrimary } = useParams() //get sessionID & linkedUserID from url

  const videoTrack = useLocalStore((store) => store.desktop)
  const desiredConnectionState = useScreenShareStore((store) => store.desiredConnectionState); //SHARE
  const linkAnnounced = useScreenShareStore((store) => store.linkAnnounced); // false
  const creatingTrack = useScreenShareStore((store) => store.creatingTrack); // false
  const setDesiredConnectionState = useScreenShareStore((store) => store.setDesiredConnectionState);
  const setLinkAnnounced = useScreenShareStore((store) => store.setLinkAnnounced);
  const setCreatingTrack = useScreenShareStore((store) => store.setCreatingTrack);

  /**
   * TODO:
   * - Load JitsiMeet
   * - Connect to server 
   * - - disconnect on unmount
   * - IF connected is true:
   * - - Join Conference
   * - IF joined is true, check if a user with linkPrimary is in conference
   * - - IF user is in conference, set link to true
   * - - IF user is not in conference, set link to false
   * 
   * - IF link is false:
   * - - show message "you seem to be not in the conference"
   * - - disable share button with text "not connected"
   * - IF link is true && share is true:
   * - - set share button to active with text "stop sharing"
   * - - Create screen track
   * - - - IF track is created:
   * - - - - attach track to local video
   * - ELSE IF link is true && share is false:
   * - - set share button to off with text "share"
   * - - remove screen track

   */


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

  const closeWindow = () => {
    window.close()
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
    leaveConference()
  }

  const joinConfernce = () => {
    initConference(sessionName);
  }

  useEffect(() => {
    //Connect to Server
    if (!jsMeet) {
      initJitsiMeet();
      return;
    }
    if (!isConnected) {
      connectServer(sessionName);
      return;
    }
    if (!conferenceReady()) {
      joinConfernce();
      return;
    }
    conference?.setLocalParticipantProperty("linkedUser", linkPrimary);

    console.log(desiredConnectionState);
    if (desiredConnectionState === "SHARE") {

      if (!trackReady()) {
        createTrack();
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
        return;
      }
      if (linkAnnounced) {
        disposeLink();
        return;
      }
      if (conferenceReady()) {
        // disposeConference();
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
    if(desiredConnectionState === "LEAVE"){
      window.close()
      // disposeConference();
      // closeWindow();
      return
    }
  },[jsMeet, isConnected, desiredConnectionState, conference, linkAnnounced, videoTrack, users])

  useEffect(() => {
    console.log("screenshare original user id is ", linkPrimary)
    console.log("Screenshare original user object is ", users[linkPrimary])
    if(isJoined && users[linkPrimary] === undefined) {
     setDesiredConnectionState("LEAVE")
    }
  }, [users, linkPrimary, isJoined])

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