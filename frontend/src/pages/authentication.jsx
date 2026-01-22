import React, { useState } from 'react'
import { Avatar, Container, Paper, Snackbar, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import MailLockOutlinedIcon from '@mui/icons-material/MailLockOutlined';
import { Link, useNavigate } from 'react-router';
import { AuthContext } from '../contexts/AuthContext.jsx';
import HomeIcon from '@mui/icons-material/Home';
export default function Authentication() {
  // 0 - signin
  // 1 - signup
  let task = ["Login", "Sign Up"];
  const [action, setAction] = useState(0);
  const [username, setUser] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  let handleAuth = async () => {
    setError("");
    try {
      if (action === 0) {
        // Handle sign in logic
        let res = await handleLogin(username, password);
        console.log(res);

      } else if (action === 1) {
        let res = await handleRegister(name, username, password);
        console.log(res);
        setMessage(res);
        setOpen(true);
        setAction(0);
        setPassword("");
        setUser("");
        setName("");
      }
    } catch (err) {
      console.log("Error:", err);
      let message = err.response.data.message || "An error occurred";
      setError(message);
    }
  }
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm">
      <Paper elevation={10} style={{ padding: 2, marginTop: 100 }}>
        <Avatar sx={{ mx: "auto", bgcolor: 'primary.main', textAlign: "center", mb: 1, mt: 3 }}>
          <MailLockOutlinedIcon />
        </Avatar>
        <div align="center" style={{ marginTop: 18 }}>
          <Button variant={action === 0 ? "contained" : ""} onClick={() => { setAction(0) }}>{task[0]}</Button>
          <Button variant={action === 1 ? "contained" : ""} onClick={() => { setAction(1) }}>{task[1]}</Button>
        </div>
        <Box component="form" noValidate sx={{ padding: 5 }}>
          {action === 1 && (
            <TextField placeholder="Enter full name" name='name' value={name} type='text' fullWidth required sx={{ mb: 2 }} onChange={(e) => setName(e.target.value)} />
          )}
          <TextField placeholder="Enter username" name='username' value={username} type='text' fullWidth required sx={{ mb: 2 }} onChange={(e) => setUser(e.target.value)} />
          <TextField placeholder="Enter password" name='password' value={password} type='password' fullWidth required sx={{ mb: 2 }} onChange={(e) => setPassword(e.target.value)} />
          <p style={{ color: "red" }}>{error}</p>
          <Button type='button' variant='contained' fullWidth sx={{ mt: 2 }} onClick={handleAuth}>{task[action]}</Button>
        </Box>
        <Snackbar open={open} autoHideDuration={4000} message={message}>
          <Typography>{message}</Typography>
        </Snackbar>
        <div onClick={() => {
            navigate("/");
          }} className="footer" style={{display:"flex",justifyContent:"center",alignItems:"center",color:"rgb(10, 10, 177)",cursor:"pointer",marginTop:"-10px"}}>
          <IconButton>
            <HomeIcon color='primary' />
          </IconButton>
          Back to Home
        </div>
      </Paper>
    </Container>
  )
}
