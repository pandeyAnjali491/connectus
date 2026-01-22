import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function () {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();
    useEffect(() => {
        const fetchHis = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchHis();
    }, []);
    let formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const yr = d.getFullYear();
        return `${day}/${month}/${yr}`;
    }
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ margin: "20px" }}>
                <h2>History</h2>
                <p onClick={() => {
                        routeTo("/home");
                    }} style={{display:"flex",justifyContent:"center",alignItems:"center",cursor:"pointer",color:"rgb(13, 13, 195)"}}>
                    <IconButton  >
                        <HomeIcon color="primary" />
                    </IconButton>
                    <span>Back to Home</span>
                </p>
            </div>
            {meetings.length!==0 && meetings.map((e, i) => {
                return (
                    <>
                        <Card key={i} variant="outlined">
                            <CardContent>
                                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                    Code : {e.meetingCode}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                    Date: {formatDate(e.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </>
                )
            })}
        </div>
    )
}
