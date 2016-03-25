(function(){
	angular.module('starter')
	.controller('CallController', ['$scope', '$state', 'localStorageService', 'SocketService', '$ionicModal','moment', '$ionicScrollDelegate', CallController]);
	
	function CallController($scope, $state, localStorageService, SocketService, moment, $ionicScrollDelegate){
    //controller used for calling
		var opts = {autoUpgrade: true, peerOpts: {numClients: 100}};
		$scope.audio = angular.element(document.getElementById("audio"));
		var getUserMediaOpt = {
			audio : true,
			video : false
		}
		var p2psocket = new P2P(SocketService, opts,function(){

			$scope.connection = "connected";

		});
		//we get the user we are calling
		$scope.username = localStorageService.get("username");
		//setting up our call modal
		$ionicModal.fromTemplateUrl('templates/call_modal.html',{
			scope : $scope,
			animation :"slide-in-up"
		}).then(function(modal){
			$scope.modal = modal;

		});
		//we get mediaStream data
        $scope.startCall = function(username){

           

        }
        $scope.stopCall = function(username){


        }
       
		var me = this;

		me.room_name = "";

		$scope.humanize = function(timestamp){
			return moment(timestamp).fromNow();
		};
        $scope.getUserMediaData = function ( ){
		var createSrc = window.URL ? window.URL.createObjectURL : function(stream) {return stream;};
		
		var sentAudioStream = null;
		
		var receivedAudioStream =null;
        	//we check if getUserMedia Supported by our browser
        	if(navigator.getUserMedia){
                
                navigator.getUserMedia(getUserMediaOpt,function(mediaStream){
                
                sentAudioStream = stream;
                
                //establish a call room
                p2pSocket.emit("join:call_room",{ caller : username, receiver : receiverUsername});
                //we sent stream to our channel
                
                p2psocket.on("found:call_room",function(room_name){
                	
                	me.room_name = room_name;

                	p2psocket.emit('accept:call',me.room_name);
                     
                	// p2pSocket.emit("place:call", { stream : stream , room_name : room_name});
                });
               

                //p2p onstream Back
                p2pSocket.on("stream_back",function(data){
                	//we get our audio source
                    
                   $scope.audio.src = createSrc(data.stream);
                   $scope.audio.play();

                });
				//
				p2psocket.on('accepted',function(msg){
					console.log(msg);
					 p2pSocket.emit("place:call", { stream : stream , room_name : room_name});
					
				});

                });

        	}else console.log("your browser does not support Media");
        }
		//	we initialize connection
		

		

	}

})();

