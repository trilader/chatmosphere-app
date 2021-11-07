//shitty naming - Video for others

import {useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useConferenceStore} from '../../store/ConferenceStore';

const Video = styled.video`
  width: 350px;
  height: auto;
  position:absolute;
  object-position: 50% 50%;
  display: block;
  object-fit: cover;
`

export const Screen: React.FC<{ id:string }> = ({ id }) => {
  const myRef: any = useRef()
  const screenTrack = useConferenceStore(useCallback(store => store.users[id].video, [id]))

  useEffect(() => {
    const el = myRef.current
    screenTrack?.attach(el)
    return (() => {
      screenTrack?.detach(el)
    })
  }, [screenTrack])

  return (
    <Video autoPlay={true} ref={myRef} className={`remoteScreen videoTrack`} id={`${id}screen`}/>
  )
}