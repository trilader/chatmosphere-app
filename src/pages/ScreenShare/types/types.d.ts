type DesiredConnectionState = "INIT" | "SHARE" | "RESHARE"

type IScreenShareStore = {
  desiredConnectionState?: DesiredConnectionState,
  linkAnnounced?: boolean,
  creatingTrack: boolean,
  setDesiredConnectionState?: (DesiredConnectionState) => void,
  setLinkAnnounced?: (boolean) => void,
  setCreatingTrack?: (boolean) => void,
};