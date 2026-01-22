import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth.jsx';
import { useNavigate } from 'react-router';
import { AuthContext } from '../contexts/AuthContext.jsx';
import "../styles/home.css";
import { IconButton,Button, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
function home() {
    let navigate = useNavigate();
    const [meetingCode,setMeetingCode] = useState("");
    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinCall = async()=>{
        await addToUserHistory(meetingCode) ;
        navigate(`/${meetingCode}`);
    }
  return (
    <>
        <div className="navBar">
            <div style={{display:"flex",alignItems:"center"}}>
                <h2>Connectus</h2>
            </div>
            <div style={{display:"flex",alignItems:"center"}}>
                <IconButton onClick={()=>{
                    navigate("/history");
                }}>
                    <RestoreIcon/>
                    <p style={{fontSize:"12px"}}>History</p>
                </IconButton>
                <Button onClick={()=>{
                    localStorage.removeItem("token");
                    navigate("/auth");
                }}>Logout</Button>
            </div>
        </div>
        <div className="meetContainer">
            <div className="leftPanel">
                <div>
                    <h2 style={{marginBottom:"12px"}}>Providing Quality Video Call</h2>
                    <div style={{display:"flex",gap:"10px"}}>
                        <TextField onChange={e=> setMeetingCode(e.target.value)} id='outlined' label="Enter Meeting Code" variant='outlined'/>
                        <Button onClick={handleJoinCall} variant='contained'>Join</Button>
                    </div>
                </div>
            </div>
            <div className="rightPanel">
                <img srcSet='/logo3.png' alt='image'></img>
            </div>
        </div>
    </>
  )
}

export default withAuth(home);