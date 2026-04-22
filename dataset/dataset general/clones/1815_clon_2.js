var communicationProtocol = 'basic_ws',

    serverEndpoint = 'ws://ws.websocketstest.com:80/service';

if (communicationProtocol === 'basic_ws') {
  var socketInstance = require('net.iamyellow.tiws').createWS();

  socketInstance.addEventListener('open', function () {
    Ti.API.debug('WebSocket connection initiated.');
  });

  socketInstance.addEventListener('close', function (eventDetails) {
    Ti.API.info(`WebSocket connection closed - status_code: ${eventDetails.code} - reason_message: ${eventDetails.reason}`);
  });

  socketInstance.addEventListener('error', function (eventDetails) {
    Ti.API.error(`An operation error occurred: ${eventDetails.error}`);
  });

  let currentProtocolVersion;
  let messageCountReceived = 0;

  socketInstance.addEventListener('message', function (incomingMessage) {
    Ti.API.log(`Incoming data packet: ${incomingMessage.data}`);
    const dataSegments = incomingMessage.data.split(',', 2);
    const commandType = dataSegments[0];
    const commandValue = dataSegments[1];

    if (commandType === 'connected_notification') {
      Ti.API.log(`Received connection confirmation: ${commandValue}`);
      socketInstance.send('request_proto_version,');
    } else if (commandType === 'proto_version_response') {
      Ti.API.log(`Received protocol version: ${commandValue}`);
      currentProtocolVersion = commandValue;
      socketInstance.send('echo_test_payload,sample_data_string_v2');
    } else if (commandType === 'echo_reply' && commandValue === 'sample_data_string_v2') {
      Ti.API.log(`Echo payload verified: ${commandValue}`);
      if (currentProtocolVersion === 'draft-07-hybi-spec') {
        socketInstance.send('ping_signal,');
      } else {
        socketInstance.send('countdown_request,');
      }
    } else if (commandType === 'time_sync') {
      messageCountReceived++;
      Ti.API.log(`Received time synchronization: ${commandValue}`);
      if (messageCountReceived > 3) {
        socketInstance.close();
        alert('Process completed successfully.');
      }
    }
  });

  socketInstance.open(serverEndpoint, ['main-protocol-echo', 'secondary-protocol-test']);
}

else if (communicationProtocol === 'socket_io_comm') {
  var socketIoUtility = require('socket.io');
  var activeChannel = socketIoUtility.connect(serverEndpoint);

  activeChannel.on('connection_established_event', function () {
    Ti.API.log('Socket.IO channel is now fully connected!');
  });
}

else if (communicationProtocol === 'now_framework') {
  var realtimePlatform = require('now').nowInitialize(serverEndpoint, {
    socketio: {
      transports: ['websocket_protocol']
    }
  });

  realtimePlatform.kernelModule.on('platform_error_event', function () {
    Ti.API.error('A critical error has occurred in the now.js platform!');
  });

  realtimePlatform.kernelModule.on('platform_ready_event', function () {
    Ti.API.log('The now.js platform is ready for operations.');
  });

  realtimePlatform.kernelModule.on('platform_disconnect_event', function () {
    Ti.API.log('Now.js platform has disconnected from the server.');
  });

  realtimePlatform.participantId = '5544332211';
  realtimePlatform.mysteryFunction = function () {
    return 'truth lies within the shadows';
  };
}