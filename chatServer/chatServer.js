var io = require('socket.io')(3000);
var Firebase = require('firebase');
var p2p = require('socket.io-p2p-server').Server;
//we use peer ti peer to peer connection
io.use(p2p);
//we get a reference to our database
var reference = new Firebase('https://webtogocameroon.firebaseio.com/');

io.on('connection', function(socket){
     //
     var date = new Date();
    date.setTime(date.getTime()+(2*24*60*60*1000)); // set day value to expiry
    var expires = "; expires="+date.toGMTString();
     
    
    socket.on('join:room', function(data){
      //  var room_name = data.room_name;
      console.log(socket.request.headers.cookie);
        socket.join(data);
    });


    socket.on('leave:room', function(msg){
        msg.text = msg.user + " has left the room";
        socket.in(msg.room).emit('exit', msg);
        socket.leave(msg.room);
    });


    socket.on('send:message', function(msg){
        socket.in(msg.room).emit('message', msg);
    });
   //we list the rooms available
  
   socket.on('log:user',function(data){
     //we check if it is a new user
      var data =JSON.parse(data);
      reference.createUser({
      "email"    : data.email,
      "password" : data.password
    }, function(error, userData) {
      
      if (error) {
        console.log("Error creating user:", error);

      } else {
        console.log("Successfully created user account with uid:", userData.uid);
       
        var usersReference = new Firebase('https://webtogocameroon.firebaseio.com/users')
        
        socket.handshake.headers.cookie = "uid"+"="+userData.uid +"; "+"username"+"="+data.username+expires+"; path=/";
        
        usersReference.push({ "userid" : userData.uid,
                             "location" : data.location,
                            "username" :data.username});
        //we create databases for our users
       
      }
    });
        socket.emit("log:success","bluf");
   });

    socket.on('get:rooms',function(positionObject1){
        //we form a rooms of all users
        var arrayUser = [];
        var reference_users = new Firebase('https://webtogocameroon.firebaseio.com/users/');
          
          reference_users.on("value", function(snapshot) {
              
               var  users =  snapshot.val();
                 arrayUser=[];
               if(users){
          
                Object.keys(users).forEach(function(key){
               //users 
               reference_users.child(key+"/location/").once('value',function(snapshot2){
                
              /* var positionObject2 = snapshot2.val();

                    */
                   if(snapshot2.val())  {
                         var dist = getDistance(positionObject1,snapshot2.val().latitude,snapshot2.val().longitude);
                        console.log('dist is',dist);
                       if( dist <= 1)
                         arrayUser.push(users[key]["username"]);
                    }
                        });
               socket.emit('found:rooms',JSON.stringify([{ "users" : arrayUser }]));
                    });
                   
                 

               }
               
         }, function (errorObject) {
                
                console.log("The read failed: " + errorObject.code);
            });
      
   });
   /**All calls related operations */
     socket.on('join:call_room', function(data){
        var reference_rooms = new Firebase('https://webtogocameroon.firebaseio.com/callrooms/');
        //we check if a room already exist for the the two users
         reference_rooms.on("value", function(snapshot,previous) {
               
               var room_name="";

               var  rooms =  snapshot.val();
               
                if(rooms){
          
                Object.keys(rooms).forEach(function(key){
               //users 
                 if( (rooms[key]['receiver'] == data.user2 && rooms[key]['caller'] == data.user1 ) || (rooms[key]['receiver'] == data.user1 && rooms[key]['caller'] == data.user2)){
                     room_name = key;

                 }

         });

     socket.emit("found:call_room",{ "key" : key,"user" : user2});
     
     socket.join(key);

   }else{
     
     reference.push({ caller:user1 , receiver : user2});
     //create a temporal room 
     socket.emit("found:call_room",{ "key" : user1+user2,"user" : user2});
     
     socket.join(user1+user2);

     //we create a temporal room
}
               
         }, function (errorObject) {
                
                console.log("The read failed: " + errorObject.code);
            });
      
    });
     socket.on("accept:call",function(roomname){

        socket.join(roomname);

       socket.in(roomname).emit('accepted:call', "connected");
     });
     
     socket.on("place:call",function(data){
       
       socket.in(data.room_name).emit('stream_back:call',data);

     });
});

function getDistance(positionObject1,latitude2,longitude2){
    
    var lat1 = parseFloat(positionObject1.latitude);
   // console.log("lat1 ",lat1);
    var lon1 = parseFloat(positionObject1.longitude);
    // console.log("lon1 ",lon1);
    var lat2 = parseFloat(latitude2);
    // console.log("lat2 ",lat2);
    var lon2 = parseFloat(longitude2); 
     //console.log("lon2 ",longitude2);
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344;
    /*if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }*/
    return dist

}