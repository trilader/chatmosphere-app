import * as React from "react"
import styled from "styled-components"
import { useLocalStore } from "../../../store/LocalStore"
import { checkLocalStorageBool, useConnectionStore } from "../../../store/ConnectionStore"
import { Button } from "../../common/Buttons/Button"
import produce from "immer"
import { useConferenceStore } from "../../../store/ConferenceStore"
import { jitsiInitOptions } from "../../JitsiConnection/jitsiOptions"

const StyleBox = styled.div`
  user-select: none;
	padding: 15px 25px;
	position: fixed;
	bottom: 72px;
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
  color: ${props => props.theme.color.primary};
  border: 1px solid ${props => props.theme.line.default};
  background-color: ${props => props.theme.base['5']};
  font-weight: normal;

  &:hover {
    background-color: ${props => props.theme.base['4']};
  }
  &:active {
		background-color: ${props => props.theme.base['5']};
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
	const houstonWeNeedAReload = useLocalStore(store => store.houstonWeNeedAReload)
	const needsReload = useLocalStore(store => store.needsReload)

	function showReloadMessage() {
		if (settings) {
			houstonWeNeedAReload();
		}
	}

	function saveSettings() {
		if (settings) {
			if (settings.audioProcessingEnabled !== undefined) {
				localStorage.setItem("jitsiAudioProcessingEnabled", settings.audioProcessingEnabled ? "true" : "false");
				showReloadMessage();
			}
			if (settings.echoCancellationEnabled !== undefined) {
				localStorage.setItem("jitsiEchoCancellationEnabled", settings.echoCancellationEnabled ? "true" : "false");
				showReloadMessage();
			}
			if (settings.noiseSuppressionEnabled !== undefined) {
				localStorage.setItem("jitsiNoiseSuppressionEnabled", settings.noiseSuppressionEnabled ? "true" : "false");
				showReloadMessage();
			}
			if (settings.autoGainEnabled !== undefined) {
				localStorage.setItem("jitsiAutoGainEnabled", settings.autoGainEnabled ? "true" : "false");
				showReloadMessage();
			}
			if (settings.stereoEnabled !== undefined) {
				localStorage.setItem("jitsiStereoEnabled", settings.stereoEnabled ? "true" : "false");
				showReloadMessage();
			}
		}
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

	function onAutoGainChanged(event) {
		if (settings) {
			selectSettings(produce(settings, newSettings => {
				newSettings.unchanged = false;
				newSettings.autoGainEnabled = event.target.checked;
			}));
		}
	}

	function onNoiseSuppressionChanged(event) {
		if (settings) {
			selectSettings(produce(settings, newSettings => {
				newSettings.unchanged = false;
				newSettings.noiseSuppressionEnabled = event.target.checked;
			}));
		}
	}

	function onEchoCancellationChanged(event) {
		if (settings) {
			selectSettings(produce(settings, newSettings => {
				newSettings.unchanged = false;
				newSettings.echoCancellationEnabled = event.target.checked;
			}));
		}
	}

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
		let audioProcessingChecked = checkLocalStorageBool("jitsiAudioProcessingEnabled")
		if (settings.audioProcessingEnabled !== undefined) {
			audioProcessingChecked = settings.audioProcessingEnabled;
		} else if (audioProcessingChecked === null) {
			audioProcessingChecked = !jitsiInitOptions.disableAP;
		}
		let echoCancellationChecked = checkLocalStorageBool("jitsiEchoCancellationEnabled");
		if (settings.echoCancellationEnabled !== undefined) {
			echoCancellationChecked = settings.echoCancellationEnabled;
		} else if (echoCancellationChecked === null) {
			echoCancellationChecked = !jitsiInitOptions.disableAEC;
		}
		let noiseSuppressionChecked = checkLocalStorageBool("jitsiNoiseSuppressionEnabled");
		if (settings.noiseSuppressionEnabled !== undefined) {
			noiseSuppressionChecked = settings.noiseSuppressionEnabled;
		} else if (noiseSuppressionChecked === null) {
			noiseSuppressionChecked = !jitsiInitOptions.disableNS;
		}
		let autoGainChecked = checkLocalStorageBool("jitsiAutoGainEnabled");
		if (settings.autoGainEnabled !== undefined) {
			autoGainChecked = settings.autoGainEnabled;
		} else if (autoGainChecked === null) {
			autoGainChecked = !jitsiInitOptions.disableAGC;
		}
		let stereoChecked = checkLocalStorageBool("jitsiStereoEnabled");
		if (settings.stereoEnabled !== undefined) {
			stereoChecked = settings.stereoEnabled;
		} else if (stereoChecked === null) {
			stereoChecked = jitsiInitOptions.audioQuality?.stereo === true;
		}
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
				<div>
					<input id="autogainCheckbox" type="checkbox" onChange={onAutoGainChanged} checked={autoGainChecked} />
					<label htmlFor="autogainCheckbox">Auto gain?</label>
					<br />
					<input id="noiseCheckbox" type="checkbox" onChange={onNoiseSuppressionChanged} checked={noiseSuppressionChecked} />
					<label htmlFor="noiseCheckbox">Noise suppression?</label>
					<br />
					<input id="echocancelCheckbox" type="checkbox" onChange={onEchoCancellationChanged} checked={echoCancellationChecked} />
					<label htmlFor="echocancelCheckbox">Echo cancellation?</label>
					<br />
					{
						needsReload
							? <span style={{ display: "inline-block", fontWeight: "bold", color: "#a41a1a", paddingTop: ".5em" }}>Please reload to apply the settings</span>
							: <></>
					}
				</div>
				<div style={{ paddingTop: "1em" }}>
					<Button primary style={{ display: "inline-block" }} onClick={saveSettings} label={settings?.unchanged ? "Maybe fix a video?" : "Save"} />
				</div>
			</StyleBox>
		)
	}
}
