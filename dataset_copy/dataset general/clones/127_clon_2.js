/* This module facilitates cross-domain communication using jQuery and an XDM bridge. */

( function ( jQ ) {
  var jQ_XDM_Link = {};
  var mainContext = this;

  // Manages the lifecycle state of the XDM bridge to ensure single instantiation.
  var connectionState = "initial";
  var requestHandlers = []; // Queue for callbacks awaiting bridge readiness.
  var xdmBridgeInstance = null;
  var lastFault = null;

  // Determines if debugging features should be active, controlled by URL parameter.
  var debugEnabled = false;
  if ( /jQ\.XDM\.trace=true/.test( String( document.location.href ) ) ) {
    debugEnabled = true;
  }

  if ( debugEnabled ) {
    if ( jQ( "#traceConsole" ).length === 0 ) {
      jQ( "body" ).append( "<div id=\"traceConsole\"></div>" );
    }
  }

  var initiateBridgeLoad = function ( remoteServiceBase, completionHandlers ) {
    if ( !jQ.support.crossDomain || debugEnabled ) {
      var bridgeScriptURL = remoteServiceBase + "/xdm/xdm.min.js";
      if ( debugEnabled ) {
        bridgeScriptURL = remoteServiceBase + "/xdm/xdm.debug.js";
      }

      function finalizeBridgeSetup() {
        // Isolate the XDM library to prevent conflicts with other instances.
        var isolatedBridge = XDM.releaseGlobals( "jQ_XDM_Link_Scope" );
        // Expose the scoped XDM instance for external access (e.g., from the provider frame).
        jQ_XDM_Link.XDM_Core = isolatedBridge;

        var targetProviderPage = remoteServiceBase + "/js/jQ.XDM.provider.html";
        var embedFrameContainer = jQ( "#xdmProviderHost" )[0] || null;

        if ( debugEnabled ) {
          targetProviderPage += "?jQ.XDM.trace=true";
          if ( !embedFrameContainer ) {
            embedFrameContainer = jQ( "<div id=\"xdmProviderHost\"></div>" ).appendTo( jQ( "body" ) )[0];
          }
        }

        xdmBridgeInstance = new isolatedBridge.RemoteCallService( {
            remoteSource: targetProviderPage,
            flashFallback: remoteServiceBase + "/xdm/xdm_flash.swf",
            hostElement: embedFrameContainer,
            onBridgeReady: function () {
              completionHandlers.onSuccess( xdmBridgeInstance );
            }
          },
          {
            remote: {
              jQ_proxy_interface: {}
            }
          }
        );
      }

      jQ.getScript( bridgeScriptURL, function () {
        // Polyfill JSON for older browsers if necessary before proceeding with bridge setup.
        if ( !( typeof( globalThis.JSON ) === 'object' && globalThis.JSON ) ) {
          jQ.getScript( remoteServiceBase + "/xdm/json_polyfill.js", finalizeBridgeSetup );
        } else {
          finalizeBridgeSetup();
        }
      } );
    }
  };

  jQ_XDM_Link.retrieveBridge = function ( targetHostURL, clientHandlers ) {
    switch ( connectionState ) {
      case "initial":
        connectionState = "initializing";
        requestHandlers.push( clientHandlers );
        initiateBridgeLoad( targetHostURL, {
          onSuccess: function ( activeBridge ) {
            connectionState = "established";
            xdmBridgeInstance = activeBridge;
            for ( let i = 0; i < requestHandlers.length; i++ ) {
              requestHandlers[i].onSuccess( xdmBridgeInstance );
            }
            requestHandlers = []; // Clear queue after all callbacks are served.
          },
          onFailure: function ( failureDetails ) {
            connectionState = "failed";
            lastFault = failureDetails;
            for ( let i = 0; i < requestHandlers.length; i++ ) {
              requestHandlers[i].onFailure( lastFault );
            }
            requestHandlers = [];
          }
        } );
        break;
      case "initializing":
        requestHandlers.push( clientHandlers );
        break;
      case "established":
        clientHandlers.onSuccess( xdmBridgeInstance );
        break;
      case "failed":
        clientHandlers.onFailure( lastFault );
        break;
      default:
        throw new Error( "Unexpected bridge state: " + connectionState );
    }
  };

  jQ.ajaxTransport( "+*", function ( requestSettings, initialSettings, xhrObject ) {
    if ( requestSettings.isCrossDomain && ( !jQ.support.crossDomain || debugEnabled ) ) {
      // Determine the base URL of the remote service to establish a unique bridge connection.
      var remoteHostIdentifier = "";
      var urlParseResult = requestSettings.url.match( /^(https?:\/\/[^\/]*)\/?.*/ );
      if ( urlParseResult ) {
        remoteHostIdentifier = urlParseResult[1];
      }

      return {
        transmitData: function ( requestHeaders, responseCompletionHandler ) {
          jQ_XDM_Link.retrieveBridge( remoteHostIdentifier, {
            onSuccess: function ( xdmBridgeInstance ) {
              function proxyResponseProcessor( responseData ) {
                responseCompletionHandler(
                  responseData.statusCode,
                  responseData.statusMessage,
                  responseData.payloads,
                  responseData.responseHeaders
                );
              }
              initialSettings.callContext = null; // Clear context to avoid potential issues.
              xdmBridgeInstance.jQ_proxy_interface( initialSettings, proxyResponseProcessor );
            },
            onFailure: function () {
              // Handle cases where the XDM bridge connection could not be established.
            }
          } );
        },
        cancelRequest: function () {
          // Placeholder for request cancellation logic if implemented by the XDM bridge.
        }
      };
    }
  } );

  // Expose the XDM bridge utility object globally.
  mainContext.jQ_XDM_Link = jQ_XDM_Link;

} )( jQuery );