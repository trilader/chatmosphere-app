/* global $, JitsiMeetJS */

const options = {
  hosts: {
     domain: 'jitsi.schroedingers-bit.net',
     muc: 'conference.jitsi.schroedingers-bit.net', 
     focus: 'focus.jitsi.schroedingers-bit.net',
     anonymousdomain: 'guest.jitsi.schroedingers-bit.net',
  },
  externalConnectUrl: 'https://jitsi.schroedingers-bit.net/http-pre-bind', 
  bosh: `https://jitsi.schroedingers-bit.net/http-bind`, 
  clientNode: 'http://jitsi.org/jitsimeet', 
};

let [roomName, name, linkPrimary] = location.hash.substr(1).split('/');
console.log("room: " + roomName);
console.log("name: " + name);
console.log("linkPrimary: " + linkPrimary);

const confOptions = {
    openBridgeChannel: true
};

let connection = null;
let isJoined = false;
let isConnected = false;
let room = null;

let localTrack = null;

function stopSharing() {
    if (localTrack !== null) {
        localTrack.dispose();
    }
    room.leave();
    isJoined = false;
}

function onLocalTrackStopped(oldTrack) {
    if (oldTrack === localTrack) {
        console.log('local track stopped');
        localTrack = null;
        room.leave();
        isJoined = false;
    } else {
        console.log('old local track stopped');
    }
}

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
function onLocalTracks(tracks) {
    localTrack = tracks[0];
    if (localTrack.getType() !== 'video') {
        alert('Got a non video track');
        return;
    }

    let oldTrack = localTrack;
    localTrack.addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => onLocalTrackStopped(oldTrack));
    $('body').append(`<video autoplay='1' id='localVideo' />`);
    localTrack.attach($(`#localVideo`)[0]);
    //if (isJoined) {
    //    room.addTrack(localTrack);
    //}
    if (isConnected && !isJoined) {
        room.join();
    }
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined() {
    console.log('conference joined!');
    if (linkPrimary) {
        room.sendCommand('link', { value: JSON.stringify({id: room.myUserId(), main: linkPrimary}) });
    }
    isJoined = true;
    if (localTrack !== null) {
        room.addTrack(localTrack);
    }
}


function connectToRoom() {
    room = connection.initJitsiConference(roomName, confOptions);
    room.setDisplayName(name);
    room.on(
        JitsiMeetJS.events.conference.CONFERENCE_JOINED,
        onConferenceJoined);
    room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
        console.log('user join');
    });
    room.on(JitsiMeetJS.events.conference.USER_LEFT, id => {
        if (id === linkPrimary) {
            console.log('link primary left, leaving as well');
            stopSharing();
        }
    });

    isConnected = true;
    if (localTrack !== null) {
        room.join();
    }
}

/**
 * That function is called when connection is established successfully
 */
function onConnectionSuccess() {
    connectToRoom();
}

/**
 * This function is called when the connection fail.
 */
function onConnectionFailed() {
    console.error('Connection Failed!');
}

/**
 * This function is called when the connection fail.
 */
function onDeviceListChanged(devices) {
    console.info('current devices', devices);
}

/**
 * This function is called when we disconnect.
 */
function disconnect() {
    console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        onConnectionSuccess);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        disconnect);
}

/**
 *
 */
function unload() {
    if (localTrack !== null) {
        localTrack.dispose();
    }
    room.leave();
    connection.disconnect();
}

/**
 *
 */
async function switchVideo() {
    tracks = await JitsiMeetJS.createLocalTracks({
        devices: [ 'desktop' ]
    });
    if (localTrack !== null) {
        let oldTrack = localTrack;
        localTrack = null;
        await oldTrack.dispose();
    }
    localTrack = tracks[0];
    let oldTrack = localTrack;
    localTrack.addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => onLocalTrackStopped(oldTrack));
    localTrack.attach($('#localVideo')[0]);
    if (isJoined) {
        room.addTrack(localTrack);
    } else {
        console.log("rejoining with new track");
        connectToRoom();
    }
}

$(window).bind('beforeunload', unload);
$(window).bind('unload', unload);

JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
const initOptions = {
    disableAudioLevels: true
};

JitsiMeetJS.init(initOptions);

connection = new JitsiMeetJS.JitsiConnection(null, null, options);

connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess);
connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed);
connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect);

JitsiMeetJS.mediaDevices.addEventListener(
    JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
    onDeviceListChanged);

connection.connect();

window.onload = () => {

    try {
        JitsiMeetJS.createLocalTracks({ devices: [ 'desktop' ] })
            .then(onLocalTracks)
            .catch(error => {
                var elem = document.createElement('div');
                elem.innerText = "click to start";

                elem.style.cssText = 'position:absolute; width:100%; height:100%; z-index:100; background: rgba(0, 0, 0, 0.3) none repeat scroll 0% 0%; top: 0px; left: 0px; text-align: center; vertical-align: middle; padding: 60pt;';
                document.body.appendChild(elem);

                elem.onclick = () => {
                    document.body.removeChild(elem);
                    JitsiMeetJS.createLocalTracks({ devices: [ 'desktop' ] })
                        .then(onLocalTracks)
                        .catch(error => {
                            throw e;
                        });

                }
            });
    } catch (e) {
    }

}
