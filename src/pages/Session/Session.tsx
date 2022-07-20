import React from "react"
import ConnectedStage from "../../addons/Stage/Stage"
import { StageButton } from "../../addons/Stage/components/StageButton"
import { ErrorHandler } from "../../components/common/Info/ErrorHandler"
import { Info } from "../../components/common/Info/Info"
import { Footer } from "../../components/Footer/Footer"
import { JoinButton } from "../../components/Footer/JoinButton/JoinButton"
import { MuteButton } from "../../components/Footer/MuteButton/MuteButton"
import { Header } from "../../components/Header/Header"
import JitsiConnection from "../../components/JitsiConnection/JitsiConnection"
import { Localuser } from "../../components/User/Localuser/Localuser"
import { UserDragContainer } from "../../components/User/Localuser/LocalUserContainer"
import { PanWrapper } from "../../components/PanWrapper/PanWrapper"
import { Room } from "../../components/Room/Room"
import { Users } from "../../components/User/RemoteUser/Users"
import { LocalStoreLogic } from "../../store/LocalStoreLogic"
import Chat from "../../addons/Chat/Chat"
import { MoreTab } from "../../components/Footer/MoreTab/MoreTab"
import { LocationPanel } from "../../components/LocationPanel/LocationPanel"
import { ScreenSharing } from "../../components/Footer/ScreenSharing/ScreenSharing"
import { useConferenceStore } from "../../store/ConferenceStore"
import { useHistory, useParams } from "react-router-dom"
import { SettingsButton } from "../../components/Footer/SettingsButton/SettingsButton"
import { SettingsDialog } from "../../components/Footer/SettingsButton/SettingsDialog"

const Debug = () => {

	const conferenceStore = useConferenceStore();
	const history = useHistory()
	const {id} = useParams()
	React.useEffect(
		() => {
			console.log()
			if (/sphere/i.test(conferenceStore.displayName)){

				history.push(`/enter/${id}`)
			}


		}
		,[]
	)
	return (<></>)
}

export const Session = () => {
  return (
    <React.Fragment>
      <Info>
        Welcome to our Prototype
        <br />
        Please use <b>Chromium</b> or <b>Chrome</b> for now for a stable
        Experience
      </Info>
      <ErrorHandler />
      <Header></Header>
      <JitsiConnection />
      <LocalStoreLogic />
      <PanWrapper>
        <Room>
          <Users />
          <UserDragContainer>
            <Localuser audioRadius />
          </UserDragContainer>
        </Room>
      </PanWrapper>
      <Footer
        rightBox={[<Chat key="rB1"/>,<MoreTab key="rB2" />]}
        leftBox="Chatmosphere"
      >
        <StageButton />
				<ScreenSharing />
				<MuteButton />
				<SettingsButton />
        {/* upstream: <ScreenshareButton />*/}
        <JoinButton joined={true} />
      </Footer>
			{/* alug, obsolete: <ChatPanel />*/}
			<LocationPanel/>
      <SettingsDialog />
			<Debug></Debug>
      <ConnectedStage />
    </React.Fragment>
  )
}
