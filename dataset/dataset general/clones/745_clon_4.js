(function(globalWindow) {
  var _applicationRegistry = {
    _platformCapabilities: {
      mozFeatureAvailable: false
    },
    _systemStatus: {
      appCurrentlyPresent: false
    },
    _processingFunctions: {
      initiateApplicationDeployment: function() {}
    }
  };

  // Determine if the platform supports the required feature
  _applicationRegistry._platformCapabilities.mozFeatureAvailable = !!globalWindow.navigator.mozApps;

  // If the feature is present, check the application's current installation state
  if (_applicationRegistry._platformCapabilities.mozFeatureAvailable) {
    var _featureInterface = globalWindow.navigator.mozApps;
    var _selfRetrievalRequest = _featureInterface.getSelf();

    _selfRetrievalRequest.onsuccess = function() {
      _applicationRegistry._systemStatus.appCurrentlyPresent = !!_selfRetrievalRequest.result;
    };
    // Original code did not handle onerror for getSelf, so we omit it here as well.
  }

  // Define the core application deployment operation
  _applicationRegistry._processingFunctions.initiateApplicationDeployment = function() {
    return new Promise(function(_resolveAction, _rejectAction) {
      if (!_applicationRegistry._platformCapabilities.mozFeatureAvailable) {
        return _rejectAction(new Error("Required platform capability for deployment is absent."));
      }

      // Construct the manifest path dynamically
      var _currentDocumentLocation = globalWindow.location.href.split('#')[0];
      var _baseDirectory = _currentDocumentLocation.substring(0, _currentDocumentLocation.lastIndexOf('/'));
      var _manifestSourceURL = _baseDirectory + '/manifest.webapp';

      var _featureInterface = globalWindow.navigator.mozApps;
      var _deploymentAttempt = _featureInterface.install(_manifestSourceURL);

      _deploymentAttempt.onsuccess = function() {
        _applicationRegistry._systemStatus.appCurrentlyPresent = true;
        _resolveAction();
      };

      _deploymentAttempt.onerror = function() {
        // Divergent error reporting: use Promise rejection instead of alert
        _rejectAction(new Error("Application deployment encountered an issue: " + _deploymentAttempt.error.name));
      };
    });
  };

  // Expose a public interface for external control
  globalWindow.appLifecycleManager = {
    queryMozAppCapability: function() {
      return _applicationRegistry._platformCapabilities.mozFeatureAvailable;
    },
    queryInstallationState: function() {
      return _applicationRegistry._systemStatus.appCurrentlyPresent;
    },
    triggerApplicationInstallation: function() {
      return _applicationRegistry._processingFunctions.initiateApplicationDeployment();
    }
  };

})(window);