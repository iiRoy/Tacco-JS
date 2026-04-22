const secureWeb = require("https");
const signalEmitter = require("events");

class NetworkEndpointMutator extends signalEmitter {
  constructor(configuration) {
    super();
    this._cfg = configuration;
  }

  // Generates the authorization string for the API.
  _generateCredentialsHeader() {
    return this._cfg.loginId + ":" + this._cfg.secretKey;
  }

  // Initiates the update process for the specified network address.
  alterEndpoint(targetAddress) {
    const self = this;

    const resourceUri = `/domains/${self._cfg.domainName}/records/${self._cfg.recordIdentifier}`;

    const payloadObject = JSON.stringify({
      entry: {
        data: targetAddress,
        lifetime: 86400
      }
    });

    self._sendSecurePayload(resourceUri, payloadObject);
  }

  // Dispatches an HTTPS PUT request to the remote service.
  _sendSecurePayload(resourceUri, payloadData) {
    const self = this;

    const requestOptions = {
      host: "dnsimple.com",
      path: resourceUri,
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-DNSimple-Token": self._generateCredentialsHeader(),
        "Content-Length": payloadData.length
      }
    };

    const httpRequest = secureWeb.request(requestOptions, (serverResponse) => {
      let responseStatus = serverResponse.statusCode;
      serverResponse.on("data", (chunk) => {
        if (responseStatus === 200) {
          self.emit("operationComplete", chunk);
        } else {
          self.emit("operationFailed", chunk);
        }
      });
    });

    httpRequest.on("error", (err) => {
      self.emit("operationFailed", err);
    });

    httpRequest.write(payloadData);
    httpRequest.end();
  }
}

module.exports = NetworkEndpointMutator;