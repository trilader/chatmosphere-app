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
	background: ${props => props.theme.input.default.bg};
  color: ${props => props.theme.text.default};
	border: 1px solid ${props => props.theme.line.dark};
  font-size: ${props => props.theme.fontSize.body};
	box-sizing: border-box;
	border-radius: ${props => props.theme.radius.small} 0 0 ${props => props.theme.radius.small};
  padding-left: 20px;
  width: 100%;
  &:hover {
    border: 1px solid ${props => props.theme.color['5']};
    &::placeholder {
      color: ${props => props.theme.color['5']};
    }
  }
  &:focus {
    outline: none;
    font-size:${props => props.theme.fontSize.body};
  }
  &::placeholder {
    font-size: ${props => props.theme.fontSize.body};
  }
  &:disabled {
    background-color: ${props => props.theme.base["3"]};
  }
`

const JoinButton = styled.input`
  height: 50px;
  background: ${props => props.theme.button.primary.bg};
  border-radius: 0 ${props => props.theme.radius.small} ${props => props.theme.radius.small} 0;
  width: 111px;
  color: ${props => props.theme.button.primary.fg};
  font-size: ${props => props.theme.fontSize.body};
  border: none;
  &:hover {
    background-color: ${props => props.theme.button.primary.bg_h};
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
