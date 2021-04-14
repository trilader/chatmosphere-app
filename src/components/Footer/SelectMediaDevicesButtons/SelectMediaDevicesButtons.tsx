import React from "react"
import { useConnectionStore } from "../../../store/ConnectionStore"
import { Select } from "../../common/Input/InputField";

export const SelectMediaDevicesButtons = ()=> {
    
    const [devices,setDevices] = React.useState<Array<any>>([])
    const [activeAudio,setAudio] = React.useState< {deviceId: string | number, deviceLabel: string }>()


    const connectionStore = useConnectionStore();

    connectionStore.jsMeet?.getActiveAudioDevice().then(setAudio)
    connectionStore.jsMeet?.mediaDevices.enumerateDevices(setDevices)


    
    return (<>
        {activeAudio?.deviceId}
        <Select  id="videos" name="videos">
        {devices.filter((device) => device.kind ==='videoinput').map((device) => {return(<option value={device.deviceId}>{device.label}</option>)})}
        </Select>
        <Select  id="audio" name="audio" >
        {devices.filter((device) => device.kind ==='audioinput').map((device) => {return(<option value={device.deviceId}>{device.label}</option>)})}
        </Select>
        </>
        )
}