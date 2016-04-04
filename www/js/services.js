'use strict';


angular.module('suiziChat.services', ['btford.socket-io'])
	.factory('socket',function(socketFactory){
return socketFactory({
    prefix: 'suiziChat',
    ioSocket: io.connect('http://localhost:3000')
  });

	});


	



	