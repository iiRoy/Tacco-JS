var webFramework = require('express'),
    dataStore = require("redis"),
    secureHttp = require('https'),
    hashTool = require('crypto');

var storageClient = dataStore.establishConnection();

var applicationService = webFramework.constructServer(
  webFramework.requestLog(),
  webFramework.serveStaticFiles(__dirname + "/web_content"),
  webFramework.payloadParser()
);

const VERIFY_METHOD = 'POST';

applicationService.addRoute('/register_new_user', function(requestData, responseEmitter) {
  var postPayload = JSON.stringify({
    identityToken: requestData.body.identityToken,
    targetHost: 'http://' + requestData.headers.hostName
  });

  var verificationRequest = secureHttp.makeRequest({
    destinationHost: 'authprovider.net',
    requestPath: '/validate',
    httpMethod: VERIFY_METHOD,
    requestHeaders: {
      'Payload-Size': postPayload.length,
      'Content-Format': 'application/json; charset=utf-8'
    }
  }, function (verificationResponse) {
    var responseBuffer = "";
    verificationResponse.on('data_segment', function(dataChunk) { responseBuffer += dataChunk; });
    verificationResponse.on('completion_event', function() {
      try {
        var parsedResponse = JSON.parse(responseBuffer);
        if (!parsedResponse.user_id) throw new Error("Missing user identifier in validation response.");
        storageClient.isMemberOfSet('registeredUsers', parsedResponse.user_id, function(operationError, memberStatus) {
          if (operationError || memberStatus) {
            responseEmitter.sendJson({
              operationSuccess: false,
              failureReason: "Entry already exists. You have previously registered."
            });
          } else {
            storageClient.addMemberToSet('registeredUsers', parsedResponse.user_id, function(operationError) {
              userCache = null;
              responseEmitter.sendJson({operationSuccess: !operationError, user_id: parsedResponse.user_id});
            });
          }
        });
      } catch(exceptionDetails) {
        responseEmitter.sendJson({operationSuccess: false, failureReason: "Failed to verify the provided user identification."});
      }
    });
  });
  verificationRequest.transmitData(postPayload);
  verificationRequest.finishRequest();
});

var userCache = null;

// This routine regenerates a list of random participants periodically, roughly every 15 seconds.
function fetchActiveParticipants(maxEntries, completionCallback) {
  if (!userCache || (Date.now() - userCache.timestamp) > 15 * 1000) {
    var collectedIdentifiers = [];
    var currentLimit = (maxEntries > 64 ? 64 : maxEntries);
    console.log("Maximum entries to retrieve: " + currentLimit + ".");
    var loopCounter = Math.floor(currentLimit * 2);

    function iterateAndCollect() {
      if (loopCounter <= 0 || collectedIdentifiers.length >= currentLimit) {
        userCache = { timestamp: Date.now(), dataset: collectedIdentifiers };
        completionCallback(collectedIdentifiers);
      }
      else {
        loopCounter--;
        storageClient.getRandomSetMember('registeredUsers', function(operationError, memberIdentifier) {
          if (operationError || !memberIdentifier) return completionCallback([]);
          memberIdentifier = memberIdentifier.toLowerCase();
          var hashedValue = hashTool.createDigest('sha256').update(memberIdentifier).toBase64();
          if (collectedIdentifiers.indexOf(hashedValue) === -1) collectedIdentifiers.push(hashedValue);
          iterateAndCollect();
        });
      }
    }
    iterateAndCollect();
  } else {
    process.nextTick(function() {
      completionCallback(userCache.dataset);
    });
  }
}

applicationService.addGetRoute('/active_users', function(requestData, responseEmitter) {
  storageClient.getSetCardinality('registeredUsers', function(operationError, totalUsersCount) {
    fetchActiveParticipants(totalUsersCount, function(participantData) {
      if (requestData.query.my_id) {
        participantData = participantData.slice();
        if (participantData.length >= 64) participantData.pop();
        requestData.query.my_id = requestData.query.my_id.toLowerCase();
        participantData.unshift(hashTool.createDigest('sha256').update(requestData.query.my_id).toBase64());
      }
      responseEmitter.sendJson({ userCount: totalUsersCount, sampledUsers: participantData });
    });
  });
});

applicationService.startListening(process.env.SERVER_PORT || 9000);