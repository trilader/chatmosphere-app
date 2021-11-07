import { memo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useConferenceStore, VideoTrack} from '../../store/ConferenceStore';

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-position: 50% 50%;
  display: block;
`

export const ScreenShareVideo: React.FC<{ track: VideoTrack }> = memo(({ track }) => {
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