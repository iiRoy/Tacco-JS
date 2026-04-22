// A JavaScript module for handling file uploads and drops,
// including a polyfill for older browsers that lack FormData support,
// leveraging Flash for FileAPI capabilities.
// Authored by a skilled developer.
// Version: <%= pkg.version %> (placeholder for build system)

( function ( ) {

  // Checks if the Adobe Flash Player plugin is installed and accessible.
  var checkPlugin = function ( ) {
    try {
      var flashObject = new ActiveXObject( 'ShockwaveFlash.ShockwaveFlash' );
      if ( flashObject ) return true;
    } catch ( exp ) {
      if ( navigator.mimeTypes[ 'application/x-shockwave-flash' ] !== undefined ) {
        return true;
      }
    }
    return false;
  };

  // Modifies a method on the XMLHttpRequest prototype.
  function modifyAjaxPrototype( methodName, replacementFunc ) {
    window.XMLHttpRequest.prototype[ methodName ] = replacementFunc( window.XMLHttpRequest.prototype[ methodName ] );
  }

  // Determine if shim is needed: XHR exists but FormData is missing, or FileAPI is explicitly forced.
  if ( ( window.XMLHttpRequest && !window.FormData ) || ( window.ShimApi && ShimApi.forceLegacyMode ) ) {
    // Sets up event listeners for upload progress on an XHR object.
    var setupRequestMonitor = function ( ajaxReq ) {
      if ( !ajaxReq._evtHandlers ) {
        if ( !ajaxReq.uploadManager ) ajaxReq.uploadManager = {};
        ajaxReq._evtHandlers = [];
        var originalAddListener = ajaxReq.uploadManager.addEventListener;
        ajaxReq.uploadManager.addEventListener = function ( evtType, handlerFunc, isAsync ) {
          ajaxReq._evtHandlers[ evtType ] = handlerFunc;
          originalAddListener && originalAddListener.apply( this, arguments );
        };
      }
    };

    // Override the 'open' method to initialize listeners and handle IE cross-domain issues.
    modifyAjaxPrototype( 'open', function ( originalOpen ) {
      return function ( requestMethod, resourceUri, isAsync ) {
        setupRequestMonitor( this );
        this._targetUrl = resourceUri;
        try {
          originalOpen.apply( this, [ requestMethod, resourceUri, isAsync ] );
        } catch ( errorObj ) {
          if ( errorObj.message.indexOf( 'Access is denied' ) > -1 ) {
            this._initialError = errorObj;
            originalOpen.apply( this, [ requestMethod, '_ie_compat_proxy_url_', isAsync ] );
          }
        }
      };
    } );

    // Override 'getResponseHeader'.
    modifyAjaxPrototype( 'getResponseHeader', function ( originalGetHeader ) {
      return function ( headerKey ) {
        return this._apiShimResponse && this._apiShimResponse.getResponseHeader ? this._apiShimResponse.getResponseHeader( headerKey ) : ( originalGetHeader === null ? null : originalGetHeader.apply( this, [ headerKey ] ) );
      };
    } );

    // Override 'getAllResponseHeaders'.
    modifyAjaxPrototype( 'getAllResponseHeaders', function ( originalGetAllHeaders ) {
      return function ( ) {
        return this._apiShimResponse && this._apiShimResponse.getAllResponseHeaders ? this._apiShimResponse.getAllResponseHeaders( ) : ( originalGetAllHeaders === null ? null : originalGetAllHeaders.apply( this ) );
      };
    } );

    // Override 'abort'.
    modifyAjaxPrototype( 'abort', function ( originalAbort ) {
      return function ( ) {
        return this._apiShimResponse && this._apiShimResponse.abort ? this._apiShimResponse.abort( ) : ( originalAbort === null ? null : originalAbort.apply( this ) );
      };
    } );

    // Override 'setRequestHeader' to capture custom headers and handle internal directives.
    modifyAjaxPrototype( 'setRequestHeader', function ( originalSetHeader ) {
      return function ( headerName, headerValue ) {
        if ( headerName === '__setXHR_' ) {
          setupRequestMonitor( this );
          var paramValue = headerValue( this );
          // Adaptation for Angular versions prior to 1.2.0
          if ( paramValue instanceof Function ) {
            paramValue( this );
          }
        } else {
          this._requestHeadersMap = this._requestHeadersMap || {};
          this._requestHeadersMap[ headerName ] = headerValue;
          originalSetHeader.apply( this, arguments );
        }
      };
    } );

    // Helper function to redefine a property on an object.
    function overrideProperty( ajaxReq, propName, propertyGetter ) {
      try {
        Object.defineProperty( ajaxReq, propName, { get: propertyGetter } );
      } catch ( exp ) { /* Silently ignores errors during property definition */ }
    }

    // Override 'send' to intercept FileAPI shimmed data.
    modifyAjaxPrototype( 'send', function ( originalSend ) {
      return function ( ) {
        var ajaxReq = this;
        if ( arguments[ 0 ] && arguments[ 0 ]._isShimmedApi ) {
          var requestData = arguments[ 0 ];
          var uploadSettings = {
            url: ajaxReq._targetUrl,
            jsonp: false, // Ensures no JSONP callback parameter is added
            cache: true, // Prevents cache-busting query parameters
            complete: function ( errorState, shimmedAjaxResponse ) {
              ajaxReq._transferCompleted = true;
              if ( !errorState && ajaxReq._evtHandlers[ 'load' ] )
                ajaxReq._evtHandlers[ 'load' ]( { type: 'load', loaded: ajaxReq._bytesTransferred, total: ajaxReq._totalBytes, target: ajaxReq, lengthComputable: true } );
              if ( !errorState && ajaxReq._evtHandlers[ 'loadend' ] )
                ajaxReq._evtHandlers[ 'loadend' ]( { type: 'loadend', loaded: ajaxReq._bytesTransferred, total: ajaxReq._totalBytes, target: ajaxReq, lengthComputable: true } );
              if ( errorState === 'abort' && ajaxReq._evtHandlers[ 'abort' ] )
                ajaxReq._evtHandlers[ 'abort' ]( { type: 'abort', loaded: ajaxReq._bytesTransferred, total: ajaxReq._totalBytes, target: ajaxReq, lengthComputable: true } );
              if ( shimmedAjaxResponse.status !== undefined ) overrideProperty( ajaxReq, 'status', function ( ) { return ( shimmedAjaxResponse.status === 0 && errorState && errorState !== 'abort' ) ? 500 : shimmedAjaxResponse.status; } );
              if ( shimmedAjaxResponse.statusText !== undefined ) overrideProperty( ajaxReq, 'statusText', function ( ) { return shimmedAjaxResponse.statusText; } );
              overrideProperty( ajaxReq, 'readyState', function ( ) { return 4; } );
              if ( shimmedAjaxResponse.response !== undefined ) overrideProperty( ajaxReq, 'response', function ( ) { return shimmedAjaxResponse.response; } );
              var responseContent = shimmedAjaxResponse.responseText || ( errorState && shimmedAjaxResponse.status === 0 && errorState !== 'abort' ? errorState : undefined );
              overrideProperty( ajaxReq, 'responseText', function ( ) { return responseContent; } );
              overrideProperty( ajaxReq, 'response', function ( ) { return responseContent; } );
              if ( errorState ) overrideProperty( ajaxReq, 'error', function ( ) { return errorState; } ); // Changed 'err' to 'error' for semantic clarity.
              ajaxReq._apiShimResponse = shimmedAjaxResponse;
              if ( ajaxReq.onreadystatechange ) ajaxReq.onreadystatechange( );
              if ( ajaxReq.onload ) ajaxReq.onload( );
            },
            fileprogress: function ( progressEvent ) {
              progressEvent.target = ajaxReq;
              ajaxReq._evtHandlers[ 'progress' ] && ajaxReq._evtHandlers[ 'progress' ]( progressEvent );
              ajaxReq._totalBytes = progressEvent.total;
              ajaxReq._bytesTransferred = progressEvent.loaded;
              if ( progressEvent.total === progressEvent.loaded ) {
                // Workaround for Flash not calling 'complete' if server sends no response content.
                var selfRef = this;
                setTimeout( function ( ) {
                  if ( !ajaxReq._transferCompleted ) {
                    ajaxReq.getAllResponseHeaders = function ( ) { }; // Clear headers function to prevent errors
                    selfRef.complete( null, { status: 204, statusText: 'No Content' } );
                  }
                }, ShimApi.emptyResponseTimeout || 10000 );
              }
            },
            headers: ajaxReq._requestHeadersMap
          };
          uploadSettings.data = {};
          uploadSettings.files = {};
          for ( var idx = 0; idx < requestData.data.length; idx++ ) {
            var dataEntry = requestData.data[ idx ];
            if ( dataEntry.val != null && dataEntry.val.name != null && dataEntry.val.size != null && dataEntry.val.type != null ) {
              uploadSettings.files[ dataEntry.key ] = dataEntry.val;
            } else {
              uploadSettings.data[ dataEntry.key ] = dataEntry.val;
            }
          }

          setTimeout( function ( ) {
            if ( !checkPlugin( ) ) {
              throw 'Adobe Flash Player must be installed. Use "ShimApi.pluginAvailable" to check beforehand.';
            }
            ajaxReq._apiShimResponse = ShimApi.upload( uploadSettings );
          }, 1 );
        } else {
          if ( this._initialError ) {
            throw this._initialError;
          }
          originalSend.apply( ajaxReq, arguments );
        }
      };
    } );
    window.XMLHttpRequest._isShimmedApi = true;

    // Checks if a given DOM element is an <input type="file">.
    function isFileInputElement( domElement ) {
      return domElement[ 0 ].tagName.toLowerCase( ) === 'input' && domElement.attr( 'type' ) && domElement.attr( 'type' ).toLowerCase( ) === 'file';
    }

    // Provides a Flash-based fix for IE file input issues.
    ShimApi.shimFixForIE = function ( domElement, createInputFunction, userChangeCallback, clearDataModel ) {
      if ( !checkPlugin( ) ) {
        throw 'Adobe Flash Player must be installed. Use "ShimApi.pluginAvailable" to check beforehand.';
      }
      var createPluginInput = function ( eventObj ) {
        if ( domElement.attr( 'disabled' ) ) {
          domElement._ngFileUploadElement.removeClass( 'js-fileapi-wrapper' );
        } else {
          var inputProxyElement = domElement._ngFileUploadElement = createInputFunction( );
          inputProxyElement.addClass( 'js-fileapi-wrapper' );
          if ( !isFileInputElement( domElement ) ) {
            if ( inputProxyElement.parent( ).css( 'position' ) === '' || inputProxyElement.parent( ).css( 'position' ) === 'static' ) {
              inputProxyElement.parent( ).css( 'position', 'relative' );
            }
            inputProxyElement.css( 'position', 'absolute' ).css( 'top', domElement[ 0 ].offsetTop + 'px' )
              .css( 'left', domElement[ 0 ].offsetLeft + 'px' )
              .css( 'width', domElement[ 0 ].offsetWidth + 'px' )
              .css( 'height', domElement[ 0 ].offsetHeight + 'px' )
              .css( 'padding', domElement.css( 'padding' ) ).css( 'margin', domElement.css( 'margin' ) )
              .css( 'filter', 'alpha(opacity=0)' );
            inputProxyElement.css( 'z-index', '1000' );
          } else {
            // Placeholder for specific handling of native file inputs, if any
          }
          setTimeout( function ( ) {
            inputProxyElement.bind( 'mouseenter', createPluginInput );
          }, 10 );
          inputProxyElement.unbind( 'change' );
          inputProxyElement.bind( 'change', function ( changeEvent ) {
            shimmedInputChangeHandler.apply( this, [ changeEvent ] );
            userChangeCallback.apply( this, [ changeEvent ] );
          } );
        }
      };

      domElement.bind( 'mouseenter', createPluginInput );

      var shimmedInputChangeHandler = function ( changeEvent ) {
        var selectedFiles = ShimApi.retrieveFiles( changeEvent );
        // A secondary check for potential issues, e.g., #233
        for ( var idx = 0; idx < selectedFiles.length; idx++ ) {
          if ( selectedFiles[ idx ].size === undefined ) selectedFiles[ idx ].size = 0;
          if ( selectedFiles[ idx ].name === undefined ) selectedFiles[ idx ].name = 'file';
          if ( selectedFiles[ idx ].type === undefined ) selectedFiles[ idx ].type = 'undefined';
        }
        if ( !changeEvent.target ) {
          changeEvent.target = {};
        }
        changeEvent.target.files = selectedFiles;
        // If event.target.files is read-only, use a helper field.
        if ( changeEvent.target.files !== selectedFiles ) {
          changeEvent._fileListCache = selectedFiles;
        }
        ( changeEvent._fileListCache || changeEvent.target.files ).item = function ( indexVal ) {
          return ( changeEvent._fileListCache || changeEvent.target.files )[ indexVal ] || null;
        };
      };
    };

    // Polyfill for FormData object using FileAPI shim.
    window.DataForm = DataForm = function ( ) {
      return {
        append: function ( keyName, valueData, fileName ) {
          if ( valueData._isShimmedBlob ) {
            valueData = valueData.data[ 0 ];
          }
          this.data.push( {
            key: keyName,
            val: valueData,
            name: fileName
          } );
        },
        data: [],
        _isShimmedApi: true
      };
    };

    // Polyfill for Blob object using FileAPI shim.
    window.BinaryChunk = BinaryChunk = function ( binaryData ) {
      return {
        data: binaryData,
        _isShimmedBlob: true
      };
    };

    // Immediately invoked function to load the FileAPI library if not present.
    ( function ( ) {
      // Initialize ShimApi if not already defined.
      if ( !window.ShimApi ) {
        window.ShimApi = {};
      }
      if ( ShimApi.forceLegacyMode ) {
        ShimApi.html5 = false;
      }

      if ( !ShimApi.upload ) {
        var scriptPath, baseDirectory, scriptElement = document.createElement( 'script' ), allScriptTags = document.getElementsByTagName( 'script' ), idx, position, sourceUrl;
        if ( window.ShimApi.libScriptUrl ) {
          scriptPath = window.ShimApi.libScriptUrl;
        } else if ( window.ShimApi.libScriptPath ) {
          baseDirectory = window.ShimApi.libScriptPath;
        } else {
          for ( idx = 0; idx < allScriptTags.length; idx++ ) {
            sourceUrl = allScriptTags[ idx ].src;
            position = sourceUrl.search( /\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/ );
            if ( position > -1 ) {
              baseDirectory = sourceUrl.substring( 0, position + 1 );
              break;
            }
          }
        }

        if ( ShimApi.staticResourcePath == null ) ShimApi.staticResourcePath = baseDirectory;
        scriptElement.setAttribute( 'src', scriptPath || baseDirectory + 'FileAPI.min.js' );
        document.getElementsByTagName( 'head' )[ 0 ].appendChild( scriptElement );
        ShimApi.pluginAvailable = checkPlugin( );
      }
    } )( );
    // Function to enable/disable file input element styling/behavior.
    ShimApi.disableFileSelection = function ( domElement, shouldDisable ) {
      if ( shouldDisable ) {
        domElement.removeClass( 'js-fileapi-wrapper' );
      } else {
        domElement.addClass( 'js-fileapi-wrapper' );
      }
    };
  }


  // Polyfill for FileReader for browsers that do not support it natively.
  if ( !window.FileReader ) {
    window.FileContentReader = function ( ) {
      var readerInstance = this, loadingInitiated = false;
      this.registeredListeners = {};
      this.addEventListener = function ( evtType, handlerFunc ) {
        readerInstance.registeredListeners[ evtType ] = readerInstance.registeredListeners[ evtType ] || [];
        readerInstance.registeredListeners[ evtType ].push( handlerFunc );
      };
      this.removeEventListener = function ( evtType, handlerFunc ) {
        readerInstance.registeredListeners[ evtType ] && readerInstance.registeredListeners[ evtType ].splice( readerInstance.registeredListeners[ evtType ].indexOf( handlerFunc ), 1 );
      };
      this.dispatchEvent = function ( eventObj ) {
        var eventHandlers = readerInstance.registeredListeners[ eventObj.type ];
        if ( eventHandlers ) {
          for ( var idx = 0; idx < eventHandlers.length; idx++ ) {
            eventHandlers[ idx ].call( readerInstance, eventObj );
          }
        }
      };
      this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

      // Constructs a standardized event object for FileReader.
      var buildEventObject = function ( evtType, originalEvent ) {
        var newEvent = { type: evtType, target: readerInstance, loaded: originalEvent.loaded, total: originalEvent.total, error: originalEvent.error };
        if ( originalEvent.result != null ) newEvent.target.result = originalEvent.result;
        return newEvent;
      };
      // Internal listener to process FileAPI events and dispatch FileReader events.
      var eventReceiver = function ( originalEvent ) {
        if ( !loadingInitiated ) {
          loadingInitiated = true;
          readerInstance.onloadstart && readerInstance.onloadstart( buildEventObject( 'loadstart', originalEvent ) );
        }
        if ( originalEvent.type === 'load' ) {
          readerInstance.onloadend && readerInstance.onloadend( buildEventObject( 'loadend', originalEvent ) );
          var loadEvent = buildEventObject( 'load', originalEvent );
          readerInstance.onload && readerInstance.onload( loadEvent );
          readerInstance.dispatchEvent( loadEvent );
        } else if ( originalEvent.type === 'progress' ) {
          var progressEvent = buildEventObject( 'progress', originalEvent );
          readerInstance.onprogress && readerInstance.onprogress( progressEvent );
          readerInstance.dispatchEvent( progressEvent );
        } else {
          var errorEvent = buildEventObject( 'error', originalEvent );
          readerInstance.onerror && readerInstance.onerror( errorEvent );
          readerInstance.dispatchEvent( errorEvent );
        }
      };
      this.readAsArrayBuffer = function ( targetFile ) {
        ShimApi.readAsBinaryString( targetFile, eventReceiver );
      };
      this.readAsBinaryString = function ( targetFile ) {
        ShimApi.readAsBinaryString( targetFile, eventReceiver );
      };
      this.readAsDataURL = function ( targetFile ) {
        ShimApi.readAsDataURL( targetFile, eventReceiver );
      };
      this.readAsText = function ( targetFile ) {
        ShimApi.readAsText( targetFile, eventReceiver );
      };
    };
    window.FileReader = window.FileContentReader; // Assign the polyfill to the global FileReader
  }
} )( );