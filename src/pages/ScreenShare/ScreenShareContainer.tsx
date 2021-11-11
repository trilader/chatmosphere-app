import { useCallback, useEffect, useState } from "react"
import { useConferenceStore } from "../../store/ConferenceStore"
import { useConnectionStore } from "../../store/ConnectionStore"
import { useParams } from 'react-router-dom'
import {IUser} from './../../store/ConferenceStore'
/**
   * TODO:
   * - Load JitsiMeet
   * - Connect to server 
   * - - disconnect on unmount
   * - IF connected is true:
   * - - Join Conference
   * - IF joined is true, check if a user with linkPrimary is in conference
   * - - IF user is in conference, set link to true
   * - - IF user is not in conference, set link to false
   * 
   * - IF link is false:
   * - - show message "you seem to be not in the conference"
   * - - disable share button with text "not connected"
   * - IF link is true && share is true:
   * - - set share button to active with text "stop sharing"
   * - - Create screen track
   * - - - IF track is created:
   * - - - - attach track to local video
   * - ELSE IF link is true && share is false:
   * - - set share button to off with text "share"
   * - - remove screen track

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
	const users = useConferenceStore(store => store.users)
	const {sessionName, linkPrimary} = useParams()

	const [linkedUser, setLinkedUser] = useState<IUser | undefined>(undefined)
	const [share, toggleShare] = useState(false)

	

	useEffect(function init() {
		initJitsiMeet()
	},[initJitsiMeet])

	useEffect(function connect() {
		if(!isConnected) connectToServer(sessionName) //REMOVE Session name in connectToServer!!!
		return function disconnect() {
			if(isConnected) disconnectFromServer()
		}
	},[sessionName, isConnected, connectToServer, disconnectFromServer])

	useEffect(function join() {
		if(isConnected && hasJoined === false) joinConference(sessionName)
	},[isConnected, hasJoined, sessionName, joinConference,])

	useEffect(function userExists()  {
		if(hasJoined && users[linkPrimary]) {
			setLinkedUser(users[linkPrimary])
		}
	},[hasJoined, users, linkPrimary])

	useEffect(function shareScreen() {
		const createDesktopTrack = () => {
			jitsiMeet
				?.createLocalTracks({ devices: ['desktop']}, true)
				.then(tracks => {
					
			}).catch(error => {

			})
		}
		if(share) {

		}
	},[share, jitsiMeet])

	return (
		<div>
			{!isConnected && `Not Connected`}
			{!hasJoined && `Conference ${sessionName} not Joined`}
			{!linkedUser && `You seem to be not in the Conference - UserID ${linkPrimary} not Found`}
			{linkedUser && "SHARE"}
		</div>
	)
}

// const DesktopTrack()