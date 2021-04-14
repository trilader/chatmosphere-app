import styled from "styled-components";

export const InputField:any = styled.input`
  margin-top: 5px;
  padding: 8px 5px;
  border: 1px solid ${props => props.theme.primary['3']};
  border-radius: ${props => props.theme.radius};
  text-align: center;
  font-weight: 500;
  font-size: ${props => props.theme.fontSize.body};

  &:focus {
    outline: none;
    border: 1px solid ${props => props.theme.primary['3']};
  }
`;



export const Select = styled.select`
font-size: 1rem;
display: flex;
flex-direction: row;
align-items: center;
justify-content: center;
height: 50px;
width: 165px;
border-radius: 5px;
font-size:12px;
font-weight: normal;

& svg {
  margin-right: 5px;
}

&:hover {
  background-color: ${props => props.theme.base['4']};

}
&:active {
    background-color: ${props => props.theme.primary['4']};
}

&:focus {
  outline: none;
}
`



export const SelectDiv = styled.div`
font-size: 1rem;
display: flex;
flex-direction: row;
align-items: center;
justify-content: center;
height: 50px;
width: 165px;
border-radius: 5px;
font-size:12px;
font-weight: normal;





& svg {
  margin-right: 5px;
}

&:hover {
  background-color: ${props => props.theme.base['4']};



}
&:active {
    background-color: ${props => props.theme.primary['4']};


}

&:focus {
  outline: none;
}
`