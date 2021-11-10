// @ts-nocheck
import { useConferenceStore } from "../../../store/ConferenceStore"
import { useLocalStore } from "../../../store/LocalStore"
import { LinkButton } from "../../common/Buttons/Button"


export const ScreenshareButton = () => {
	const conferenceName = useConferenceStore(state => state.conferenceName)
	const userID = useLocalStore(state => state.id)

	let link = `/screenshare/${conferenceName}/${userID}`;
	

	const toggleScreenshare = () => {
		console.log("userId =", userID)
	}

	// return <Button onClick={() => toggleScreenshare()}>Screenshare</Button>
	return <LinkButton href={link} target="_blank">Screenshare</LinkButton>
	
}