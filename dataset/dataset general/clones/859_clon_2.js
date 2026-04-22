var EventStreamer = require('events').EventEmitter,
  secureHttp = require('https'),
  encodr = require('./base64');

var Communicator = function (rootPath) {
  this.mainHost = 'boxcar.io';
  this.rootPath = rootPath;
  EventStreamer.call(this);
};

Communicator.prototype = new EventStreamer();
Communicator.constructor = Communicator;

Communicator.prototype.sendRequest = function (resourcePath, payloadObject, credentials) {
  var instanceRef = this,
    paramList = [];

  for (let keyName in payloadObject) {
    if (payloadObject[keyName]) {
      paramList.push(keyName + '=' + payloadObject[keyName]);
    }
  }

  var requestBody = paramList.join('&');

  var requestOptions = {
    targetHost: instanceRef.mainHost,
    connectionPort: 443,
    path: instanceRef.rootPath + resourcePath,
    httpMethod: 'POST',
    requestHeaders: {
      'Payload-Size': requestBody.length
    }
  };

  if (credentials) {
    requestOptions.requestHeaders['Authentication'] = 'Basic ' + encodr.encode(credentials.userIdentifier + ':' + credentials.secretKey);
  }

  var httpRequest = secureHttp.request(requestOptions, function (responseObject) {
    var receivedData = "";
    responseObject.setEncoding('utf8');
    responseObject.on('data', function (dataChunk) {
      receivedData += dataChunk;
    });

    responseObject.on('end', function () {
      instanceRef.broadcastEvent('replyReceived', responseObject.statusCode);
    });
  });

  httpRequest.write(requestBody);
  httpRequest.end();
};

module.exports = Communicator;