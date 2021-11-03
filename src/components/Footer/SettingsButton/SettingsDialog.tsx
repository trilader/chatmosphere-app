import * as React from "react"
import styled, { css } from "styled-components"
import { useLocalStore } from "../../../store/LocalStore"
import { useConnectionStore } from "../../../store/ConnectionStore"
import { Button } from "../../common/Buttons/Button"
import produce from "immer"
import { Track, useConferenceStore } from "../../../store/ConferenceStore"

const StyleBox = styled.div`
  user-select: none;
	padding: 15px 25px;
	position: fixed;
	bottom: 100%;
	margin: 10px auto;
	left: 50%;
	transform: translateX(-50%);
	font-size: 0.9rem;
	font-weight: normal;
	background-color: #fff;
	border-radius: 5px;
	box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  z-index: 10001;
	color: #555;
	b {
		color: #000;
	}
  &:hover {
    background-color: #fefefe;
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.7);
  }
`

const Select = styled.select`
  font-size: 1rem;
  display: flex;
	flex-direction: row;
	align-items: center;
  justify-content: center;
	height: 50px;
  width: 285px;
  border-radius: 5px;
	padding-left: 5px;
	padding-right: 5px;
  color: ${props => props.theme.primary['1']};
  border: 1px solid ${props => props.theme.primary['1']};
  background-color: ${props => props.theme.base['5']};
  font-weight: normal;

  &:hover {
    background-color: ${props => props.theme.base['4']};
  }
  &:active {
		background-color: ${props => props.theme.primary['5']};
  }
  
  &:focus {
    outline: none;
  }
`

type DeviceSelectParams = {
	currentDeviceId: string
	deviceFilter: MediaDeviceKind
	onChange: (event) => void
}

function DeviceSelect(opts: DeviceSelectParams) {
	const availableDevices = useLocalStore(store => store.availableDevices)
	const filteredDevices = availableDevices.filter(value => value.kind === opts.deviceFilter)

	if (filteredDevices.length === 0) {
		return null
	} else {
		const options = filteredDevices.map(deviceInfo =>
			<option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>{deviceInfo.label}</option>
		)
		return (
			<div style={{ padding: "0.5em", marginBottom: "1em" }}>
				<Select value={opts.currentDeviceId} onChange={opts.onChange}>
					{options}
				</Select>
			</div>
		)
	}
}

export const SettingsDialog = () => {
	const jsMeet = useConnectionStore(store => store.jsMeet)
	const conference = useConferenceStore(state => state.conferenceObject)
	const setMicAndCamera = useLocalStore(store => store.setMicAndCamera)
	const settings = useLocalStore(store => store.settings)
	const selectSettings = useLocalStore(store => store.selectSettings)
	const audioTrack = useLocalStore(store => store.audio)
	const videoTrack = useLocalStore(store => store.video)

	function saveSettings() {
		if (jsMeet && settings) {
			if (settings.selectedAudioOutputDevice) {
				jsMeet.mediaDevices.setAudioOutputDevice(settings.selectedAudioOutputDevice);
			}
			let options: any = {
				devices: ["audio", "video"],
			}
			if (settings.selectedAudioInputDevice) {
				options.micDeviceId = settings.selectedAudioInputDevice;
			}
			if (settings.selectedCameraDevice) {
				options.cameraDeviceId = settings.selectedCameraDevice;
			}
			jsMeet.createLocalTracks(options)
				.then(async (tracks) => {
					const camTrack = tracks.find(t => t.getType() === "video");
					if (videoTrack && camTrack) {
						if (videoTrack.isMuted()) {
							camTrack.mute();
						}
						await conference?.replaceTrack(videoTrack, camTrack);
						//await videoTrack.dispose();
					} else if (!videoTrack && camTrack) {
						await conference?.addTrack(camTrack)
					}
					const micTrack = tracks.find(t => t.getType() === "audio");
					if (audioTrack && micTrack) {
						if (audioTrack.isMuted()) {
							micTrack.mute();
						}
						await conference?.replaceTrack(audioTrack, micTrack);
						//await audioTrack.dispose();
					} else if (!audioTrack && micTrack) {
						await conference?.addTrack(micTrack)
					}
					setMicAndCamera(micTrack, camTrack)
				})
				.catch(err => {
					console.error(err);
					selectSettings({error: err});
				})
		}
	}

	function onCameraChanged(event) {
		if (settings) {
			selectSettings(produce(settings, newSettings => {
				newSettings.unchanged = false;
				newSettings.selectedCameraDevice = event.target.value;
			}));
		}
	}

	function onAudioInputChanged(event) {
		if (settings) {
			selectSettings(produce(settings, newSettings => {
				newSettings.unchanged = false;
				newSettings.selectedAudioInputDevice = event.target.value;
			}));
		}
	}

	// function onAudioOutputChanged(event) {
	// 	if (settings) {
	// 		selectSettings(produce(settings, newSettings => {
	// 			newSettings.unchanged = false;
	// 			newSettings.selectedAudioOutputDevice = event.target.value;
	// 		}));
	// 	}
	// }

	if (!settings) {
		return null
	} else if (settings.error) {
		let stacktrace = settings.error.stack.toString().trim()
		return (
			<StyleBox>
				<textarea value={stacktrace ? stacktrace : settings.error.toString()} readOnly={true} rows={10} cols={80} />
			</StyleBox>
		)
	} else {
		let cameraDeviceSelect: JSX.Element | null = null;
		let currentCamDeviceId = videoTrack?.deviceId;
		if (settings.selectedCameraDevice) {
			currentCamDeviceId = settings.selectedCameraDevice;
		}
		if (currentCamDeviceId) {
			cameraDeviceSelect = <DeviceSelect currentDeviceId={currentCamDeviceId}
																				 deviceFilter="videoinput"
																				 onChange={onCameraChanged} />
		}
		let audioInputDeviceSelect: JSX.Element | null = null;
		let currentMicDeviceId = audioTrack?.deviceId;
		if (settings.selectedAudioInputDevice) {
			currentMicDeviceId = settings.selectedAudioInputDevice;
		}
		if (currentMicDeviceId) {
			audioInputDeviceSelect = <DeviceSelect currentDeviceId={currentMicDeviceId}
																						 deviceFilter="audioinput"
																						 onChange={onAudioInputChanged} />
		}
		// let audioOutputDeviceSelect: JSX.Element | null = null;
		// let currentAudioOutDeviceId: string | undefined = undefined;
		// if (jsMeet) {
		// 	currentAudioOutDeviceId = jsMeet.mediaDevices.getAudioOutputDevice();
		// }
		// if (settings.selectedAudioInputDevice) {
		// 	currentAudioOutDeviceId = settings.selectedAudioInputDevice;
		// }
		// if (currentAudioOutDeviceId) {
		// 	audioOutputDeviceSelect = <DeviceSelect currentDeviceId={currentAudioOutDeviceId}
		// 																					deviceFilter="audiooutput"
		// 																					onChange={onAudioOutputChanged} />
		// }
		return (
			<StyleBox>
				<div>
					Current camera device: <span>{JSON.stringify(videoTrack?.track.label)}</span>
					{cameraDeviceSelect}
				</div>
				<div>
					Current audio input device: <span>{JSON.stringify(audioTrack?.track.label)}</span>
					{audioInputDeviceSelect}
				</div>
				{/* should, but just doesn't work… */}
				{/*<div>*/}
				{/*	Current audio output device: <span>{JSON.stringify(jsMeet?.mediaDevices.getAudioOutputDevice())}</span>*/}
				{/*	{audioOutputDeviceSelect}*/}
				{/*</div>*/}
				<div style={{ paddingTop: '1em' }}>
					<Button style={{ display: "inline-block" }} onClick={saveSettings}>{settings?.unchanged ? "Maybe fix a video?" : "Save"}</Button>
				</div>
			</StyleBox>
		)
	}
}
