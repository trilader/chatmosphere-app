import React from "react"
import { Button } from "../../common/Buttons/Button"
import { FaLaptop } from "react-icons/fa"
import { useLocalStore } from "../../../store/LocalStore"
import { useConferenceStore } from "../../../store/ConferenceStore"


export const ScreenSharing = () => {
  const localStore = useLocalStore();
  const conferenceStore = useConferenceStore();

  let link = "/screenshare/" + conferenceStore.conferenceName + "/" + conferenceStore.displayName + "-screenshare/" + localStore.id;

  function onStartScreenshare() {
    const screenshareLink = document.getElementById("screenshare-link");
    if (screenshareLink) {
      screenshareLink.click();
    }
  }

  return <Button type="primary" style={{ width: "42px" }} onClick={onStartScreenshare}>
    <a id="screenshare-link" target="_blank" href={link} />
    <FaLaptop style={{ marginRight: 0 }} />
  </Button>
}
