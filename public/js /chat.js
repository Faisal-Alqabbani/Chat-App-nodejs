const socket = io();
// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('#input-msg');
const $messageFormButton = $messageForm.querySelector('#send-btn');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector("#messages");
// Templates 
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sideBar-template').innerHTML;
// Option
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})
const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    // Height of the last message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
    console.log(newMessageHeight);


}

socket.on('message',(message) =>{
    console.log(message.text);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        // Doc of this library in momentjs.com 
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
 });

 // the current location
 socket.on('locationMessage', (url)=>{
     console.log(url);
     const html = Mustache.render(locationTemplate,{
         username:username,
         url:url.location,
         createdAt:moment(url.createdAt).format('h:mm a MMM'),
        
     });
     $messages.insertAdjacentHTML('beforeend',html);
     autoscroll()
 });
 socket.on('roomData', ({room, users})=>{
     const html = Mustache.render(sideBarTemplate,{
         room,
         users
     });
     document.querySelector('.chat__sidebar').innerHTML=html;
     
 })
// add event to the from
$messageForm.addEventListener('submit',(e)=>{
    // Disabled
    $messageFormButton.setAttribute('disabled','disabled');
    e.preventDefault();
    socket.emit('sendMessage',$messageFormInput.value, (error)=>{
        // Enabel 
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log('Message Delevered!')
    });

    
    
});
$locationButton.addEventListener('click',() =>{
    // validate your browser
    if(!navigator.geolocation){
        return alert('Geocode is not supported by your browser.')
    }
    $locationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((postion) =>{
        socket.emit('send-Location',{
            latitude:postion.coords.latitude,
            longitude:postion.coords.longitude,
        },// the acknowledge is callback funaction.
        ()=>{
            console.log('Location shared');
            $locationButton.removeAttribute('disabled')
        });
    })
});

socket.emit('join', {username ,room},(error) =>{
    if(error){
        alert(error);
        location.href = '/';
    }

})
// socket.on('countUpdated', (count) =>{
//     console.log('The count has been updated!' + count);
// });
// document.getElementById('increment').addEventListener('click',()=>{
//     console.log('Clicked');
//     socket.emit('increment');
// })