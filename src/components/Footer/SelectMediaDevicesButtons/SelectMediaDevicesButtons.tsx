import React, { useEffect } from "react"
import { useConnectionStore } from "../../../store/ConnectionStore"
import { useLocalStore } from "../../../store/LocalStore";
import { Button } from "../../common/Buttons/Button";
import { Select, SelectDiv } from "../../common/Input/InputField";

export const SelectMediaDevicesButtons = ()=> {
    
    const [devices,setDevices] = React.useState<Array<any>>([])
    // const [activeAudio,setAudio] = React.useState< {deviceId: string | number, deviceLabel: string }>()

    const localstore = useLocalStore();
    const connectionStore = useConnectionStore();

    const updateDevices = () => {
        console.log("update Devices")
        connectionStore.jsMeet?.mediaDevices.enumerateDevices(setDevices);  
        // connectionStore.jsMeet!.getActiveAudioDevice().then(setAudio);
        // localstore.audio?.dispose().then(() => {

        //     connectionStore.jsMeet!.createLocalTracks({devices:['video','audio']},true)
        //     .then(tracks => {
        //         console.log(tracks);
        //         localstore.setLocalTracks(tracks)
        //     })    
        // }).then(() => console.log(localstore.audio?.track))
        
    }
    

    useEffect(()=>{
        console.log('using effect')
        updateDevices()
      },[])


    const selectVideo = (event:any) => {
        localstore.video?.dispose().then(() =>
        connectionStore
        .jsMeet!.createLocalTracks({devices:['video'], cameraDeviceId:event.target.value},true)
        .then(tracks => {
            localstore.setLocalTracks(tracks)
            })
        ).catch(error => console.error(error));
    }
    
    const selectAudio = (event:any) => {
        localstore.audio?.dispose().then(() =>
        connectionStore
        .jsMeet!.createLocalTracks({devices:['audio'], micDeviceId:event.target.value},true)
        .then(tracks => {
            localstore.setLocalTracks(tracks)
            })
        ).catch(error => console.error(error));
    }

    
    return (<>
        <Button onClick={() => updateDevices()}> update</Button>

        <SelectDiv>
        Video
        <Select  id="videos" name="videos" onChange={selectVideo}>
        {devices.filter((device) => device.kind ==='videoinput').map((device) => {return(<option value={device.deviceId}>{device.label}</option>)})}
        </Select>
        </SelectDiv>
        Audio
        <Select  id="audio" name="audio" onChange={selectAudio}>
        {devices.filter((device) => device.kind ==='audioinput').map((device) => {return(<option value={device.deviceId}>{device.label}</option>)})}
        </Select>
        </>
        )
}