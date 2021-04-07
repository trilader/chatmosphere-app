
import styled from "styled-components"
import { InputField } from "../common/Input/InputField"

const Label = styled.label`
  font-size: ${props => props.theme.fontSize.small};
  color: ${props => props.theme.base['2']};
`


export const UserNameInputField = ({userName, handleUserChange}) => {
 return (
     <div>
        <Label htmlFor="userName">Set User Name</Label>       
        <InputField
        
        name="username"
        type="text"
        placeholder={userName}
        id="username"
        onChange={handleUserChange}
        >
        </InputField>
</div>
 )
}