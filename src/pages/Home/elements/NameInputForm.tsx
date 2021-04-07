import * as React from 'react'
import styled from 'styled-components'
import { setConstantValue } from 'typescript'
import { Info } from '../../../components/common/Info/Info'
import { UserNameInputField } from '../../../components/UserNameInputField/UserNameInputField'
// import create from 'zustand'

const Form = styled.form`
  width: 340px;
  margin: auto;
  text-align: left;
`
const Fieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 10px 0 0 0;
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  font-size: ${props => props.theme.fontSize.small};
  color: ${props => props.theme.base['2']};
`

const InputField = styled.input`
	height: 50px;
	background: ${props => props.theme.base['4']};
  color: ${props => props.theme.primary['1']};
	border: 1px solid ${props => props.theme.primary['1']};
  font-size: 1rem;
	box-sizing: border-box;
	border-radius: ${props => props.theme.radius} 0 0 ${props => props.theme.radius};
  padding-left: 20px;
  width: 100%;
  &:hover {
    background: ${props => props.theme.base['5']};
  }
  &:focus {
    outline: none;
    font-size:1rem;
  }
  &::placeholder {
    font-size: 1rem;
  }
  &:disabled {
    background-color: ${props => props.theme.base["3"]};
  }
`

const JoinButton = styled.input`
  height: 50px;
  background: ${props => props.theme.primary['2']};
  border-radius: 0 ${props => props.theme.radius} ${props => props.theme.radius} 0;
  width: 111px;
  color: ${props => props.theme.base['6']};
  font-size: 1rem;
  border: none;
  &:hover {
    background-color: ${props => props.theme.primary['3']};
  }
`

const InfoBubble = styled(Info)`

`

export const NameInputForm = ({ defaultSessionName, onSubmit, handleChange, handleUserChange, userName}) => {
  // navigator.mediaDevices.enumerateDevices().then(console.log);
  const [devices, setDevices] = React.useState<Array<any>>([])

  const constraints  = {
    audio: false,
    video: true
    };
  if (devices.length===0){
    navigator.mediaDevices.enumerateDevices().then((res:Array<MediaDeviceInfo>) => {
      setDevices(res)
    });
  }

	return (
		<Form onSubmit={onSubmit}>
			{/* <Label htmlFor="sessionName">Set Session Name</Label> */}
			<Fieldset>
        <UserNameInputField userName={userName} handleUserChange={handleUserChange}></UserNameInputField>
        {/* <Label htmlFor="choosecamera">Choose camera </Label>
        <select name="camera" id="camera">
          {  devices.map(v => <option key={v.devideId} value={v.deviceId}> {v.label} </option>)}
        </select> */}
        <Label htmlFor="sessionName">Set Session Name</Label>
				<InputField
					name="sessionName"
					type="text"
          placeholder={defaultSessionName}
					onChange={handleChange}
          id="sessionName"
          disabled={process.env.REACT_APP_DEMO_SESSION ? true : false}
				/>
				<JoinButton name="joinButton" type="submit" value="Join" />
			</Fieldset>
        {process.env.REACT_APP_DEMO_SESSION && <InfoBubble>Only Demo Session Available</InfoBubble>}
		</Form>
	)
}
