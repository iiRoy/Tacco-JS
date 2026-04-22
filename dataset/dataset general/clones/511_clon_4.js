var runtimeEnv = require('system');
var browserPage = require('webpage');

var applicationConfig = {
  authentication: {
    entryPoint: "https://www.amazon.com/ap/signin",
    emailFieldId: "ap_email",
    passwordFieldId: "ap_password",
    submissionFormId: "ap_signin_form",
    userCredential: runtimeEnv.args[1],
    passCredential: runtimeEnv.args[2]
  },
  apiEndpoints: {
    home: "http://read.amazon.com",
    contentListing: "https://read.amazon.com/service/web/reader/getOwnedContent",
    readInitiation: "https://read.amazon.com/service/web/reader/startReading?clientVersion=10505419&asin="
  },
  identityString: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};

function SequenceRunner(steps) {
  var currentStepIndex = 0;
  var sharedState = {};

  function executeNextStep(previousResult) {
    if (currentStepIndex < steps.length) {
      var currentStep = steps[currentStepIndex];
      currentStepIndex++;
      currentStep(sharedState, previousResult, function(error, result) {
        if (error) {
          runtimeEnv.stderr.writeLine("Sequence error: " + error);
          terminateExecution(1);
        } else {
          executeNextStep(result);
        }
      });
    } else {
      runtimeEnv.stderr.writeLine("Sequence completed successfully.");
    }
  }

  this.start = function(initialData) {
    sharedState = initialData || {};
    executeNextStep(null);
  };
}

function initiateSession(sessionDetails, completionHandler) {
  var renderSurface = browserPage.create();
  renderSurface.settings.userAgent = sessionDetails.identityString;

  var capturedRequestHeaders = null;

  renderSurface.onLoadFinished = function(status) {
    if (status === 'success' && renderSurface.url.includes(sessionDetails.authentication.entryPoint)) {
      renderSurface.evaluate(function(authConfig) {
        document.getElementById(authConfig.emailFieldId).value = authConfig.userCredential;
        document.getElementById(authConfig.passwordFieldId).value = authConfig.passCredential;
        document.getElementById(authConfig.submissionFormId).submit();
      }, sessionDetails.authentication);
    }
  };

  renderSurface.onResourceRequested = function(networkEvent) {
    runtimeEnv.stderr.writeLine("Network activity: " + networkEvent.url);
    if (networkEvent.url.includes(sessionDetails.apiEndpoints.contentListing)) {
      renderSurface.close();
      capturedRequestHeaders = networkEvent.headers.reduce(function(acc, h) {
        acc[h.name] = h.value;
        return acc;
      }, {});
      completionHandler(null, capturedRequestHeaders);
    }
  };

  renderSurface.open(sessionDetails.apiEndpoints.home);
}

function fetchContentDetails(itemIdentifiers, contentLibrary, renderSurfaceInstance, endpointConfig, completionCallback) {
  var currentIndex = 0;

  function processNextItem() {
    if (currentIndex < itemIdentifiers.length) {
      var currentItemId = itemIdentifiers[currentIndex];
      runtimeEnv.stderr.writeLine("Acquiring: " + contentLibrary[currentItemId].contentTitle);

      renderSurfaceInstance.open(endpointConfig.readInitiation + currentItemId, function(status) {
        if (status === 'success') {
          contentLibrary[currentItemId].syncInfo = JSON.parse(renderSurfaceInstance.framePlainText);
          currentIndex++;
          processNextItem();
        } else {
          completionCallback("Failed to open " + currentItemId);
        }
      });
    } else {
      completionCallback(null);
    }
  }

  processNextItem();
}

function terminateExecution(exitCode) {
  phantom.exit(exitCode || 0);
}

var executionSteps = [
  function(state, previousResult, next) {
    runtimeEnv.stderr.writeLine("Step 1: Initiating user session.");
    initiateSession(applicationConfig, function(error, headers) {
      if (error) return next(error);
      state.sessionRequestHeaders = headers;
      next(null, headers);
    });
  },

  function(state, previousResult, next) {
    runtimeEnv.stderr.writeLine("Step 2: Accessing content inventory.");
    var contentBrowser = browserPage.create();
    contentBrowser.customHeaders = state.sessionRequestHeaders;

    contentBrowser.open(applicationConfig.apiEndpoints.contentListing, function(status) {
      if (status === 'success') {
        var rawContentData = JSON.parse(contentBrowser.framePlainText);
        state.userContentLibrary = rawContentData.asinsToAdd;
        state.contentItemIDs = Object.keys(state.userContentLibrary);
        contentBrowser.close();
        next(null, state.userContentLibrary);
      } else {
        next("Failed to retrieve content listing.");
      }
    });
  },

  function(state, previousResult, next) {
    runtimeEnv.stderr.writeLine("Step 3: Fetching detailed synchronization data.");
    var detailFetcher = browserPage.create();
    detailFetcher.customHeaders = state.sessionRequestHeaders;

    fetchContentDetails(state.contentItemIDs, state.userContentLibrary, detailFetcher, applicationConfig.apiEndpoints, function(error) {
      if (error) return next(error);
      detailFetcher.close();
      next(null, state.userContentLibrary);
    });
  },

  function(state, previousResult, next) {
    runtimeEnv.stderr.writeLine("Step 4: Finalizing output.");
    console.log(JSON.stringify(state.userContentLibrary));
    next(null);
    terminateExecution();
  }
];

var appFlow = new SequenceRunner(executionSteps);
appFlow.start();