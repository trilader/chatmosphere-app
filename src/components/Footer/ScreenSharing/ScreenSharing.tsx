import React from "react"
import { IconButton } from "../../common/Buttons/Button"
import { useLocalStore } from "../../../store/LocalStore"
import { useConferenceStore } from "../../../store/ConferenceStore"
import ScreenShareIcon from "../../../assets/icons/ScreenShare"


export const ScreenSharing = () => {
  const localStore = useLocalStore();
  const conferenceStore = useConferenceStore();

  let link = "/screenshare/" + conferenceStore.conferenceName + "/" + conferenceStore.displayName + "-screenshare/" + localStore.id;

  function onStartScreenshare() {
    window.open(link, "_blank")
  }

  return (
    <IconButton
      round
      onClick={onStartScreenshare}
      IconStart={<ScreenShareIcon />}
      label="Screenshare">
    </IconButton>
  )
}
