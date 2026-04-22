const EventProcessor = require('events').EventEmitter;
const secureComm = require('https');
const cipherUtility = require('./cipherUtility');

class RemoteService extends EventProcessor {
  constructor(pathPrefix) {
    super();
    this.serviceHost = 'boxcar.io';
    this.pathPrefix = pathPrefix;
  }

  sendPayload(targetResource, dataBundle, userCredentials) {
    const instanceReference = this;

    const requestBodyString = Object.entries(dataBundle)
      .filter(([, value]) => !!value)
      .map(([keyIdentifier, contentValue]) => `${keyIdentifier}=${contentValue}`)
      .join('&');

    const connectionConfig = {
      targetHost: instanceReference.serviceHost,
      targetPort: 443,
      targetPath: instanceReference.pathPrefix + targetResource,
      httpVerb: 'POST',
      requestHeaders: {
        'Content-Length': requestBodyString.length
      }
    };

    const authorizationHeader = userCredentials
      ? { Authorization: `Basic ${cipherUtility.encode(`${userCredentials.userIdentifier}:${userCredentials.secretKey}`)}` }
      : {};
    
    connectionConfig.requestHeaders = { ...connectionConfig.requestHeaders, ...authorizationHeader };

    new Promise((resolveOperation, rejectOperation) => {
      const outgoingRequest = secureComm.request({
        hostname: connectionConfig.targetHost,
        port: connectionConfig.targetPort,
        path: connectionConfig.targetPath,
        method: connectionConfig.httpVerb,
        headers: connectionConfig.requestHeaders
      }, (incomingResponse) => {
        let receivedContent = '';
        incomingResponse.setEncoding('utf8');

        incomingResponse.on('data', (dataSegment) => {
          receivedContent += dataSegment;
        });

        incomingResponse.on('end', () => {
          resolveOperation(incomingResponse.statusCode);
        });
      });

      outgoingRequest.on('error', rejectOperation);

      outgoingRequest.write(requestBodyString);
      outgoingRequest.end();
    })
    .then((finalStatus) => {
      instanceReference.emit('response', finalStatus);
    });
  }
}

module.exports = RemoteService;