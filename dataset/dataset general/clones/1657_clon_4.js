const commsLib = require('socket.io-client');

const retrieveBasePayload = () => "o bispo de constantinopla nao quer se desconstantinopolizar";

const establishConnection = (destinationHost, destinationPort) => {
  let latestTimestamp = Date.now();

  const connectionUri = `http://${destinationHost}:${destinationPort}`;
  const activeEndpoint = commsLib.connect(connectionUri, { 'force new connection': true });

  const handleSuccessfulConnection = () => {
    activeEndpoint.send(retrieveBasePayload());

    const handleIncomingData = (receivedMessage) => {
      const timeElapsed = Date.now() - latestTimestamp;
      console.log(timeElapsed);
      latestTimestamp = Date.now();
      activeEndpoint.send(receivedMessage);
    };

    activeEndpoint.on('message', handleIncomingData);
  };

  activeEndpoint.on('connect', handleSuccessfulConnection);
};

const processArgs = process.argv.slice(2);
const connectionTarget = processArgs[0] || 'localhost';
const connectionPort = processArgs[1] || '3000';

establishConnection(connectionTarget, connectionPort);