// @ts-nocheck
import { useEffect } from "react";
import { useConferenceStore } from "../../../store/ConferenceStore";
import { useConnectionStore } from "../../../store/ConnectionStore"
import { Button } from "../../common/Buttons/Button"
import { conferenceName } from "../../JitsiConnection/jitsiOptions";



const testTrack = (tracks, meet) => {
	console.log("Trackobject", tracks[0])
	// that works nicely !!
	tracks[0].addEventListener(
		// @ts-ignore
		JitsiMeetJS?.events.track.LOCAL_TRACK_STOPPED,
		() => console.log("LOCAL_TRACK_STOPPED", tracks)
	);
	
	}

export const ScreenshareButton = () => {
	let jsMeet = useConnectionStore(state => state.jsMeet)
	const connection = useConnectionStore(state => state.connection)
	let conferenceObject = useConferenceStore(state => state.conferenceObject)
	
	const setTrack = (tracks) => {
		const track = tracks[0]
		track.addEventListener(
			window.JitsiMeetJS?.events.track.LOCAL_TRACK_STOPPED,() => console.log("LOCAL_TRACK_STOPPED", tracks)
		)
		// tracks[0].track.onended = () => console.log("Track onended") //chrome #and firefox getting that event (Safari is not :(
		// tracks[0].track.onmute = () => console.log("Track onmuted") //Safari Event
		const videoTrack = conferenceObject?.getLocalTracks().find(track => track.getType() === "video")
		console.log("videoTrack", videoTrack);
		conferenceObject?.replaceTrack(videoTrack, track)
	}

	const toggleScreenshare = (meet) => {
		console.clear()
		meet.createLocalTracks({ devices: [ 'desktop' ] }, true)
		.then((tracks) => setTrack(tracks))
		.catch(error => {
			console.log(error)
		});
	}

	return <Button onClick={() => toggleScreenshare(jsMeet)}>Screenshare</Button>
}