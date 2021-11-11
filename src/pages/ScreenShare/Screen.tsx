//shitty naming - Video for others

import {useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useConferenceStore} from '../../store/ConferenceStore';
import { useLocalStore } from '../../store/LocalStore';

const Video = styled.video`
  width: 450px;
  height: auto;
  left: 250px;
  position:absolute;
  object-position: 50% 50%;
  display: block;
  object-fit: cover;
`

export const Screen = ({ id, linkedId }) => {
  const myRef: any = useRef()
  const screenTrack = useConferenceStore(useCallback(store => store.users[id].video, [id]))
  const linkedUser = useConferenceStore(useCallback(state => state.users[linkedId], [linkedId]))
  const myPos = useLocalStore(store => store.pos)



  useEffect(() => {
    const el = myRef.current
    screenTrack?.attach(el)
    return (() => {
      screenTrack?.detach(el)
    })
  }, [screenTrack])

  return (
          <>
          { linkedUser ?
            <div style={{position:'absolute', left:`${linkedUser.pos.x}px`, top:`${linkedUser.pos.y}px`}} className="userContainer">
              <Video autoPlay={true} ref={myRef} className={`remoteScreen videoTrack`} id={`${id}screen`}/>
            </div>
            : 
            <div style={{position:'absolute', left:`${myPos.x}px`, top:`${myPos.y}px`}} className="userContainer">
              <Video autoPlay={true} ref={myRef} className={`remoteScreen videoTrack`} id={`${id}screen`}/>
            </div>
          }    
          </>
        )
}