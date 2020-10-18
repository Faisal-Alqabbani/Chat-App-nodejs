const users = [];
// addUser, reomveUser, getUser, getUsersinRoom
const addUser = ({id, username, room})=>{
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // validate the data
    if(!username || !room){
        return {
            error:'Username and Room are required!'
        }
    }
    // Check for exsting user
    const existingUser = users.find(user =>{
        return user.room === room && user.username === username
    });
    // validate username 
    if(existingUser){
        return{
            error:'username is in use! '
        }
    }
    // Store user
    const user = {id,username,room};
    users.push(user);
    return {
        user
    }

}
const removeUser = (id)=>{
    const index = users.findIndex(user => user.id === id);
    // index is a number , return -1 if it did not find a match. 1 and more if find match
    if(index !== -1){
        return users.splice(index,1)[0];
    }

}
const getUser = (id)=>{
    const user = users.find(user => user.id === id);
    return user
}
const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    const userInRoom = users.filter(user =>{
        return user.room === room;
    })
    return userInRoom;
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}