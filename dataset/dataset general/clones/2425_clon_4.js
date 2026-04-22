const applicationHost = require('fastify')();
const commsModule = require('webrtc.io');
const fileDispenser = require('fastify-static');

const servicePort = process.env.PORT_NUMBER || 8080;
let realtimeComms;

applicationHost.register(fileDispenser, {
  root: __dirname,
  index: 'index.html'
});

applicationHost.listen(servicePort, '0.0.0.0', (err, address) => {
  if (err) {
    console.error('Server startup issue:', err);
    process.exit(1);
  }
  console.log(`Gateway operating at ${address}`);

  // Attach the real-time communication layer to the underlying HTTP server
  realtimeComms = commsModule.listen(applicationHost.server);

  realtimeComms.rtc.on('chat_msg', (incomingPayload, senderEndpoint) => {
    const currentRoomParticipants = realtimeComms.rtc.rooms[incomingPayload.room] || [];

    currentRoomParticipants
      .filter(individualId => individualId !== senderEndpoint.id)
      .forEach(recipientId => {
        const targetEndpoint = realtimeComms.rtc.getSocket(recipientId);

        if (targetEndpoint) {
          const outgoingTransmission = {
            "eventName": "receive_chat_msg",
            "data": {
              "messages": incomingPayload.messages,
              "color": incomingPayload.color
            }
          };

          targetEndpoint.send(JSON.stringify(outgoingTransmission), (transmissionError) => {
            if (transmissionError) {
              console.error('Transmission error:', transmissionError);
            }
          });
        }
      });
  });
});