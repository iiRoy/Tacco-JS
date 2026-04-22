var queryUtil = require('querystring');

module.exports = CloudService;

function       CloudService (appIdentifier, mainSecret) {
  this._appIdentifier = appIdentifier;
  this._mainSecret = mainSecret;
}


CloudService.prototype = {
  _commProtocol: require('https'),
  _commHost: 'api.cloudserv.com',
  _commPort: 443,

  // store a data entity within a collection
  storeEntity: function (collectionName, entityData, responseHandler) {
    makeServiceRequest.call(this, 'POST', '/1/collections/' + collectionName, entityData, responseHandler);
  },

  // upload binary assets
  uploadAsset: function (assetName, fileContent, mediaType, responseHandler) {
    makeServiceRequest.call(this, 'POST', '/1/assets/' + assetName, fileContent, responseHandler, mediaType);
  },

  // retrieve entities from a collection
  retrieveEntities: function (collectionName, searchCriteria, responseHandler) {
    if (typeof searchCriteria === 'string') {
      makeServiceRequest.call(this, 'GET', '/1/collections/' + collectionName + '/' + searchCriteria, null, responseHandler);
    } else {
      makeServiceRequest.call(this, 'GET', '/1/collections/' + collectionName, { findCriteria: JSON.stringify(searchCriteria) }, responseHandler);
    }
  },

  // modify an existing entity in the collection
  modifyEntity: function (collectionName, entityId, entityUpdates, responseHandler) {
    makeServiceRequest.call(this, 'PUT', '/1/collections/' + collectionName + '/' + entityId, entityUpdates, responseHandler);
  },

  // delete an entity from the collection
  'remove': function (collectionName, entityId, responseHandler) {
    makeServiceRequest.call(this, 'DELETE', '/1/collections/' + collectionName + '/' + entityId, null, responseHandler);
  }
};


// Handles HTTP(S) requests to the cloud service API
function makeServiceRequest (httpMethod, reqPath, reqPayload, completionHandler, mediaType) {
  var authorizationHeader = 'Basic ' + new Buffer(this._appIdentifier + ':' + this._mainSecret).toString('base64');
  var requestHeaders = {
    Authorization: authorizationHeader,
    Connection: 'Keep-alive'
  };

  var requestBody = null;

  switch (httpMethod) {
    case 'GET':
      if (reqPayload) {
        reqPath += '?' + queryUtil.stringify(reqPayload);
      }
      break;

    case 'POST':
    case 'PUT':
      requestBody = typeof reqPayload === 'object' ? JSON.stringify(reqPayload) : reqPayload;
      requestHeaders['Content-type'] = mediaType || 'application/json';
      break;

    case 'DELETE':
      requestHeaders['Content-length'] = 0;
      break;

    default:
      throw new Error('Unknown HTTP method specified: "' + httpMethod + '"');
  }

  var requestOptions = {
    host: this._commHost,
    port: this._commPort,
    headers: requestHeaders,
    path: reqPath,
    method: httpMethod
  };

  var apiCall = this._commProtocol.request(requestOptions, function (serviceResponse) {
    if (!completionHandler) {
      return;
    }

    if (serviceResponse.statusCode < 200 || serviceResponse.statusCode >= 300) {
      var responseError = new Error('Server responded with HTTP error code ' + serviceResponse.statusCode);
      responseError.arguments = arguments;
      responseError.type = serviceResponse.statusCode;
      responseError.options = requestOptions;
      responseError.body = requestBody;
      return completionHandler(responseError);
    }

    var responseJson = '';
    serviceResponse.setEncoding('utf8');

    serviceResponse.on('data', function (dataChunk) {
      responseJson += dataChunk;
    });

    serviceResponse.on('end', function () {
      var parseError = null;
      var parsedData = null;
      try {
        parsedData = JSON.parse(responseJson);
      } catch (e) {
        // pass error to callback
        parseError = e;
      }
      completionHandler(parseError, parsedData);
    });

    serviceResponse.on('close', function (closeError) {
      completionHandler(closeError);
    });
  });

  requestBody && apiCall.write(requestBody, mediaType ? 'binary' : 'utf8');
  apiCall.end();

  apiCall.on('error', function (requestError) {
    completionHandler && completionHandler(requestError);
  });
}