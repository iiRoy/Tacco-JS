const webEngine = require('express');
const messagePayload = 'respond with a resource';

const endpointConfigurations = [
  {
    pathSegment: '/',
    verb: 'get',
    action: (incomingData, outgoingData) => {
      outgoingData.end(messagePayload);
    }
  }
];

function establishEndpointHandler() {
  const routingMechanism = webEngine.Router();
  for (const config of endpointConfigurations) {
    if (typeof routingMechanism[config.verb] === 'function') {
      routingMechanism[config.verb](config.pathSegment, config.action);
    }
  }
  return routingMechanism;
}

module.exports = establishEndpointHandler();