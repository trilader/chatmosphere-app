import React, { useCallback, useEffect } from 'react';
import { useConferenceStore } from './../../store/ConferenceStore';
import { useLocalStore } from './../../store/LocalStore';
import { ReloadHint } from '../ReloadHint/ReloadHint';
import { AudioTrack } from './AudioTrack';
import { MuteIndicator } from './MuteIndicator';
import { VideoTrack } from './VideoTrack';
import { NameTag } from '../NameTag/NameTag';


export const User = ({id, user}) => {

  const linkMain = useConferenceStore(useCallback(store => store.users[id]['linkMain'],[id]))
  let myPos = useConferenceStore(useCallback(store => store.users[id]['pos'], [id]))
  const myVolume = useConferenceStore(useCallback(store => store.users[id]['volume'], [id]))
  let isMute = useConferenceStore(useCallback(store => store.users[id]['mute'],[id]))
  const calculateVolume = useConferenceStore(useCallback(store => store.calculateVolume, []))

  const users = useConferenceStore(useCallback(store => store.users, [id]))
  let showReloadHint = true;
  if (linkMain && users[linkMain]) {
    myPos = {x: users[linkMain]['pos'].x + 150, y: users[linkMain]['pos'].y - 100};
    showReloadHint = false;
  }

  const localStore = useLocalStore();
  if (linkMain === localStore.id) {
    myPos = {x: localStore['pos'].x + 150, y: localStore['pos'].y - 100};
    showReloadHint = false;
  }


  useEffect(() => {
    calculateVolume(id)
  },[id, calculateVolume, myPos])

  return(
    <div style={{position:'absolute', left:`${myPos.x}px`, top:`${myPos.y}px`}} className="userContainer" >
      <VideoTrack id={id} />
      {showReloadHint && <ReloadHint />}
      <AudioTrack id={id} volume={myVolume} />
      <NameTag>{user?.user?._displayName || 'Friendly Sphere'}</NameTag>
      <div>Volume {Math.round(myVolume * 11)}</div>
      {isMute && <MuteIndicator>🤭</MuteIndicator>}
    </div>
  )
}


