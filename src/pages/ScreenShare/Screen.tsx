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
const userRequest = state => state.users

export const Screen = ({ id, linkedId }) => {
  const myRef: any = useRef()
  const screenTrack = useConferenceStore(useCallback(store => store.users[id].video, [id]))
  const linkedUser = useConferenceStore(state => state.users[linkedId])
  // const linkedPosition = useConferenceStore(useCallback(store => store.users[userObject?.user?._properties?.linkedUser]['pos'], [userObject]))

  useEffect(() => {
    const el = myRef.current
    screenTrack?.attach(el)
    return (() => {
      screenTrack?.detach(el)
    })
  }, [screenTrack])

  useEffect(() => {
    console.log("User exists", linkedUser)
    // const el = myRef.current
    // el.style.transform = `translate(${linkedPosition.x}px, ${linkedPosition.y}px)`
  }, [linkedUser])

  return (
    <Video autoPlay={true} ref={myRef} className={`remoteScreen videoTrack`} id={`${id}screen`}/>
  )
}