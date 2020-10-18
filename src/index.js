const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {generateMessage,generateLocation}= require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');
const Filter = require('bad-words');
const publicDirectoryPath = path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
const port = process.env.PORT || 3000;
// server (emit) --> client (receive) ---acknowledgement--> server 
// client (emit) --> server (receive) ---acknowledgement--> client

io.on('connection', (socket)=>{
    console.log('New Web socket connection!');
    // socket.on('join',({username,room},callback)=>{
    socket.on('join',(options,callback)=>{
        // it is up to you use any way
        // const {error,user} = addUser({id:socket.id,username,room});
        // ...option uses to cipy the opject
        const {error,user} = addUser({id: socket.id, ...options})
        if(error){
            return callback(error);
        }
        // we can only use this message on server
        // socket.emit(this is for the client), io.emit(this is for every one) , socket.brodcast.emit(this is for every one eacsapt the sneder)
        // io.to.emit(this for everyone in the same room)
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin: ','Welcome!'));
        // send brodcast to all ecsapt the sender
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin: ',`${user.username} has joined!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        

        
    })
    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)){
            return callback('****')
        }
       io.to(user.room).emit('message',generateMessage(user.username,message));
       callback();
    });

    socket.on('send-Location',(pos,callback) =>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${pos.latitude },${pos.longitude}`));
        callback();
    })
    socket.on('disconnect',() =>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin: ',`${user.username} has left!`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
     // send an event on the server 
     // here we dont want to send the data to everyone
    // socket.emit('countUpdated',count);
    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countUpdated',count);
    //     // i used io dou to want to send the data to everyone
    //     io.emit('countUpdated',count);
    // })
});








server.listen(port ,()=>{
    console.log('Server is up on port ' + port );
})