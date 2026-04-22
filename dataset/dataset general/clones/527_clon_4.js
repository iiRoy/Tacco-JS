const webClient = require('http');
const resourceLocator = require('url');
const queryEncoder = require('querystring');
const feedProcessor = require('./content_parser_utility'); // Renamed 'atom' module

// Custom event dispatching mechanism
class SignalDispatcher {
  constructor() {
    this.signalHandlers = new Map();
  }

  // Binds a handler to a specific signal
  on(signalName, callbackFunction) {
    if (!this.signalHandlers.has(signalName)) {
      this.signalHandlers.set(signalName, new Set());
    }
    this.signalHandlers.get(signalName).add(callbackFunction);
  }

  // Triggers a signal, invoking all bound handlers
  emit(signalName, ...payload) {
    if (this.signalHandlers.has(signalName)) {
      for (const handler of this.signalHandlers.get(signalName)) {
        handler(...payload);
      }
    }
  }

  // Removes a specific handler for a signal
  off(signalName, callbackFunction) {
    if (this.signalHandlers.has(signalName)) {
      this.signalHandlers.get(signalName).delete(callbackFunction);
    }
  }
}

// Utility for making HTTP requests with Promises
function webRequestAsync(methodType, targetAddress, requestHeaders, bodyContent) {
  return new Promise((resolve, reject) => {
    const parsedAddress = new resourceLocator.URL(targetAddress);
    const connectionOptions = {
      hostname: parsedAddress.hostname,
      port: parsedAddress.port || (parsedAddress.protocol === 'https:' ? 443 : 80),
      path: parsedAddress.pathname + parsedAddress.search,
      method: methodType,
      headers: requestHeaders,
    };

    const req = webClient.request(connectionOptions, (res) => {
      let responseData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({ responseCode: res.statusCode, data: responseData });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (bodyContent) {
      req.write(bodyContent);
    }
    req.end();
  });
}

// Main class for managing event subscriptions and callbacks
class EventRelayAgent {
  constructor(commPort, isAsynchronous) {
    this.commPort = commPort || 8000;
    this.verificationMode = isAsynchronous ? 'async' : 'sync';
    this.sourceDispatchers = new Map();
  }

  // Generates the URI for the callback listener
  generateCallbackUri() {
    return `http://localhost:${this.commPort}/`;
  }

  // Submits a subscription request to a hub
  async submitSubscription(sourceUri, hubUri, callbackUri, onCompletion, onError) {
    const requestBodyParams = new resourceLocator.URLSearchParams();
    requestBodyParams.append("hub.callback", callbackUri);
    requestBodyParams.append("hub.mode", "subscribe");
    requestBodyParams.append("hub.topic", sourceUri);
    requestBodyParams.append("hub.verify", this.verificationMode);
    requestBodyParams.append("hub.lease_seconds", ""); // Placeholder
    requestBodyParams.append("hub.secret", ""); // Placeholder
    requestBodyParams.append("hub.verify_token", ""); // Placeholder

    const hubAddress = new resourceLocator.URL(hubUri);
    const requestHeaders = {
      "Host": hubAddress.hostname,
      "Accept": "*/*",
      "Content-length": Buffer.byteLength(requestBodyParams.toString()),
      "Content-Type": "application/x-www-form-urlencoded"
    };

    try {
      const { responseCode, data } = await webRequestAsync(
        "POST",
        hubUri,
        requestHeaders,
        requestBodyParams.toString()
      );

      if (responseCode === 202 || responseCode === 204) {
        onCompletion();
      } else {
        onError(data);
      }
    } catch (error) {
      onError(error.message);
    }
  }

  // Stores an event dispatcher for a given topic source
  storeSourceDispatcher(sourceIdentifier, dispatcherInstance) {
    this.sourceDispatchers.set(sourceIdentifier, dispatcherInstance);
  }

  // Initiates the process of fetching a topic feed and subscribing
  async monitorTopicFeed(feedSourceUri) {
    const sourceAddress = new resourceLocator.URL(feedSourceUri);
    const requestHeaders = { "Host": sourceAddress.hostname };

    const feedNotifier = new SignalDispatcher(); // Dedicated dispatcher for this topic

    try {
      const { responseCode, data } = await webRequestAsync(
        "GET",
        feedSourceUri,
        requestHeaders
      );

      if (responseCode >= 200 && responseCode < 300) {
        const parsedFeedContent = await feedProcessor.parse(data);
        const hubLink = parsedFeedContent.getLinksByRel('hub')[0];
        const callbackAddress = this.generateCallbackUri();

        await this.submitSubscription(
          feedSourceUri,
          hubLink.href,
          callbackAddress,
          () => {
            feedNotifier.emit('activated', feedSourceUri); // Renamed 'subscribed'
            this.storeSourceDispatcher(feedSourceUri, feedNotifier);
          },
          (issue) => {
            feedNotifier.emit('failure', issue); // Renamed 'error'
          }
        );
      } else {
        feedNotifier.emit('failure', `Failed to retrieve feed: ${responseCode}`);
      }
    } catch (error) {
      feedNotifier.emit('failure', error.message);
    }
    return feedNotifier;
  }

  // Starts the HTTP server to handle hub callbacks
  activateCallbackService() {
    console.log(`Commencing callback service on port ${this.commPort}`);
    const currentAgent = this;

    webClient.createServer(async (incomingMessage, outgoingResponse) => {
      const messageUrl = new resourceLocator.URL(incomingMessage.url, `http://localhost:${currentAgent.commPort}`);
      const queryPayload = Object.fromEntries(messageUrl.searchParams.entries());

      if (incomingMessage.method === 'GET') {
        console.log('challenge_key:', queryPayload['hub.challenge']);
        console.log('action_mode:', queryPayload['hub.mode']);
        console.log('topic_id:', queryPayload['hub.topic']);
        console.log('duration:', queryPayload['hub.lease_seconds']);

        outgoingResponse.writeHead(200, { 'Content-Type': 'text/plain' });
        outgoingResponse.end(queryPayload['hub.challenge']);
      } else if (incomingMessage.method === 'POST') {
        console.log("POST request received from hub");
        let receivedData = '';
        incomingMessage.setEncoding('utf8');
        for await (const dataChunk of incomingMessage) {
          receivedData += dataChunk;
        }

        outgoingResponse.writeHead(200);
        outgoingResponse.end();

        const processedContent = await feedProcessor.parse(receivedData);
        const topicIdentifier = processedContent.id.trim();
        const relevantDispatcher = currentAgent.sourceDispatchers.get(topicIdentifier);

        if (relevantDispatcher) {
          relevantDispatcher.emit('content_update', processedContent); // Renamed 'update'
        } else {
          console.warn(`No dispatcher found for topic: ${topicIdentifier}`);
        }
      }
    }).listen(this.commPort);
  }
}

// Placeholder for a content publication agent
class ContentPublisher {
  constructor() {
    // Publisher setup
  }

  // Method to broadcast content
  broadcastContent(contentPackage) {
    // Logic to extract hub information and send publication request
  }
}

module.exports.EventRelayAgent = EventRelayAgent;
module.exports.ContentPublisher = ContentPublisher;