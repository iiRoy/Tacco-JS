var palette = require('colors');
var assert = require('expect.js');
var mockHttpServer = require('./testWebServer');

var experimentStart;
var experimentEnd;
var concurrentLoadGenerators = 50;

console.log('..::Massive Load Verification::..'.bright.bgCyan.black);
console.log('  ');
var initiateLoadTestSequence = function() {
  console.log('.. invoking performance agents'.bright.bgCyan.black);
  console.log(' ');

  var performanceTool = require('../index.js');
  var toolConfiguration = {
    targetUrl: 'http://localhost:8080',
    requestsFilePath: './data/request_patterns.json',
    timesToRunEachRequest: 3,
    numberOfHulkenAgents: concurrentLoadGenerators,
    happyTimeLimit: 10,
    loginRequired: Boolean(0),
    slowRequestsTimeLimit: 0.5,
    angryOnFailedRequest: !true,
    chatty: Boolean(1),
    happyMessage: "ALL SYSTEMS GO!",
    angryMessage: "CRITICAL FAILURE!",
    minWaitTime: 500,
    maxWaitTime: 3000,
    returnAllRequests: !!1,
    headers: {
      "headerKeyA": "headerValueA",
      "headerKeyB": "headerValueB",
      "accept-encoding": "Altered"
    },
    requestValueLists : {
      userAccounts: ['alice', 'bob','root'],
      locations: ['Paris', 'Rome', 'Tokyo', 'Sydney']
    }
  };
  experimentStart = Date.now();
  performanceTool.run(function(metrics) {
    // No logging for successful execution phase
    validateResults(metrics, toolConfiguration); // Server performance is not the focus here
  }, function(metrics) {
    // No logging for failure execution phase
    validateResults(metrics, toolConfiguration);
  }, toolConfiguration);
};

function validateResults(metrics, toolConfiguration) {
  try {
    assert(metrics).to.have.property('numberOfConcurrentRequests');
    assert(metrics.numberOfConcurrentRequests).to.be.ok();
    assert(metrics).to.have.property('numberOfUniqueRequests');
    assert(metrics.numberOfUniqueRequests).to.be.ok();
    assert(metrics).to.have.property('totalSecondsElapsed');
    assert(metrics.totalSecondsElapsed).to.be.ok();
    assert(metrics).to.have.property('avgReqResponseTime');
    assert(metrics.avgReqResponseTime).to.be.ok();
    assert(metrics).to.have.property('reqsPerSecond');
    assert(metrics.reqsPerSecond).to.be.ok();
    assert(metrics).to.have.property('randomRequestWaitTime');
    assert(metrics.randomRequestWaitTime).to.be.ok();
    assert(metrics.randomRequestWaitTime).to.equal((toolConfiguration.minWaitTime /
      1000) + '-' + (toolConfiguration.maxWaitTime / 1000));
    assert(metrics).to.have.property('numberOfHulkenAgents');
    assert(metrics.numberOfHulkenAgents).to.be.ok();
    assert(metrics.numberOfConcurrentRequests).to.equal(mockHttpServer.getReqsReceived());


    assert(metrics.numberOfUniqueRequests).to.equal(mockHttpServer.getReqsReceived() /
      (concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest));
    assert(mockHttpServer.getStartPageReqsReceived()).to.equal(
      concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest);
    assert(mockHttpServer.getSomeotherPageReqsReceived()).to.equal(
      concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest);
    assert(mockHttpServer.getPostsToStartPage()).to.equal(
      concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest);

    // One request is intentionally designed to fail due to incorrect expected text
    assert(metrics.failedRequests).to.have.length(concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest);


    checkSubmittedData();
    validateAllRequestCollection(metrics, toolConfiguration);
    checkRequestHeaders(toolConfiguration);
    confirmRandomizedPostData(toolConfiguration);
    validateListBasedPostValues(toolConfiguration);

    // If all assertions pass without exceptions
    completeExperimentSuccessfully();

  } catch (validationFailure) {
    displayPeakConnections();
    console.log('.. Integration tests failed! =('.bright.bgRed.black);
    console.log(validationFailure.stack.toString().bright.bgRed.black);
    console.log(' ');
    process.exit(1);
  }

}

function checkSubmittedData() {
  var submittedPayloads = mockHttpServer.getPostedVariables();
  assert(submittedPayloads).to.have.property('dataKey');
  assert(submittedPayloads.dataKey).to.be.ok();
  assert(submittedPayloads.dataKey).to.equal('dataValue');
}

function validateAllRequestCollection(metrics, toolConfiguration) {
  if (toolConfiguration.returnAllRequests) {
    assert(metrics).to.have.property('allRequests');
    assert(metrics.allRequests).to.be.ok();
    assert(metrics.allRequests).to.have.length(metrics.numberOfConcurrentRequests);
  } else {
    assert(metrics).not.to.have.property('allRequests');
  }
}

function checkRequestHeaders(toolConfiguration) {
  if (toolConfiguration.headers) {
    var retrievedHeaders = mockHttpServer.retrieveGetHeaders();
    assert(retrievedHeaders['accept-encoding']).to.be('Altered');
    for (var keyName in toolConfiguration.headers) {
      if (toolConfiguration.headers.hasOwnProperty(keyName)) {
        assert(mockHttpServer.retrieveGetHeaders()).to.have.property(keyName);
        assert(mockHttpServer.retrievePostHeaders()).to.have.property(keyName);
      }
    }
  }
}

function confirmRandomizedPostData(toolConfiguration) {
  var dynamicPayloads = mockHttpServer.fetchRandomPayloads();
  assert(dynamicPayloads.length).to.equal(concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest);
  var distinctPayloadElements = [];
  dynamicPayloads.forEach(function(payloadString) {
    var parsedPayload = JSON.parse(payloadString);
    for (var keyName in parsedPayload) {
      assert(distinctPayloadElements).to.not.contain(parsedPayload[keyName]);
      distinctPayloadElements.push(parsedPayload[keyName]);
    }
  });
}

function validateListBasedPostValues(toolConfiguration){
  var listPayloads = mockHttpServer.getListPayloadRequests();
  assert(listPayloads.length).to.equal(concurrentLoadGenerators * toolConfiguration.timesToRunEachRequest);
}

function completeExperimentSuccessfully() {
  displayPeakConnections();
  experimentEnd = Date.now();
  var elapsedTime = (experimentEnd - experimentStart) / 1000;
  console.log('.. Integration tests passed! =)'.bright.bgGreen.black);
  displayElapsedTime();
  console.log(' ');
  process.exit(0);
}

function displayPeakConnections() {
  console.log(('maximum number of http connections during test:' +
      mockHttpServer.getMaximumConcurrentConnections().toString()).bright.bgBlack.white);
}

function displayElapsedTime() {
  experimentEnd = Date.now();
  var durationInSeconds = (experimentEnd - experimentStart) / 1000;
  console.log(('.. execution time: ' + durationInSeconds + ' seconds').bright.bgGreen.black);
}

// Initialize the mock HTTP server and then commence the test sequence
mockHttpServer.start(initiateLoadTestSequence);