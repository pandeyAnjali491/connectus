import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/VideoMeet.module.css";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'

const server_url = "http://localhost:8000";
var connections = {};
const peerConfigConnections = {
    "iceServers": [
        {
            "urls": "stun:stun.l.google.com:19302"
        }
    ]
}
export default function VideoMeet() {
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setShowModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    let routeTo = useNavigate();
    // if(isChrome()===false){

    // }
    const iceCandidateQueue = {};

    const getPermissions = async () => {
        try {
            // Try to get both video and audio
            let userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(true);
            setAudioAvailable(true);
            console.log('Video and audio permission granted');

            if (userMediaStream) {
                window.localStream = userMediaStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userMediaStream;
                }
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
        } catch (error) {
            console.log('Error getting both permissions:', error);

            // Fallback 1: try video only
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setVideoAvailable(true);
                setAudioAvailable(false);
                console.log('Video permission granted (audio denied)');

                if (videoStream && localVideoRef.current) {
                    window.localStream = videoStream;
                    localVideoRef.current.srcObject = videoStream;
                }

                if (navigator.mediaDevices.getDisplayMedia) {
                    setScreenAvailable(true);
                } else {
                    setScreenAvailable(false);
                }
            } catch (videoError) {
                console.log('Video permission denied, trying audio only:', videoError);

                // Fallback 2: try audio only
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    setVideoAvailable(false);
                    setAudioAvailable(true);
                    console.log('Audio permission granted (video denied)');

                    if (audioStream) {
                        window.localStream = audioStream;
                    }

                    if (navigator.mediaDevices.getDisplayMedia) {
                        setScreenAvailable(true);
                    } else {
                        setScreenAvailable(false);
                    }
                } catch (audioError) {
                    console.log('Audio permission also denied:', audioError);
                    setVideoAvailable(false);
                    setAudioAvailable(false);
                }
            }
        }
    };
    function createPeerConnection(socketId) {

        const pc = new RTCPeerConnection(peerConfigConnections);

        pc.onicecandidate = function (event) {
            if (event.candidate != null) {
                socketRef.current.emit(
                    "signal",
                    socketId,
                    JSON.stringify({ ice: event.candidate })
                );
            }
        };

        pc.onaddstream = (event) => {

            let videoExists = videoRef.current.find(
                video => video.socketId === socketId
            );

            if (videoExists) {

                setVideos(videos => {
                    const updated = videos.map(video =>
                        video.socketId === socketId
                            ? { ...video, stream: event.stream }
                            : video
                    );

                    videoRef.current = updated;
                    return updated;
                });

            } else {

                let newVideo = {
                    socketId,
                    stream: event.stream
                };

                setVideos(videos => {
                    const updated = [...videos, newVideo];
                    videoRef.current = updated;
                    return updated;
                });
            }
        };

        // ADD LOCAL STREAM
        if (window.localStream) {
            pc.addStream(window.localStream);
        } else {
            let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            pc.addStream(window.localStream);
        }

        return pc;
    }

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess = (stream) => {

        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {

            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {

                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit(
                            "signal",
                            id,
                            JSON.stringify({
                                sdp: connections[id].localDescription
                            })
                        );
                    });
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {

            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }

            let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {

                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {

                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit(
                                "signal",
                                id,
                                JSON.stringify({
                                    sdp: connections[id].localDescription
                                })
                            );
                        });
                });
            }
        });
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement('canvas'), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }
    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => {

                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else {
            try {
                if (localVideoRef.current && localVideoRef.current.srcObject) {
                    let tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach((track) => {
                        track.stop();
                    });
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);


    let gotMessageFromServer = (fromId, message) => {

        var signal = JSON.parse(message);

        if (fromId === socketIdRef.current) return;

        if (!connections[fromId]) {
            connections[fromId] = createPeerConnection(fromId);
        }

        if (signal.sdp) {

            connections[fromId]
                .setRemoteDescription(
                    new RTCSessionDescription(signal.sdp)
                )
                .then(() => {

                    if (signal.sdp.type === "offer") {

                        connections[fromId]
                            .createAnswer()
                            .then((description) => {

                                connections[fromId]
                                    .setLocalDescription(description)
                                    .then(() => {

                                        socketRef.current.emit(
                                            "signal",
                                            fromId,
                                            JSON.stringify({
                                                sdp: connections[fromId].localDescription
                                            })
                                        );
                                    });
                            });
                    }
                });
        }

        if (signal.ice) {
            connections[fromId]
                .addIceCandidate(
                    new RTCIceCandidate(signal.ice)
                )
                .catch(e => console.log(e));
        }
    };


    let connectToSocketServer = () => {
        if (socketRef.current) return;
        socketRef.current = io.connect(server_url, { secure: false })
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on("connect", () => {
            const roomId = new URL(window.location.href).pathname;
            socketRef.current.emit("join-call", roomId);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);
            socketRef.current.on("user-left", (id) => {
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
                setVideos(videos => videos.filter((video) => video.socketId !== id));
            });
            socketRef.current.on("user-joined", (id, clients) => {

                clients.forEach(socketListId => {

                    connections[socketListId] =
                        createPeerConnection(socketListId);
                });

                if (id === socketIdRef.current) {

                    for (let id2 in connections) {

                        if (id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then(description => {

                            connections[id2]
                                .setLocalDescription(description)
                                .then(() => {

                                    socketRef.current.emit(
                                        "signal",
                                        id2,
                                        JSON.stringify({
                                            sdp: connections[id2].localDescription
                                        })
                                    );
                                });
                        });
                    }
                }
            });
        });
    }
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }
    let handleVideo = () => {

        if (video) {
            // TURN OFF CAMERA → send black stream
            let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {

                connections[id].addStream(window.localStream);

                connections[id].createOffer().then(description => {
                    connections[id]
                        .setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit(
                                "signal",
                                id,
                                JSON.stringify({
                                    sdp: connections[id].localDescription
                                })
                            );
                        });
                });
            }

            setVideo(false);

        } else {
            // TURN ON CAMERA again
            setVideo(true);
        }
    }

    let handleAudio = () => {
        setAudio(!audio);
    }
    let getDisplayMediaSuccess = (stream) => {

        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { }

        // set local preview
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        // SEND SCREEN STREAM TO ALL USERS
        for (let id in connections) {

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then(description => {

                connections[id]
                    .setLocalDescription(description)
                    .then(() => {

                        socketRef.current.emit(
                            "signal",
                            id,
                            JSON.stringify({
                                sdp: connections[id].localDescription
                            })
                        );
                    });
            });
        }

        // when screen share stops
        stream.getTracks().forEach(track => track.onended = () => {

            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }

            // send black screen first
            let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {

                connections[id].addStream(window.localStream);

                connections[id].createOffer().then(description => {

                    connections[id]
                        .setLocalDescription(description)
                        .then(() => {

                            socketRef.current.emit(
                                "signal",
                                id,
                                JSON.stringify({
                                    sdp: connections[id].localDescription
                                })
                            );
                        });
                });
            }

            // restore camera
            getUserMedia();
        });
    }

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    }
    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }
    let getVideoGridStyle = () => {
        const videoCount = videos.length;
        if (videoCount === 0) return { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' };
        if (videoCount === 1) return { gridTemplateColumns: 'minmax(auto, 850px)', justifyContent: 'center' };
        if (videoCount === 2) return { gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))' };
        if (videoCount === 3) return { gridTemplateColumns: 'repeat(3, minmax(250px, 1fr))' };
        if (videoCount <= 6) return { gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' };
        return { gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' };
    }
    let handleChat = () => {
        setShowModal(!showModal);
    }
    let addMessage = (data, sender, socketIdSender) => {
        setMessages((preMessages) => [
            ...preMessages, {
                sender: sender,
                data: data,
            }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    }
    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }
    let handleMessage = e => {
        setMessage(e.target.value);
    }
    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        catch (e) {
            log(e);
        }
        routeTo('/home');
    }
    return (
        <div>
            {askForUsername === true ?
                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyLeft}>
                        <h2>Enter into Lobby</h2>

                        <div className={styles.inputRow}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" onClick={connect}>
                                Connect
                            </Button>
                        </div>

                        <div className={styles.videoWrapper}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={styles.localVideo}
                            />
                        </div>
                    </div>

                    <div className={styles.lobbyRight}>
                        <img src="meet.png" alt="meeting illustration" />
                    </div>
                </div>
                :
                <div className={styles.meetVideoContainer}>
                    {showModal ? <div className={styles.chatRoom}>
                        <div className={styles.chatHeader}>Group Chat</div>
                        <div className={styles.chatContainer}>
                            <div className={styles.chattingDisplay}>
                                {messages.map((item, index) => {
                                    return (<div key={index} style={{ marginBottom: "20px" }}>
                                        <p style={{ fontWeight: "bold" }}>{item.sender}:</p>
                                        <p>{item.data}</p>
                                    </div>
                                    )
                                })}
                            </div>
                            <div className={styles.chattingArea}>
                                <TextField id='outlined-basic' label="enter chat" variant="outlined" onChange={handleMessage} value={message} />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    </div> : null}
                    <div className={styles.buttonContainer}>
                        <IconButton style={{ color: 'white' }} onClick={handleVideo}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton style={{ color: 'red' }} onClick={handleEndCall}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton style={{ color: 'white' }} onClick={handleAudio}>
                            {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        {screenAvailable === true ? <IconButton style={{ color: 'white' }} onClick={handleScreen}>
                            {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </IconButton> : null}

                        <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton style={{ color: 'white' }} onClick={handleChat}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>
                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted playsInline></video>
                    <div className={styles.conferenceView} style={getVideoGridStyle()}>
                        {videos.map(video => (
                            <video
                                key={video.socketId}
                                autoPlay
                                playsInline
                                muted={false}
                                ref={ref => {
                                    if (ref && ref.srcObject !== video.stream) {
                                        ref.srcObject = video.stream;
                                    }
                                }}
                            />
                        ))}

                    </div>
                </div>
            }
        </div>
    )
}
