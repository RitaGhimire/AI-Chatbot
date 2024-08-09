'use client'
import Image from "next/image";
// import styles from "./page.module.css";
import {useState} from 'react'
import React from "react";
import {Box, Stack, TextField,Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FlutterDashIcon from '@mui/icons-material/FlutterDash';



export default function Home() {
 const [messages,setMessages] = useState([{
  role: 'assistant',
  content: `Hi I'm the Headstarter Support Agent, how can I help you today?`
 },
])
 const[message,setMessage] = useState('')
const sendMessage = async()=> {
  setMessage('')
  setMessages((messages) => [
    ...messages,
    {role: "user", content: message},
    {role: "assistant", content: ''}
  ])
  const response = fetch('/api/chat',{
    method: "POST",
    headers: {
      'Content-Type' : 'application/json'
    },
    body:JSON.stringify([...messages,{ role: 'user' ,content: message}]),

  }).then( async (res) => {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let result = ''
    return reader.read().then(function processText ({done,value}){
if(done){
 return result
}
const text = decoder.decode(value || new Int8Array(), {stream:true})
setMessages((messages) => {
let lastMessage = messages[messages.length - 1]
let otherMessages = messages.slice(0,messages.length - 1)

return [
  ...otherMessages,
  {
    ...lastMessage,
      content: lastMessage.content + text,
  },
]
})
return reader.read().then(processText)
})
 })
}

 return(
 <Box width = "100vw"
  height = "100vh" 
  display= "flex"
  flexDirection = "column"
  justifyContent = "center"
  alignItems ="center"
  >
      <Stack direction = "column" //inside the box a stack has been created that is the main- body for the AI 
    width = "600px"
    height = "700px"
    border = "1px solid black"
    borderRadius="20px"
    p = {2}
    spacing = {2}>
      <Stack direction = "column" 
      spacing = {2}
      flexGrow = {1}
      overflow = "auto"
      maxHeight = "100%"
      >
        {messages.map((message, index) => (
      <Box 
      key = {index} 
      display = 'flex' 
      justifyContent = {
        message.role ==='assistant'? 'flex-start' : 'flex-end' } 
      >
        {message.role === 'assistant' && (
                <Box display="flex" alignItems="center" mr={1}>
                  <FlutterDashIcon fontSize="large" />
                </Box>
              )}
      <Box
        bgcolor = {
          message.role === 'assistant' ?
           'primary.main':
            'secondary.main'
        }
        color = "white"
        borderRadius = {20}
        p = {2}

        >
          {message.content}
        </Box>
        </Box>
        ))}
      </Stack>
      <Stack direction = "row" spacing = {2} borderRadius="10px" >
        <TextField label = "Enter your text here..."
        fullWidth value = {message}
        onChange = {(e)=> setMessage(e.target.value)}/>
        <Button variant = "contained"  
        onClick = {sendMessage} 
        sx = {{borderRadius: "10px", padding:"2px", bgcolor:"#58545F"}} 
        endIcon = {<SendIcon />}></Button>


      </Stack>
    </Stack>
  </Box>
);
}
