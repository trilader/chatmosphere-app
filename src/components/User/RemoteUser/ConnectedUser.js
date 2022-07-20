import { useCallback, useEffect, useRef } from 'react';
import { useConferenceStore } from '../../../store/ConferenceStore';
import { UserBackdrop } from '../components/Backdrop/UserBackdrop';
import { AudioTrack } from './AudioTrack';
import { MuteIndicator } from './MuteIndicator';
import { VideoContainer, VideoTrack } from "./VideoTrack"
import { NameTag } from '../../NameTag/NameTag';
import { useLocalStore } from '../../../store/LocalStore';
import { DesktopVideo } from './DesktopVideo';
import ArrowUpIcon from "../../../assets/icons/ArrowUp"
import CameraOffIcon from "../../../assets/icons/CameraOff"
import { IconButton } from "../../common/Buttons/Button"
import ChatIcon from "../../../assets/icons/ChatIcon"


export const ConnectedUser = ({id}) => {

  const linkMain = useConferenceStore(useCallback(store => store.users[id]['linkMain'],[id]))
  let myPos = useConferenceStore(useCallback(store => store.users[id]['pos'], [id]))
  const myVolume = useConferenceStore(useCallback(store => store.users[id]['volume'], [id]))
  const isMute = useConferenceStore(useCallback(store => store.users[id]['mute'],[id]))
  const calculateVolume = useConferenceStore(useCallback(store => store.calculateVolume, []))
  const calculateUserInRadius = useLocalStore(useCallback((store) => store.calculateUserInRadius,[]))
  // const videoType = useConferenceStore(store => store.users[id]?.['video']?.['videoType'])
  const calculateUserOnScreen = useLocalStore(useCallback((store) => store.calculateUserOnScreen,[]))
  const users = useConferenceStore(useCallback(store => store.users, [id]))
  const user = useConferenceStore(useCallback(store => store.users[id], [id]))
  const isOnStage = user.properties?.onStage
  const dragRef = useRef()

  const zoom = useConferenceStore(useCallback(store => store.users[id]['zoom'],[id]))
  const setZoom = useConferenceStore(useCallback(store => { return () => store.setZoom(id, true) },[id]))
  const setZoomOff = useConferenceStore(useCallback(store => { return () => store.setZoom(id, false) },[id]))

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
    calculateUserInRadius(id)
    calculateUserOnScreen(user, dragRef.current)
  },[id, calculateVolume, calculateUserInRadius, calculateUserOnScreen, user, myPos])

  // * on first switch to desktop its still recognized as camera - on second swtich its correctly recognized as desktop, so on track added needs to set type
  // * the double deletion by event handler is a problem


  if (showReloadHint) {
    // ATOMIC PICK correctly is undefined until camera image is really there!! so use user.video?.videoType instead fo user.videoType!!!
      return(
        <div style={{position:'absolute', width:"200px", height:"200px", left:`${myPos.x}px`, top:`${myPos.y}px`}} id={id} className="userContainer" ref={dragRef} >
          <VideoContainer>
            {isOnStage &&
              <UserBackdrop onStage>Currently on Stage</UserBackdrop>
            }
            {!isOnStage &&
              <>
                <UserBackdrop>Maybe try a reload</UserBackdrop>
                {(user.video?.videoType !== 'desktop') && <VideoTrack id={id} videoTrack={user.video} />}
                {(user.video?.videoType === 'desktop') && <DesktopVideo id={id} videoTrack={user.video} />}
              </>
            }
          </VideoContainer>
          <AudioTrack id={id} volume={myVolume} />
          <NameTag>{user?.user?._displayName || 'Friendly Sphere'}</NameTag>
          <div>Volume {Math.round(myVolume * 11)}</div>
          {isMute && <MuteIndicator />}
        </div>
      )
  } else {
    const ZoomIconStyle = {
      position: 'absolute',
      left: '-24px',
      top: '-22px',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.5)'
    };
    return(
        <div style={{position:'absolute', left:`${myPos.x}px`, top:`${myPos.y}px`, zIndex: 10}} id={id} className="userContainer" ref={dragRef} >
          <VideoContainer>
            <VideoTrack id={id} videoTrack={user.video} />
          </VideoContainer>
          { zoom ?
            <IconButton
              IconStart={<CameraOffIcon />}
              style={ZoomIconStyle}
              label=""
              round
              onClick={setZoomOff}
            /> : <IconButton
              IconStart={<ArrowUpIcon />}
              style={ZoomIconStyle}
              label=""
              round
              onClick={setZoom}
            /> }
        </div>
    )
  }
}

export default ConnectedUser