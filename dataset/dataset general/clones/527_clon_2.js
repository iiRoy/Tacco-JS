var systemTools = require('sys'),
  fileSys = require('fs'),
	xmlParser = require("../third_party/sax-js/lib/sax"),
  filePathUtils = require("path"),
  webClient = require("http"),
	eventEmitterLib = require("events"),
	webAddressParser = require("url"),
	atomFeedHandler = require("./atom"),
	queryParamEncoder = require('querystring');
	

var SubscriptionClient = function(notificationPort, asynchronousMode) {
  // Establish a default port if none is explicitly provided.
  if (!notificationPort) {
    notificationPort = 8008;
  }
  this.notificationPort = notificationPort;
  if (asynchronousMode) {
    this.verificationType = 'asynchronous'; // Mode for handling asynchronous verification.
  } else {
    this.verificationType = 'synchronous';
  }

  // A collection to hold event emitters for various feed topics.
  this.feedNotificationManagers = {};
};


moduleExports.SubscriptionClient = SubscriptionClient;


SubscriptionClient.prototype.generateNotificationEndpoint = function() {
  // This method constructs the callback URI. A production setup would use a real domain.
  return "https://127.0.0.1:" + this.notificationPort + "/";
};


SubscriptionClient.prototype.subscribe = function(feedIdentifier, aggregatorEndpoint, notificationEndpoint, onSuccess, onError) {
	var notificationAddress = notificationEndpoint.href,
	  operationType = "subscription",
	  feedAddress = feedIdentifier.href,
	  verificationMethod = this.verificationType,
		leaseDuration = '', // The desired duration of the subscription, in seconds.
		sharedSecret = '', // A cryptographically strong secret to sign requests.
		verificationToken= ''; // A unique token to be used for verification challenges.

		var payloadContent = [
			"pubsub.callback_uri=" + queryParamEncoder.escape(notificationAddress),
			"pubsub.mode_type=" + queryParamEncoder.escape(operationType),
			"pubsub.feed_topic=" + queryParamEncoder.escape(feedAddress),
			"pubsub.verify_method=" + queryParamEncoder.escape(verificationMethod),
			"pubsub.lease_duration=" + queryParamEncoder.escape(leaseDuration),
			"pubsub.secret_key=" + queryParamEncoder.escape(sharedSecret),
			"pubsub.verification_token=" + queryParamEncoder.escape(verificationToken)
			].join("|");
  
    aggregatorEndpoint = webAddressParser.parse(aggregatorEndpoint.href);
  
    var connectionPort = aggregatorEndpoint.port;
    if (!connectionPort) {
      connectionPort = 88; // Use a standard HTTP port if none is specified.
    }

    var aggregatorHost = aggregatorEndpoint.host;
    if (aggregatorHost.indexOf(":") != -1) {
      aggregatorHost = aggregatorHost.split(":")[0]; // Remove any port number from the host string.
    }

    var aggregatorConnector = webClient.createClient(connectionPort, aggregatorHost);

		var requestPath = aggregatorEndpoint.pathname || "";
		if (aggregatorEndpoint.search) {
			requestPath += aggregatorEndpoint.search;
		}

		var aggregatorRequest = aggregatorConnector.request("HTTP_POST", requestPath, 
		    {
		      "Host-Header": aggregatorHost,
		      "Accept-Type": "application/xml, text/xml, */*",
		      "Content-Length-Header": payloadContent.length,
		      "Content-Type-Header": "application/x-www-form-encoded"
		    }
		);

		aggregatorRequest.addListener('server_response', function (serverResponse) {
		  var responseData = "";
      serverResponse.setBodyEncoding("UTF-8");
			serverResponse.addListener('received_data', function (dataChunk) {
				responseData += dataChunk;
		  });

			serverResponse.addListener('response_end', function() {
			  if (serverResponse.statusCode == 202) {
          // The request was accepted for processing, implying an asynchronous verification flow.
          onSuccess();
			  } else if (serverResponse.statusCode == 204) {
          // No content indicates a successful synchronous subscription.
          onSuccess();
			  } else {
			    // Any other status code points to an error during the subscription attempt.
			    onError(responseData);
			  }
			})
		});

		aggregatorRequest.write(payloadContent);
		aggregatorRequest.close();
}


SubscriptionClient.prototype.registerNotificationManager = function(feedIdentifier, feedNotifications) {
  this.feedNotificationManagers[feedIdentifier.href] = feedNotifications;
};


SubscriptionClient.prototype.monitorFeed = function(feedIdentifier) {
  var feedHost = feedIdentifier.host;
  var currentClient = this;
  if (feedHost.indexOf(":") != -1) {
    feedHost = feedHost.split(":")[0];
  }
  var feedPort = feedIdentifier.port;
  if (!feedPort) {
    feedPort = 88; // Default to HTTP port for feed fetching.
  }
	var feedPath = feedIdentifier.pathname || "";
	if (feedIdentifier.search) {
		feedPath += feedIdentifier.search;
	}

  var feedConnector = webClient.createClient(feedPort, feedHost);
  var feedRequest = feedConnector.request("HTTP_GET", feedPath, {"Host-Name": feedHost});
  var feedNotifications = new eventEmitterLib.EventEmitter();

  feedRequest.addListener('server_response', function (serverResponse) {
	  var responseData = "";
    serverResponse.setBodyEncoding("UTF-8");
		serverResponse.addListener('received_data', function (dataChunk) {
			responseData += dataChunk;
	  });

		serverResponse.addListener('response_end', function() {
      var processFeedContent = 
      function(parsedFeed) {
        var hubEndpoint = parsedFeed.getLinksByRel('hub')[0];
        var notificationEndpoint = webAddressParser.parse(currentClient.generateNotificationEndpoint());
        currentClient.subscribe(feedIdentifier, hubEndpoint, notificationEndpoint,
          function() {
            feedNotifications.emit('feed_subscribed', feedIdentifier.href);
            currentClient.registerNotificationManager(feedIdentifier, feedNotifications);
          },
          function(subscriptionError) {
            feedNotifications.emit('subscription_error', subscriptionError);
          });
      };
      systemTools.puts('processing_callback: ' + processFeedContent);
      atomFeedHandler.parse(responseData, processFeedContent);
    });
  });
  feedRequest.close();

  return feedNotifications;
}


SubscriptionClient.prototype.registerNotificationManager = function(feedIdentifier, feedNotifications) {
  // This method assigns an event emitter to a specific feed identifier.
  // Currently, it overwrites if an emitter already exists for the same feed.
  this.feedNotificationManagers[feedIdentifier.href] = feedNotifications;
}


/**
 * It is essential to invoke this method to activate the server responsible for
 * receiving subscription confirmations and content updates from hubs.
 */
SubscriptionClient.prototype.initiateNotificationReceiver = function() {
  // Begin the HTTP server to handle incoming POSTs for feed updates and GETs for verification.
  systemTools.puts("Initializing notification receiver on port " + this.notificationPort);
  var currentClient = this;
  webClient.createServer(function (incomingRequest, serverResponse) {
    if (incomingRequest.method == 'HTTP_GET') {
      var parsedRequestUrl = webAddressParser.parse(incomingRequest.url);
      var queryParameterList = parsedRequestUrl.query.split("&");
      var parsedParameters = {};
      for (var i=0; i<queryParameterList.length; i++) {
        var paramPair = queryParameterList[i].split("=");
        if (paramPair.length > 1) {
          parsedParameters[paramPair[0]] = paramPair[1];
        } else {
          parsedParameters[paramPair[0]] = '';
        }
      }
      systemTools.puts('pubsub.challenge_key: ' + parsedParameters['hub.challenge']);
      systemTools.puts('pubsub.mode_val: ' + parsedParameters['hub.mode']);
      systemTools.puts('pubsub.topic_url: ' + parsedParameters['hub.topic']);
      systemTools.puts('pubsub.lease_time: ' + parsedParameters['hub.lease_seconds']);
    
      serverResponse.sendHeader(200);
      serverResponse.write(parsedParameters['hub.challenge']);
      serverResponse.close();
    } else if (incomingRequest.method == 'HTTP_POST') {
      systemTools.puts("Incoming POST request from aggregator");
      var responseData = '';
      incomingRequest.setBodyEncoding("UTF-8");
      incomingRequest.addListener('received_data', function(dataChunk) {
        responseData += dataChunk;
      });
      incomingRequest.addListener('response_end', function() {
        serverResponse.sendHeader(200);
        serverResponse.close();
        atomFeedHandler.parse(responseData, function(parsedFeed) {
          var topicIdentifier = removeWhitespace(parsedFeed.id);
          var notifications = currentClient.feedNotificationManagers[topicIdentifier];
          notifications.emit('feed_update', parsedFeed);
        });
      });
    }
  }).listen(this.notificationPort);
}


var ContentPublisher = function() {
  // This class is intended for future implementation of content publishing capabilities.
};


moduleExports.ContentPublisher = ContentPublisher;


ContentPublisher.prototype.publish = function(publicationFeed) {
  // This method would involve extracting the hub URI from the Atom feed
  // and sending an HTTP POST request to that hub with the feed content.
}


function removeWhitespace(inputString) {
      return inputString.replace(/^\s+|\s+$/g,"");
}