import produce from 'immer';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import create from 'zustand';
import { conferenceOptions } from '../components/JitsiConnection/jitsiOptions';
import { getVolumeByDistance } from '../utils/VectorHelpers';
import { useConnectionStore } from './ConnectionStore';
import { useLocalStore } from './LocalStore';
import { panOptions } from '../components/PanWrapper/panOptions';
import { secureConferenceName } from "../utils/secureConferenceName"

// # TS DEFINITIONS *******************************************

declare global {
  interface Window {
    JitsiMeetJS: any
  }
}

// # IMPLEMENTATIONS *******************************************

const fnv32a = (str: String): number => {
  var FNV1_32A_INIT = 0x811c9dc5;
  var hval = FNV1_32A_INIT;
  for ( var i = 0; i < str.length; ++i )
  {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    hval &= 0xffffffff;
  }
  return hval >>> 0;
}

export const useConferenceStore = create<IConferenceStore>((set,get) => {
  let localStoreUsername:string;
  try {
    const localusername = localStorage.getItem('jitsiUsername')
    localStoreUsername =  localusername!== null?localusername:'Unfriendly Sphere'
  } catch (error) {
    localStoreUsername = 'Unfriendly Sphere'
  }
  const initialState = {
    conferenceObject:undefined,
    conferenceName: process.env.REACT_APP_DEMO_SESSION || "chatmosphere",
    isJoined:false,
    users:{},
    displayName:localStoreUsername,
    error:undefined,
    messages:[],
    unreadMessages:0
  }

  const produceAndSet = (callback:(newState:IConferenceStore)=>void)=>set(state => produce(state, newState => callback(newState)))

  const _addMessage = (id:string, message:string, date:Date): void => produceAndSet ( newState => {
    newState.messages.push({id:id,text:message,date:date,nr:0});
    newState.unreadMessages = newState.unreadMessages +1;
  })

  const clearUnreadMessages = ():void => produceAndSet( newState => {
    newState.unreadMessages = 0;
  })

  // Private Helper Functions *******************************************
  const _addUser = (id:ID, user?:any) :void => produceAndSet (newState => {

    let d = (fnv32a("d" + id) / 0xffffffff) * 2*Math.PI;
    let r = (fnv32a("r" + id) / 0xffffffff) * 200 + 200;
    let initialPosition = { x: panOptions.room.size.x / 2 - Math.sin(d) * r, y: panOptions.room.size.y / 2 - Math.cos(d) * r };
    newState.users[id] = {id:id, user:user, mute:false, properties:{}, volume:1, pos: initialPosition, zoom: false, chatmoClient: false }
  })
  const _removeUser = (id:ID) :void => produceAndSet (newState => {
    delete newState.users[id]
  })
  const _addAudioTrack = (id:ID, track:IMediaTrack) => produceAndSet (newState => {
    if(newState.users[id]) 
    {
      const JitsiMeetJS = useConnectionStore.getState().jsMeet
      track.addEventListener(JitsiMeetJS?.events.track.TRACK_AUDIO_OUTPUT_CHANGED,deviceId =>console.log(`track audio output device was changed to ${deviceId}`))
      newState.users[id].audio = track
      newState.users[id]['mute'] = track.isMuted()
    }
  })
  // const _removeAudioTrack = (id:ID):void => produceAndSet (newState => {
  //   if(newState.users[id]) newState.users[id].audio = undefined
  // })
  const _addVideoTrack = (id:ID, track:IMediaTrack):void => produceAndSet (newState => {
    if(newState.users[id]) {
      const JitsiMeetJS = useConnectionStore.getState().jsMeet
      track.addEventListener(JitsiMeetJS?.events.track.TRACK_VIDEOTYPE_CHANGED, (e)=>_onVideoTypeChanged(e, id))
      newState.users[id].video = track
      newState.users[id].videoType = track.videoType === "desktop" ? "desktop" : "camera" //set videoType directly
    }
  })
  // const _removeVideoTrack = (id:ID):void => produceAndSet (newState => {
  //   if(newState.users[id]) {
  //     newState.users[id].video = undefined
  //     newState.users[id].videoType = undefined //remove VideoType
  //   }
  // })
  const _onPositionReceived = (e:any):void => {
    const pos = JSON.parse(e.value)
    _updateUserPosition(pos.id, {x:pos.x, y:pos.y})
  }
  const _updateUserPosition = (id:ID, pos:IVector2):void => produceAndSet (newState => {
    if(newState.users[id]) {
        newState.users[id]['pos'] = pos
        newState.users[id]['chatmoClient'] = true
    }
  })
  const _onLinkReceived = (e:any):void => {
    const link = JSON.parse(e.value)
    _updateUserLink(link.id, link.main)
  }
  const _updateUserLink = (id:ID, main:string):void => produceAndSet (newState => {
    if(newState.users[id]) newState.users[id]['linkMain'] = main
  })
  const _onTrackMuteChanged = (track:IMediaTrack):void => {
    if(track.getType() === 'video') return
    const tmpID = track.getParticipantId()
    set(state => produce(state, newState => {
      if(newState.users[tmpID]) newState.users[tmpID]['mute'] = track.isMuted() //check in beginning sucks
    }))
  }

  const _onConferenceError = (e) => {
    const connection = useConnectionStore.getState().connection
    // console.log("tmpConnection:",get().connection)
    set({ conferenceObject: undefined, error:connection?.xmpp.lastErrorMsg })
  }

  const _onRemoteTrackAdded = (track:IMediaTrack):void => {
    if(track.isLocal()) return // also run on your own tracks so exit
    const id = track.getParticipantId() // get user id of track
    track.getType() === "audio" ? _addAudioTrack(id, track) : _addVideoTrack(id, track)
  }
  const _onRemoteTrackRemoved = (track:IMediaTrack):void => {
    // TODO: Remove track from user Object
    // if(track.isLocal()) return
    // const id = track.getParticipantId() // get user id of track
    // track.getType() === 'audio' ? _removeAudioTrack(id) : _removeVideoTrack(id) // do we need that? maybe if user is still there but closes video?
    // track.dispose()
  }

  const _onVideoTypeChanged = (type:string, id) => produceAndSet (newState => {
      newState.users[id].videoType = type === "desktop" ? "desktop" : "camera" //set videoType directly
      // alternative implementation if updating jitsi jvb doesnt fix current delay on switch of cam & screenshare
      // remove track from conference and add again
  })

  const _onConferenceJoined = () => {
    set({isJoined:true})//only Local User -> could be in LocalStore
    const conference = get().conferenceObject
    // console.log(get().displayName)
    const jitsiname = localStorage.getItem('jitsiUsername');
    const url =  window.location.href;
    if (jitsiname!==null && !/sphere/i.test(jitsiname)){
      conference?.setDisplayName(jitsiname)
    }
    else{
      console.log('SHOULD CHANGE')

    }
  }
   const _onMessageReceived = (id,message,time) => {
    if (time===undefined){
      time = new Date().toISOString();
    }
    time = new Date(Date.parse(time))
    _addMessage(id,message,time)
  }


  const _onParticipantPropertyChanged = (e:any) => {
    const id = e._id
    const props = e._properties
    produceAndSet (newState => {
      const tmpState = newState.users[id].properties
      newState.users[id].properties = {...tmpState,...props}
    })
  }

  const _onUserNameChanged = (id:string,displayName:string) => {
    console.log(id,displayName)
  }


  // # Public functions *******************************************
  const initConference = (conferenceID:string):void => {
    const JitsiMeetJS = useConnectionStore.getState().jsMeet 
    const connection = useConnectionStore.getState().connection //TODO: either move to ConnectionStore or handle undefined here
    // make sure there is a conference Name
    const enteredConferenceName = process.env.REACT_APP_DEMO_SESSION || conferenceID.length > 0 ? conferenceID : get().conferenceName || "chatmosphere"
    set({conferenceName:enteredConferenceName})
    const conferenceName = secureConferenceName(enteredConferenceName, process.env.REACT_APP_SESSION_PREFIX)
    if(connection && JitsiMeetJS && conferenceName) {
      const conference = connection.initJitsiConference(conferenceName, conferenceOptions) //TODO before unload close connection
      conference.on(JitsiMeetJS.events.conference.USER_JOINED, _addUser)
      conference.on(JitsiMeetJS.events.conference.USER_LEFT, _removeUser)
      conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, _onRemoteTrackAdded)
      conference.on(JitsiMeetJS.events.conference.TRACK_REMOVED, _onRemoteTrackRemoved)
      conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, _onConferenceJoined)
      conference.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, _onTrackMuteChanged);
      conference.on(JitsiMeetJS.events.conference.CONFERENCE_ERROR, _onConferenceError);
      conference.on(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, _onMessageReceived);
      //conference.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, onUserNameChanged);
      conference.on(JitsiMeetJS.events.conference.PARTICIPANT_PROPERTY_CHANGED, _onParticipantPropertyChanged)
      conference.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, _onUserNameChanged);
      // conference.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, on_remote_track_audio_level_changed);
      //conference.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, onPhoneNumberChanged);
      conference.addCommandListener("pos", _onPositionReceived)
      conference.addCommandListener("link", _onLinkReceived)
      window.addEventListener('beforeunload', leaveConference) //does this help?
      window.addEventListener('unload', leaveConference) //does this help?
      conference.setDisplayName(get().displayName)
      conference.join()
      set({conferenceObject:conference,error:undefined})
    } else {
      throw new Error('Jitsi Server connection has not been initialized or failed :( - did you call initJitsiMeet on ConnectionStore yet?')
    }
  }

  const join = () => {

  }

  const myUserId = () => {
    const conference = get().conferenceObject
    return conference!.myUserId()
  }

  const leaveConference = () => {
    const conference = get().conferenceObject
    conference?.leave()
  }
  const setConferenceName = (name = "chatmosphere") => {
    const newName = name
    set({conferenceName:newName})
    return newName
  }

  const sendTextMessage = (message:string) =>{
    const conference = get().conferenceObject
    // console.log(`send: ${message}`)
    conference?.sendTextMessage(message)
  }


  const setDisplayName = (name) => {

    if (!/sphere/i.test(name)){
      try {
        localStorage.setItem('jitsiUsername',name)
      } catch (error) {
        console.error('cannot save username to local Storage')
      }
      set({displayName:name})
      const conference = get().conferenceObject
      conference?.setDisplayName(name)
    }
    else{
      // pass
    }
  }
  const calculateVolume = (id:ID):void => produceAndSet (newState => {
    const localUserPosition:IVector2 = useLocalStore.getState().pos //check if this is updated or kept by closure
    if(newState.users[id]) {
      newState.users[id]['volume'] = getVolumeByDistance(localUserPosition, newState.users[id]['pos'])
    }
  })
  const calculateVolumes = (localPos:IVector2) => produceAndSet (newState => {
    const users = newState.users
    Object.keys(users).map(key => {
      const user = users[key]
      newState.users[key]['volume'] = getVolumeByDistance(localPos, user.pos)
      return null
    })
  })

  const setZoom = (id:ID, val:boolean):void => produceAndSet (newState => {
    if(newState.users[id]) newState.users[id].zoom = val
  })

  // TODO: Not used yet
  const addLocalTrackToConference = (newTrack:IMediaTrack) => {
    const conference = get().conferenceObject
    conference?.addTrack(newTrack)
      .catch(error => console.log(error))
  }
  // not used currently - stub for alternative implementation if replacing streams doesnt fix delay; else remove
  // const replaceLocalTrackInConference = (newTrack:IMediaTrack, oldTrack:IMediaTrack) => {
  //   const conference = get().conferenceObject
  //   conference?.removeTrack(oldTrack)
  //     .then(()=>addLocalTrackToConference(newTrack))
  //     .catch(error => console.log(error))
  // }

  // Return Object *******************************************
  return {
    ...initialState,
    initConference,
    joinConference: join,
    leaveConference,
    setConferenceName,
    sendTextMessage,
    setDisplayName,
    calculateVolume,
    calculateVolumes,
    addLocalTrackToConference,
    myUserId,
    setZoom,
    clearUnreadMessages
  }
})

if(process.env.NODE_ENV === 'development') {
  // @ts-ignore: Unreachable code error
	mountStoreDevtool('ConferenceStore', useConferenceStore)
}
