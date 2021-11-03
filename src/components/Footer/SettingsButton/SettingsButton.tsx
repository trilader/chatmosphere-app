import * as React from "react"
import { FaCogs } from "react-icons/fa"
import { Button } from "../../common/Buttons/Button"
import { useLocalStore } from "../../../store/LocalStore"
import { useConnectionStore } from "../../../store/ConnectionStore"
import { SettingsDialog } from "./SettingsDialog"

export const SettingsButton = () => {
	const selectSettings = useLocalStore(store => store.selectSettings)
	const videoTrack = useLocalStore(store => store.video)
	const audioTrack = useLocalStore(store => store.audio)
	const setAvailableDevices = useLocalStore(store => store.setAvailableDevices)
	const settings = useLocalStore(store => store.settings)
	const jsMeet = useConnectionStore(store => store.jsMeet)

	function toggleSettings() {
		if (!settings) {
			if (!jsMeet) {
				console.error("Cannot get jsMeet from connection store!");
			} else {
				jsMeet.mediaDevices.enumerateDevices(setAvailableDevices);
				selectSettings({
					unchanged: true,
					selectedAudioInputDevice: audioTrack?.deviceId,
					selectedCameraDevice: videoTrack?.deviceId
				})
			}
		} else {
			selectSettings(undefined);
		}
	}

return (
		<>
			<SettingsDialog />
			<Button type={settings ? "primary" : "secondary"} onClick={toggleSettings}>
				<FaCogs />Settings
			</Button>
		</>
	)
}
