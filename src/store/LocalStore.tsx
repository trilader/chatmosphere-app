import produce from "immer"
import create from "zustand"
import { Track, User } from "./ConferenceStore"
import { panOptions, transformWrapperOptions } from "../components/PanWrapper/panOptions"
import { mountStoreDevtool } from "simple-zustand-devtools"


export type Point = {x:number, y:number}
//Feels like ZoomPan doesnt belong to LocalStore; maybe state of panHandler or own store?
type ZoomPan = {
  pos:Point
  pan:Point 
  scale:number
  onPanChange: (params:any) => void
} 

type Settings = {
  error?: any
  selectedAudioInputDevice?: string
  selectedAudioOutputDevice?: string
  selectedCameraDevice?: string
}

type Store = {
  setLocalText: (newText:string) => void
  setLocalPosition: (newPosition:Point) => void
  setLocalTracks: (tracks:Track[]) => void
  setMicAndCamera: (micTrack: Track | undefined, camTrack: Track | undefined) => void
  toggleMute: () => void
  selectSettings: (obj: Settings | undefined) => void
  clearLocalTracks: () => void
  setAvailableDevices: (deviceInfos: MediaDeviceInfo[]) => void
  setMyID: (id:string) => void
  text: string
  settings: Settings | undefined
  availableDevices: MediaDeviceInfo[]
} & User & ZoomPan

export const useLocalStore = create<Store>((set,get) => {

  const state = {
    id:"",
    mute:false,
    settings: undefined,
    availableDevices: [],
    volume:1,
    video:undefined,
    audio:undefined,
    pos:panOptions.user.initialPosition,
    pan: {x:transformWrapperOptions.defaultPositionX || 0,y: transformWrapperOptions.defaultPositionY || 0},
    zoom: false,
    chatmoClient: false,
    scale:1,
    text:''
  }

  // # Private Functions
  const _produceAndSet = (callback:(newState:Store)=>void)=>set(state => produce(state, newState => callback(newState)))

  
  // # Public Functions
  const setLocalPosition = (newPosition) => {
    set({pos:newPosition})
  }

  const setLocalText = (newText:string)=>  {
    set({text:newText})
  }
  
  const toggleMute = () => {
    const audioTrack = get().audio
    if(!audioTrack) return
    if(audioTrack.isMuted()) {
      audioTrack.unmute()
      set({mute:false})
    } else {
      audioTrack.mute()
      set({mute:true})
    }
  }

  const selectSettings = (obj: Settings | undefined) => {
    set({ settings: obj });
  }

  const setLocalTracks = (tracks) => _produceAndSet(newState => {
    const audioTrack = tracks.find(t => t.getType() === "audio")
    const videoTrack = tracks.find(t => t.getType() === "video")
    newState.video = videoTrack
    newState.audio = audioTrack
  })

  const setMicAndCamera = (micTrack: Track | undefined, camTrack: Track | undefined) => _produceAndSet(newState => {
    newState.video = camTrack
    newState.audio = micTrack
  })

  const clearLocalTracks = () => _produceAndSet(newState=>{
    // newState.audio?.dispose() //these throw errors on reconnection - some event handlers still leftover
    // newState.video?.dispose()
    newState.audio=undefined
    newState.video=undefined
  })

  const setAvailableDevices = (deviceInfos: MediaDeviceInfo[]) => {
    set({ availableDevices: deviceInfos });
  }

  const setMyID = (id:string) => set({id:id})

  const onPanChange = ({scale,positionX, positionY}) => {
    const viewport = {
      x: panOptions.room.size.x * scale,
      y: panOptions.room.size.y * scale,
    }
    const panLimit = {
      x: viewport.x - window.innerWidth,
      y: viewport.y - window.innerHeight,
    }
    const panPosition = {
      x: Math.max(-panLimit.x, Math.min(0, positionX)),
      y: Math.max(-panLimit.y, Math.min(0, positionY)),
    }
    set({scale:scale, pan:panPosition})
  }

  return {
  ...state,
  setLocalPosition,
  setLocalTracks,
  setMicAndCamera,
  toggleMute,
  selectSettings,
  clearLocalTracks,
  setAvailableDevices,
  setMyID,
  onPanChange,
  setLocalText
}
})


// const unsub1 = useLocalStore.subscribe((i) => globalThis.globalStore = i)


if (process.env.NODE_ENV === "development") {
  let root = document.createElement('div');
  root.id = 'simple-zustand-devtools-3';
  document.body.appendChild(root);

  mountStoreDevtool("LocalStore", useLocalStore, root)
}