(function (jq) {
  var crossDomainBridge = {};
  var currentGlobalScope = this;

  var dbgModeActive = false;
  if (/xdom\.bridge\.dbg=on/.test(String(currentGlobalScope.location))) {
    dbgModeActive = true;
  }
  if (dbgModeActive) {
    if (jq("#xdom_bridge_log").length === 0) {
      jq("body").append("<div id=\"xdom_bridge_log\"></div>");
    }
  }

  var gatewayPromiseHandle = null;
  var activeGatewayInstance = null;
  var gatewaySetupFailure = null;

  var loadScriptAsset = function (scriptUrl) {
    return new Promise((resolve, reject) => {
      var scriptElement = document.createElement('script');
      scriptElement.src = scriptUrl;
      scriptElement.async = true;
      scriptElement.onload = () => resolve(scriptElement);
      scriptElement.onerror = () => reject(new Error('Script load failed: ' + scriptUrl));
      document.head.appendChild(scriptElement);
    });
  };

  var initiateGatewaySetup = function (baseOriginPath, setupHandlers) {
    var xdomScriptPath = baseOriginPath + "/easyXDM/easyXDM.min.js";
    if (dbgModeActive) {
      xdomScriptPath = baseOriginPath + "/easyXDM/easyXDM.debug.js";
    }

    loadScriptAsset(xdomScriptPath)
      .then(() => {
        var proceedAfterXdomLoad = function () {
          var localXDMRef = easyXDM.noConflict("xdom_bridge_api");
          crossDomainBridge.xdomApi = localXDMRef;

          var xdomRemoteSource = baseOriginPath + "/javascripts/jquery.easyXDM.provider.html";
          var gatewayContainerElem = jq("#xdom_bridge_provider_box")[0] || null;

          if (dbgModeActive) {
            xdomRemoteSource += "?xdom.bridge.dbg=on";
            if (!gatewayContainerElem) {
              gatewayContainerElem = jq("<div id=\"xdom_bridge_provider_box\"></div>").appendTo(jq("body"))[0];
            }
          }

          var currentXDMConnection = new localXDMRef.Rpc(
            {
              remote: xdomRemoteSource,
              swf: baseOriginPath + "/easyXDM/easyxdm.swf",
              container: gatewayContainerElem,
              onReady: function () {
                setupHandlers.success(currentXDMConnection);
              }
            },
            { remote: { proxyInterface: {} } }
          );
        };

        if (typeof window.JSON !== 'object' || !window.JSON) {
          loadScriptAsset(baseOriginPath + "/easyXDM/json2.js")
            .then(proceedAfterXdomLoad)
            .catch(err => setupHandlers.failure(err));
        } else {
          proceedAfterXdomLoad();
        }
      })
      .catch(err => setupHandlers.failure(err));
  };

  crossDomainBridge.retrieveGateway = function (baseOriginPath, requestCallbacks) {
    if (activeGatewayInstance) {
      requestCallbacks.success(activeGatewayInstance);
      return;
    }
    if (gatewaySetupFailure) {
      requestCallbacks.failure(gatewaySetupFailure);
      return;
    }

    if (!gatewayPromiseHandle) {
      gatewayPromiseHandle = new Promise((resolve, reject) => {
        initiateGatewaySetup(baseOriginPath, {
          success: (instance) => {
            activeGatewayInstance = instance;
            resolve(instance);
          },
          failure: (err) => {
            gatewaySetupFailure = err;
            reject(err);
          }
        });
      });
    }

    gatewayPromiseHandle.then(requestCallbacks.success).catch(requestCallbacks.failure);
  };

  jq.ajaxTransport("+*", function (transportOptions, requestSettings, xhrHandle) {
    if (transportOptions.crossDomain && (!jq.support.cors || dbgModeActive)) {
      var originEndpoint = "";
      var urlMatchDetails = transportOptions.url.match(/^(https?:\/\/[^\/]*)\/?.*/);
      if (urlMatchDetails) {
        originEndpoint = urlMatchDetails[1];
      }

      return {
        transmitData: function (headersToSend, completionNotifier) {
          crossDomainBridge.retrieveGateway(originEndpoint, {
            success: function (currentGateway) {
              function proxyResponseHandler(transferResults) {
                completionNotifier(transferResults.status, transferResults.statusText, transferResults.responses, transferResults.headers);
              }
              requestSettings.context = null;
              currentGateway.proxyInterface(requestSettings, proxyResponseHandler);
            },
            error: function () {
            }
          });
        },
        cancelTransmission: function () {
        }
      };
    }
  });

  currentGlobalScope.crossDomainBridge = crossDomainBridge;
})(jQuery);