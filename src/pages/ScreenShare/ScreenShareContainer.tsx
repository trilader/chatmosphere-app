import { useCallback, useEffect, useState } from "react"
import { useConferenceStore } from "../../store/ConferenceStore"
import { useConnectionStore } from "../../store/ConnectionStore"
import { useParams } from 'react-router-dom'
import {IUser} from './../../store/ConferenceStore'
import { useLocalStore } from "../../store/LocalStore"
import { ScreenShareVideo } from "./ScreenShareVideo"
/**
   * TODO:
   * √ Load JitsiMeet
   * √ Connect to server 
   * 	√ disconnect on unmount
   * √ IF connected is true:
   * 	√ Join Conference
   * √ IF joined is true, check if a user with linkPrimary is in conference
   * 	√ IF user is in conference, set link to userObject
	 * 		√ TODO: Add event listener to remove if user leaves
   * 	√ IF user is not in conference, set link to undefined
   * 
   * √ IF link is undefined:
   * 	√ show message "you seem to be not in the conference"
	 * 	[] remove Screen Track / dispose if track exits
   * √ IF link is true && share is true:
   * 	√ set share button to active with text "stop sharing"
   * 	√ Create Desktop-Track on Jitis
   * 		√ IF track is created:
	 * 			√ attach track to local video
   * √ ELSE IF link is true && share is false:
   * 	√ set share button to off with text "share"
   * 	√ remove screen track

   */

const getInit = state => state.initJitsiMeet

export const ScreenShareContainer = () => {
	const jitsiMeet = useConnectionStore(store => store.jsMeet)
	const initJitsiMeet = useConnectionStore(useCallback(state => state.initJitsiMeet,[]))
	const connectToServer = useConnectionStore(useCallback(store => store.connectServer,[]))
	const disconnectFromServer = useConnectionStore(useCallback(store => store.disconnectServer,[]))
	const isConnected = useConnectionStore(store => store.connected)
	const conference = useConferenceStore(store => store.conferenceObject)
	const joinConference = useConferenceStore(useCallback(store => store.init,[]))
	const leaveConference = useConferenceStore(useCallback(store => store.leave,[]))
	const hasJoined = useConferenceStore(store => store.isJoined)
	const setLocalTracks = useLocalStore(useCallback(store => store.setLocalTracks, []))
	const clearScreenTrack = useLocalStore(useCallback(store => store.clearScreenTrack, []))
	const track = useLocalStore(store => store.desktop)
	const users = useConferenceStore(store => store.users)
	const {sessionName, linkPrimary} = useParams()

	const [linkedUser, setLinkedUser] = useState<IUser | undefined>(undefined)
	const [share, toggleShare] = useState(false)

	const connectionReady = () => isConnected && !hasJoined
	
	//init jitsi meet
	useEffect(function init() {
		initJitsiMeet()
	},[initJitsiMeet])

	// connect to server
	useEffect(function connect() {
		if(!isConnected) connectToServer()
		return function disconnect() {
			if(isConnected) disconnectFromServer()
		}
	},[sessionName, isConnected, connectToServer, disconnectFromServer])

	// join conference; #FIXME hasJoined is Promise, so this could be called multiple times
	useEffect(function join() {
		if(isConnected && hasJoined === false) joinConference(sessionName)
	},[isConnected, hasJoined, sessionName, joinConference])

	useEffect(() => {
		if(conference) conference?.setLocalParticipantProperty("linkedUser", linkPrimary);	
	},[conference, linkPrimary])

	// if joined check if primaryLink user is in conference - else leave?
	useEffect(function userExists()  {
		if(hasJoined && users[linkPrimary]) {
			setLinkedUser(users[linkPrimary])
		} 
		if(hasJoined && !users[linkPrimary]) {
			//cleanup
			if (linkedUser) setLinkedUser(undefined)
			if (track) clearScreenTrack()
		}
	},[hasJoined, users, linkPrimary, conference, jitsiMeet, linkedUser, track, clearScreenTrack])

	// eventListener for other users leaving conference
	useEffect(function getUserLeaving() {
		const onLeave = (e) => {if(e.user.id === linkPrimary) setLinkedUser(undefined)}
		conference?.on(jitsiMeet?.events.conference.USER_LEFT, onLeave)
		return function removeListener() {
			conference?.off(jitsiMeet?.events.conference.USER_LEFT, onLeave)
		}
	}, [conference, jitsiMeet?.events.conference.USER_LEFT, linkPrimary])

	// create screen track
	useEffect(function shareScreen() {
		const createDesktopTrack = () => {
			jitsiMeet
				?.createLocalTracks({ devices: ['desktop']}, true) //just creates the local tracks
				.then(tracks => {
					setLocalTracks(tracks)
			}).catch(error => {
				console.error(error)
			})
		}
		if(share && !track) {
			createDesktopTrack()
		}
		if(!share && track) {
			clearScreenTrack()
		}
	},[share, jitsiMeet, setLocalTracks, clearScreenTrack, track])

	return (
		<div>
			{!isConnected && <div>Not Connected</div>}
			{!hasJoined && <div>Conference {sessionName} not Joined</div>}
			{!linkedUser && <div>You seem to be not in the Conference - UserID {linkPrimary} not Found</div>}
			{linkedUser && !share && <button onClick={() => toggleShare(true)}>share</button>}
			{linkedUser && share && <button onClick={() => toggleShare(false)}>stop sharing</button>}
			{track && <ScreenShareVideo track={track} /> }
		</div>
	)
}