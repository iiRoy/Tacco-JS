const queryEncoder = require('querystring');
const secureAgent = require('https');

module.exports = CloudGateway;

class CloudGateway {
  constructor(idKey, secretKey) {
    this._appId = idKey;
    this._masterSecret = secretKey;
    this._baseHost = 'api.parse.com';
    this._basePort = 443;
    this._secureProtocol = secureAgent;
  }

  _performNetworkCall(verb, resourcePath, requestBody, mediaType) {
    return new Promise((resolve, reject) => {
      const authHeader = 'Basic ' + Buffer.from(this._appId + ':' + this._masterSecret).toString('base64');
      const requestHeaders = {
        Authorization: authHeader,
        Connection: 'Keep-alive'
      };

      let messagePayload = null;
      let finalResourcePath = resourcePath;

      switch (verb) {
        case 'GET':
          if (requestBody) {
            finalResourcePath += '?' + queryEncoder.stringify(requestBody);
          }
          break;
        case 'POST':
        case 'PUT':
          messagePayload = typeof requestBody === 'object' ? JSON.stringify(requestBody) : requestBody;
          requestHeaders['Content-type'] = mediaType || 'application/json';
          break;
        case 'DELETE':
          requestHeaders['Content-length'] = 0;
          break;
        default:
          return reject(new Error('Unrecognized HTTP verb: ' + verb));
      }

      const connectionOptions = {
        hostname: this._baseHost,
        port: this._basePort,
        headers: requestHeaders,
        path: finalResourcePath,
        method: verb
      };

      const outboundRequest = this._secureProtocol.request(connectionOptions, (incomingResponse) => {
        if (incomingResponse.statusCode < 200 || incomingResponse.statusCode >= 300) {
          const operationError = new Error('Server responded with status ' + incomingResponse.statusCode);
          operationError.httpStatus = incomingResponse.statusCode;
          operationError.requestOptions = connectionOptions;
          operationError.requestPayload = messagePayload;
          return reject(operationError);
        }

        let responseDataAccumulator = '';
        incomingResponse.setEncoding('utf8');

        incomingResponse.on('data', (dataSegment) => {
          responseDataAccumulator += dataSegment;
        });

        incomingResponse.on('end', () => {
          let parsedData = null;
          let operationError = null;
          try {
            parsedData = JSON.parse(responseDataAccumulator);
          } catch (parseError) {
            operationError = parseError;
            // Original code just passes null data if parsing fails, so we'll do the same.
            // If the response was not empty, but invalid JSON, we still pass null for data.
          }
          resolve({ operationError, parsedData });
        });

        incomingResponse.on('error', (responseError) => {
          reject(responseError);
        });
      });

      outboundRequest.on('error', (networkError) => {
        reject(networkError);
      });

      if (messagePayload) {
        const encoding = (mediaType && (mediaType.startsWith('image/') || mediaType === 'application/octet-stream')) ? 'binary' : 'utf8';
        outboundRequest.write(messagePayload, encoding);
      }
      outboundRequest.end();
    });
  }

  async storeEntry(collectionName, payload, completionHandler) {
    try {
      const { operationError, parsedData } = await this._performNetworkCall('POST', '/1/classes/' + collectionName, payload);
      if (completionHandler) {
        completionHandler(operationError, parsedData);
      }
      if (operationError) throw operationError;
      return parsedData;
    } catch (unexpectedError) {
      if (completionHandler) completionHandler(unexpectedError);
      throw unexpectedError;
    }
  }

  async uploadAsset(assetName, assetData, assetType, completionHandler) {
    try {
      const { operationError, parsedData } = await this._performNetworkCall('POST', '/1/files/' + assetName, assetData, assetType);
      if (completionHandler) {
        completionHandler(operationError, parsedData);
      }
      if (operationError) throw operationError;
      return parsedData;
    } catch (unexpectedError) {
      if (completionHandler) completionHandler(unexpectedError);
      throw unexpectedError;
    }
  }

  async retrieveRecords(collectionName, criteria, completionHandler) {
    let endpointPath;
    let requestPayload = null;

    if (typeof criteria === 'string') {
      endpointPath = '/1/classes/' + collectionName + '/' + criteria;
    } else {
      endpointPath = '/1/classes/' + collectionName;
      requestPayload = { where: JSON.stringify(criteria) };
    }

    try {
      const { operationError, parsedData } = await this._performNetworkCall('GET', endpointPath, requestPayload);
      if (completionHandler) {
        completionHandler(operationError, parsedData);
      }
      if (operationError) throw operationError;
      return parsedData;
    } catch (unexpectedError) {
      if (completionHandler) completionHandler(unexpectedError);
      throw unexpectedError;
    }
  }

  async alterRecord(collectionName, recordId, newPayload, completionHandler) {
    try {
      const { operationError, parsedData } = await this._performNetworkCall('PUT', '/1/classes/' + collectionName + '/' + recordId, newPayload);
      if (completionHandler) {
        completionHandler(operationError, parsedData);
      }
      if (operationError) throw operationError;
      return parsedData;
    } catch (unexpectedError) {
      if (completionHandler) completionHandler(unexpectedError);
      throw unexpectedError;
    }
  }

  async removeRecord(collectionName, recordId, completionHandler) {
    try {
      const { operationError, parsedData } = await this._performNetworkCall('DELETE', '/1/classes/' + collectionName + '/' + recordId);
      if (completionHandler) {
        completionHandler(operationError, parsedData);
      }
      if (operationError) throw operationError;
      return parsedData;
    } catch (unexpectedError) {
      if (completionHandler) completionHandler(unexpectedError);
      throw unexpectedError;
    }
  }
}