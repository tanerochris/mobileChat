(function(){
	angular.module('starter')
	.controller('HomeController', ['$scope', '$state', 'localStorageService', 'SocketService', HomeController]);
	
	function HomeController($scope, $state, localStorageService, SocketService){
        
		var me = this;
        
         me.rooms =[];
		me.current_room = localStorageService.get('room');
		me.location={}
		//gets the current Position of the user using the navigation api
		$scope.getUserCurrentPosition = function(){
			
			//we check if the navigation api exist
			if( "geolocation" in navigator){
                 
                 var watchID = navigator.geolocation.watchPosition(function(position) {
                  
                  me.location.latitude =position.coords.latitude;
                  me.location.longitude =position.coords.longitude;

                   });

             }
              
			//we use the navigation API
			//we return postion
			}
		 $scope.getUserCurrentPosition();
		//me.rooms = ['Coding', 'Art', 'Writing', 'Travel', 'Business', 'Photography'];


		$scope.login = function(username,password,email){
			
			localStorageService.set('username', username);
             
             var username = username;
             var email = email;
             var password = password;
             var data = {
             	"email" :email,
             	"password":password,
             	"location" :me.location,
             	"username" : username
             }
			//we connect to the server
		     SocketService.emit("log:user",JSON.stringify(data));

			};
         
          SocketService.on('log:success',function(data){
          		//var location  = $scope.getUserCurrentPosition();
          		
          		SocketService.emit('get:rooms',me.location);
		//we set the current rooms
		        $state.go('rooms');
		});
           SocketService.on('found:rooms',function(data){

			 var  users = JSON.parse(data);
			 
			 me.rooms =users[0]["users"];
			 console.log(users[0]["users"]);

		});
		$scope.enterRoom = function(room_name){

			me.current_room = room_name;
			
			localStorageService.set('room', room_name);

			SocketService.emit('join:room', room_name);

			$state.go('room');
		};

	}

})();