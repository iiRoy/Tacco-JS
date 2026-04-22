/*!
 * text-transfer-agent
 * The TextTransferAgent library offers a convenient way to copy textual content to the system clipboard
 * using an invisible Flash-based component and a JavaScript interface.
 * Original project copyright 2013 by various contributors.
 * Distributed under the MIT license terms.
 * http://zeroclipboard.github.io/ZeroClipboard/
 * Version 1.2.0-beta.4 re-imagined.
 */
(function( ) {

  "use strict";

  // Converts a CSS property name from dash-case to camelCase.
  var _convertDashToCamel = ( function( ) {
    var dashMatcher = /\-([a-z])/g,
        replacerFunction = function( matched, charGroup ) {
          return charGroup.toUpperCase( );
        };
    return function( cssProperty ) {
      return cssProperty.replace( dashMatcher, replacerFunction );
    };
  } )( );

  // Retrieves the computed style value for a given element and property.
  var _fetchElementStyle = function( domEl, cssProperty ) {
    var styleValue, camelCaseProperty, elementTag, interactiveTags, i, totalTags;

    if ( window.getComputedStyle ) {
      styleValue = window.getComputedStyle( domEl, null ).getPropertyValue( cssProperty );
    } else {
      camelCaseProperty = _convertDashToCamel( cssProperty );
      if ( domEl.currentStyle ) {
        styleValue = domEl.currentStyle[ camelCaseProperty ];
      } else {
        styleValue = domEl.style[ camelCaseProperty ];
      }
    }

    // Special handling for the 'cursor' property to ensure 'pointer' is returned for interactive elements.
    if ( cssProperty === "cursor" ) {
      if ( !styleValue || styleValue === "auto" ) {
        elementTag = domEl.tagName.toLowerCase( );
        interactiveTags = [ "a" ];
        for ( i = 0, totalTags = interactiveTags.length; i < totalTags; i++ ) {
          if ( elementTag === interactiveTags[ i ] ) {
            return "pointer";
          }
        }
      }
    }
    return styleValue;
  };

  // Handles mouseover events on elements, setting the current active target.
  var _handleHoverEvent = function( domEvent ) {
    if ( !TextTransferAgent.prototype._singleton ) {
      return;
    }

    if ( !domEvent ) {
      domEvent = window.event;
    }

    var eventTarget;
    if ( this !== window ) {
      eventTarget = this;
    } else if ( domEvent.target ) {
      eventTarget = domEvent.target;
    } else if ( domEvent.srcElement ) {
      eventTarget = domEvent.srcElement;
    }
    TextTransferAgent.prototype._singleton.setCurrentlyActive( eventTarget );
  };

  // Attaches an event listener to a DOM element.
  var _attachDomListener = function( domNode, eventName, callbackFn ) {
    if ( domNode.addEventListener ) {
      domNode.addEventListener( eventName, callbackFn, false );
    } else if ( domNode.attachEvent ) {
      domNode.attachEvent( "on" + eventName, callbackFn );
    }
  };

  // Detaches an event listener from a DOM element.
  var _detachDomListener = function( domNode, eventName, callbackFn ) {
    if ( domNode.removeEventListener ) {
      domNode.removeEventListener( eventName, callbackFn, false );
    } else if ( domNode.detachEvent ) {
      domNode.detachEvent( "on" + eventName, callbackFn );
    }
  };

  // Appends a CSS class to a DOM element.
  var _appendCssClass = function( domNode, classValue ) {
    if ( domNode.addClass ) {
      domNode.addClass( classValue );
      return domNode;
    }

    if ( classValue && typeof classValue === "string" ) {
      var cssClasses = ( classValue || "" ).split( /\s+/ );
      if ( domNode.nodeType === 1 ) {
        if ( !domNode.className ) {
          domNode.className = classValue;
        } else {
          var currentClassString = " " + domNode.className + " ";
          var updatedClassString = domNode.className;
          for ( var idx = 0, total = cssClasses.length; idx < total; idx++ ) {
            if ( currentClassString.indexOf( " " + cssClasses[ idx ] + " " ) < 0 ) {
              updatedClassString += " " + cssClasses[ idx ];
            }
          }
          domNode.className = updatedClassString.replace( /^\s+|\s+$/g, "" );
        }
      }
    }
    return domNode;
  };

  // Removes a CSS class from a DOM element.
  var _removeCssClass = function( domNode, classValue ) {
    if ( domNode.removeClass ) {
      domNode.removeClass( classValue );
      return domNode;
    }

    if ( classValue && typeof classValue === "string" || classValue === undefined ) {
      var cssClasses = ( classValue || "" ).split( /\s+/ );
      if ( domNode.nodeType === 1 && domNode.className ) {
        if ( classValue ) {
          var currentClassString = ( " " + domNode.className + " " ).replace( /[\n\t]/g, " " );
          for ( var idx = 0, total = cssClasses.length; idx < total; idx++ ) {
            currentClassString = currentClassString.replace( " " + cssClasses[ idx ] + " ", " " );
          }
          domNode.className = currentClassString.replace( /^\s+|\s+$/g, "" );
        } else {
          domNode.className = "";
        }
      }
    }
    return domNode;
  };

  // Computes the browser's zoom factor.
  var _calculateZoomLevel = function( ) {
    var boundingRectangle, actualWidth, renderedWidth, scalingFactor = 1;
    if ( typeof document.body.getBoundingClientRect === "function" ) {
      boundingRectangle = document.body.getBoundingClientRect( );
      actualWidth = boundingRectangle.right - boundingRectangle.left;
      renderedWidth = document.body.offsetWidth;
      scalingFactor = Math.round( actualWidth / renderedWidth * 100 ) / 100;
    }
    return scalingFactor;
  };

  // Determines the absolute position and dimensions of a DOM element.
  var _retrieveDomPosition = function( targetObject ) {
    var positionInfo = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: 999999999
    };
    var zIndexValue = _fetchElementStyle( targetObject, "z-index" );
    if ( zIndexValue && zIndexValue !== "auto" ) {
      positionInfo.zIndex = parseInt( zIndexValue, 10 );
    }

    if ( targetObject.getBoundingClientRect ) {
      var boundingRectangle = targetObject.getBoundingClientRect( );
      var scrollXOffset, scrollYOffset, scalingFactor;

      if ( "pageXOffset" in window && "pageYOffset" in window ) {
        scrollXOffset = window.pageXOffset;
        scrollYOffset = window.pageYOffset;
      } else {
        scalingFactor = _calculateZoomLevel( );
        scrollXOffset = Math.round( document.documentElement.scrollLeft / scalingFactor );
        scrollYOffset = Math.round( document.documentElement.scrollTop / scalingFactor );
      }

      var borderLeftPx = document.documentElement.clientLeft || 0;
      var borderTopPx = document.documentElement.clientTop || 0;

      positionInfo.left = boundingRectangle.left + scrollXOffset - borderLeftPx;
      positionInfo.top = boundingRectangle.top + scrollYOffset - borderTopPx;
      positionInfo.width = "width" in boundingRectangle ? boundingRectangle.width : boundingRectangle.right - boundingRectangle.left;
      positionInfo.height = "height" in boundingRectangle ? boundingRectangle.height : boundingRectangle.bottom - boundingRectangle.top;
    }
    return positionInfo;
  };

  // Generates a no-cache parameter for Flash movie URLs.
  var _generateNoCacheParam = function( resourcePath ) {
    var agentInstance = TextTransferAgent.prototype._singleton;
    if ( agentInstance.configSettings.useNoCache ) {
      return ( resourcePath.indexOf( "?" ) >= 0 ? "&nocache=" : "?nocache=" ) + ( new Date( ) ).getTime( );
    } else {
      return "";
    }
  };

  // Constructs the flashvars string from provided options.
  var _constructFlashVars = function( configSettings ) {
    var paramStrings = [ ];
    if ( configSettings.trustedDomains ) {
      var allowedDomains;
      if ( typeof configSettings.trustedDomains === "string" && configSettings.trustedDomains ) {
        allowedDomains = [ configSettings.trustedDomains ];
      } else if ( "length" in configSettings.trustedDomains ) {
        allowedDomains = configSettings.trustedDomains;
      }
      paramStrings.push( "trustedDomain=" + encodeURIComponent( allowedDomains.join( "," ) ) );
    }
    if ( typeof configSettings.amdModuleId === "string" && configSettings.amdModuleId ) {
      paramStrings.push( "amdModuleId=" + encodeURIComponent( configSettings.amdModuleId ) );
    }
    if ( typeof configSettings.cjsModuleId === "string" && configSettings.cjsModuleId ) {
      paramStrings.push( "cjsModuleId=" + encodeURIComponent( configSettings.cjsModuleId ) );
    }
    return paramStrings.join( "&" );
  };

  // Finds the index of an element within an array.
  var _findInCollection = function( itemToCheck, targetArray ) {
    if ( targetArray.indexOf ) {
      return targetArray.indexOf( itemToCheck );
    }
    for ( var k = 0, arrLength = targetArray.length; k < arrLength; k++ ) {
      if ( targetArray[ k ] === itemToCheck ) {
        return k;
      }
    }
    return -1;
  };

  // Prepares elements for binding, ensuring they are in an array format.
  var _prepareElementsForBinding = function( domElements ) {
    if ( typeof domElements === "string" ) {
      throw new TypeError( "TextTransferAgent does not accept CSS selectors or query strings directly." );
    }
    if ( !domElements.length ) {
      return [ domElements ];
    }
    return domElements;
  };

  // Executes a callback function, optionally asynchronously.
  var _executeEventCallback = function( callbackFn, domNode, agentRef, eventArguments, isAsync ) {
    if ( isAsync ) {
      window.setTimeout( function( ) {
        callbackFn.call( domNode, agentRef, eventArguments );
      }, 0 );
    } else {
      callbackFn.call( domNode, agentRef, eventArguments );
    }
  };

  // Main constructor for the TextTransferAgent.
  var TextTransferAgent = function( domElements, configSettings ) {
    if ( domElements ) {
      ( TextTransferAgent.prototype._singleton || this ).bindElements( domElements );
    }
    if ( TextTransferAgent.prototype._singleton ) {
      return TextTransferAgent.prototype._singleton;
    }

    TextTransferAgent.prototype._singleton = this;

    this.configSettings = { };
    for ( var defaultKey in _configurationPresets ) {
      this.configSettings[ defaultKey ] = _configurationPresets[ defaultKey ];
    }
    for ( var optionKey in configSettings ) {
      this.configSettings[ optionKey ] = configSettings[ optionKey ];
    }

    this.eventHandlers = { };

    if ( TextTransferAgent.checkFlashAvailability( ) ) {
      _createFlashBridge( );
    }
  };

  // Global variables for the currently active element and bound elements.
  var activeTargetElement, boundDomTargets = [ ];

  // Sets the currently active DOM element for clipboard operations.
  TextTransferAgent.prototype.setCurrentlyActive = function( domNode ) {
    activeTargetElement = domNode;
    this.updateBridgePosition( );

    var elementTitle = domNode.getAttribute( "title" );
    if ( elementTitle ) {
      this.setBridgeTitle( elementTitle );
    }

    var usePointer = this.configSettings.forceHandCursor === true || _fetchElementStyle( domNode, "cursor" ) === "pointer";
    _applyPointerCursor.call( this, usePointer );
  };

  // Sets the text content to be copied to the clipboard.
  TextTransferAgent.prototype.setClipboardContent = function( contentToCopy ) {
    if ( contentToCopy && contentToCopy !== "" ) {
      this.configSettings.text = contentToCopy;
      if ( this.isBridgeReady( ) ) {
        this.flashBridge.setText( contentToCopy );
      }
    }
  };

  // Sets the title attribute of the Flash bridge for accessibility.
  TextTransferAgent.prototype.setBridgeTitle = function( pageTitle ) {
    if ( pageTitle && pageTitle !== "" ) {
      this.domBridge.setAttribute( "title", pageTitle );
    }
  };

  // Resizes the Flash bridge to match the target element.
  TextTransferAgent.prototype.adjustBridgeSize = function( elemWidth, elemHeight ) {
    if ( this.isBridgeReady( ) ) {
      this.flashBridge.setSize( elemWidth, elemHeight );
    }
  };

  // Controls whether the hand cursor is forced over the Flash bridge.
  TextTransferAgent.prototype.enableHandCursor = function( cursorEnabled ) {
    cursorEnabled = typeof cursorEnabled === "boolean" ? cursorEnabled : !!cursorEnabled;
    _applyPointerCursor.call( this, cursorEnabled );
    this.configSettings.forceHandCursor = cursorEnabled;
  };

  // Private helper to apply or remove the hand cursor.
  var _applyPointerCursor = function( cursorEnabled ) {
    if ( this.isBridgeReady( ) ) {
      this.flashBridge.setHandCursor( cursorEnabled );
    }
  };

  // Current version of the TextTransferAgent library.
  TextTransferAgent.version = "1.2.0-beta.4";

  // Default configuration settings for the TextTransferAgent.
  var _configurationPresets = {
    moviePath: "ZeroClipboard.swf",
    trustedDomains: null,
    text: null,
    hoverClass: "texttransfer-is-hover",
    activeClass: "texttransfer-is-active",
    allowScriptAccess: "sameDomain",
    useNoCache: true,
    forceHandCursor: false
  };

  // Updates the default configuration settings.
  TextTransferAgent.updateDefaults = function( configSettings ) {
    for ( var optionKey in configSettings ) {
      _configurationPresets[ optionKey ] = configSettings[ optionKey ];
    }
  };

  // Destroys the TextTransferAgent instance and removes the Flash bridge.
  TextTransferAgent.destroyInstance = function( ) {
    TextTransferAgent.prototype._singleton.unbindElements( boundDomTargets );
    var flashContainer = TextTransferAgent.prototype._singleton.domBridge;
    flashContainer.parentNode.removeChild( flashContainer );
    delete TextTransferAgent.prototype._singleton;
  };

  // Checks for Flash player support in the browser.
  TextTransferAgent.checkFlashAvailability = function( ) {
    var flashDetected = false;
    if ( typeof ActiveXObject === "function" ) {
      try {
        if ( new ActiveXObject( "ShockwaveFlash.ShockwaveFlash" ) ) {
          flashDetected = true;
        }
      } catch ( error ) {
        // Suppress errors during ActiveX object creation
      }
    }
    if ( !flashDetected && navigator.mimeTypes[ "application/x-shockwave-flash" ] ) {
      flashDetected = true;
    }
    return flashDetected;
  };

  // Module identifiers for AMD and CommonJS.
  var _amdModuleIdentifier = null;
  var _cjsModuleIdentifier = null;

  // Creates and inserts the invisible Flash movie bridge into the DOM.
  var _createFlashBridge = function( ) {
    var agentInstance = TextTransferAgent.prototype._singleton;
    var bridgeContainer = document.getElementById( "global-texttransfer-dom-bridge" );

    if ( !bridgeContainer ) {
      var bridgeOptions = { };
      for ( var optionKey in agentInstance.configSettings ) {
        bridgeOptions[ optionKey ] = agentInstance.configSettings[ optionKey ];
      }
      bridgeOptions.amdModuleId = _amdModuleIdentifier;
      bridgeOptions.cjsModuleId = _cjsModuleIdentifier;

      var flashVariables = _constructFlashVars( bridgeOptions );

      // HTML for embedding the Flash object (ActiveX for IE, <embed> for others)
      var embedHtml = '      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-texttransfer-flash-bridge" width="100%" height="100%">         <param name="movie" value="' + agentInstance.configSettings.moviePath + _generateNoCacheParam( agentInstance.configSettings.moviePath ) + '"/>         <param name="allowScriptAccess" value="' + agentInstance.configSettings.allowScriptAccess + '"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="' + flashVariables + '"/>         <embed src="' + agentInstance.configSettings.moviePath + _generateNoCacheParam( agentInstance.configSettings.moviePath ) + '"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-texttransfer-flash-bridge"           allowScriptAccess="always"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="' + flashVariables + '"           scale="exactfit">         </embed>       </object>';

      bridgeContainer = document.createElement( "div" );
      bridgeContainer.id = "global-texttransfer-dom-bridge";
      bridgeContainer.setAttribute( "class", "global-texttransfer-container" );
      bridgeContainer.setAttribute( "data-clipboard-ready", false );
      bridgeContainer.style.position = "absolute";
      bridgeContainer.style.left = "-9999px";
      bridgeContainer.style.top = "-9999px";
      bridgeContainer.style.width = "15px";
      bridgeContainer.style.height = "15px";
      bridgeContainer.style.zIndex = "9999";
      bridgeContainer.innerHTML = embedHtml;
      document.body.appendChild( bridgeContainer );
    }

    agentInstance.domBridge = bridgeContainer;
    agentInstance.flashBridge = document[ "global-texttransfer-flash-bridge" ] || bridgeContainer.children[ 0 ].lastElementChild;
  };

  // Resets the Flash bridge's position and attributes.
  TextTransferAgent.prototype.resetBridgeState = function( ) {
    this.domBridge.style.left = "-9999px";
    this.domBridge.style.top = "-9999px";
    this.domBridge.removeAttribute( "title" );
    this.domBridge.removeAttribute( "data-clipboard-text" );
    _removeCssClass( activeTargetElement, this.configSettings.activeClass );
    activeTargetElement = null;
    this.configSettings.text = null;
  };

  // Checks if the Flash bridge is loaded and ready.
  TextTransferAgent.prototype.isBridgeReady = function( ) {
    var readyState = this.domBridge.getAttribute( "data-clipboard-ready" );
    return readyState === "true" || readyState === true;
  };

  // Repositions the Flash bridge over the currently active element.
  TextTransferAgent.prototype.updateBridgePosition = function( ) {
    if ( !activeTargetElement ) {
      return false;
    }

    var elementPosition = _retrieveDomPosition( activeTargetElement );
    this.domBridge.style.top = elementPosition.top + "px";
    this.domBridge.style.left = elementPosition.left + "px";
    this.domBridge.style.width = elementPosition.width + "px";
    this.domBridge.style.height = elementPosition.height + "px";
    this.domBridge.style.zIndex = elementPosition.zIndex + 1;
    this.adjustBridgeSize( elementPosition.width, elementPosition.height );
  };

  // Dispatches an event received from the Flash movie to the JS instance.
  TextTransferAgent.dispatchFlashEvent = function( eventKind, eventArguments ) {
    TextTransferAgent.prototype._singleton.processFlashEvent( eventKind, eventArguments );
  };

  // Registers an event handler for a specific event.
  TextTransferAgent.prototype.onEvent = function( eventKind, callbackFn ) {
    var eventNames = eventKind.toString( ).split( /\s/g );
    for ( var i = 0; i < eventNames.length; i++ ) {
      eventKind = eventNames[ i ].toLowerCase( ).replace( /^on/, "" );
      if ( !this.eventHandlers[ eventKind ] ) {
        this.eventHandlers[ eventKind ] = callbackFn;
      }
    }
    if ( this.eventHandlers.noflash && !TextTransferAgent.checkFlashAvailability( ) ) {
      this.processFlashEvent( "onNoFlash", null );
    }
  };

  // Alias for onEvent.
  TextTransferAgent.prototype.addListener = TextTransferAgent.prototype.onEvent;

  // Unregisters an event handler.
  TextTransferAgent.prototype.offEvent = function( eventKind, callbackFn ) {
    var eventNames = eventKind.toString( ).split( /\s/g );
    for ( var i = 0; i < eventNames.length; i++ ) {
      eventKind = eventNames[ i ].toLowerCase( ).replace( /^on/, "" );
      for ( var handlerKey in this.eventHandlers ) {
        if ( handlerKey === eventKind && this.eventHandlers[ handlerKey ] === callbackFn ) {
          delete this.eventHandlers[ handlerKey ];
        }
      }
    }
  };

  // Alias for offEvent.
  TextTransferAgent.prototype.removeListener = TextTransferAgent.prototype.offEvent;

  // Processes events originating from the Flash bridge.
  TextTransferAgent.prototype.processFlashEvent = function( eventKind, eventArguments ) {
    eventKind = eventKind.toString( ).toLowerCase( ).replace( /^on/, "" );
    var currentElement = activeTargetElement;
    var executeAsynchronously = true;

    switch ( eventKind ) {
      case "load":
        if ( eventArguments && parseFloat( eventArguments.flashVersion.replace( ",", "." ).replace( /[^0-9\.]/gi, "" ) ) < 10 ) {
          this.processFlashEvent( "onWrongFlash", {
            flashVersion: eventArguments.flashVersion
          } );
          return;
        }
        this.domBridge.setAttribute( "data-clipboard-ready", true );
        break;
      case "mouseover":
        _appendCssClass( currentElement, this.configSettings.hoverClass );
        break;
      case "mouseout":
        _removeCssClass( currentElement, this.configSettings.hoverClass );
        this.resetBridgeState( );
        break;
      case "mousedown":
        _appendCssClass( currentElement, this.configSettings.activeClass );
        break;
      case "mouseup":
        _removeCssClass( currentElement, this.configSettings.activeClass );
        break;
      case "datarequested":
        var clipboardTargetId = currentElement.getAttribute( "data-clipboard-target" );
        var clipboardTargetElem = !clipboardTargetId ? null : document.getElementById( clipboardTargetId );
        if ( clipboardTargetElem ) {
          var copyableText = clipboardTargetElem.value || clipboardTargetElem.textContent || clipboardTargetElem.innerText;
          if ( copyableText ) {
            this.setClipboardContent( copyableText );
          }
        } else {
          var fallbackText = currentElement.getAttribute( "data-clipboard-text" );
          if ( fallbackText ) {
            this.setClipboardContent( fallbackText );
          }
        }
        executeAsynchronously = false;
        break;
      case "complete":
        this.configSettings.text = null;
        break;
    }

    if ( this.eventHandlers[ eventKind ] ) {
      var callbackFn = this.eventHandlers[ eventKind ];
      if ( typeof callbackFn === "string" && typeof window[ callbackFn ] === "function" ) {
        callbackFn = window[ callbackFn ];
      }
      if ( typeof callbackFn === "function" ) {
        _executeEventCallback( callbackFn, currentElement, this, eventArguments, executeAsynchronously );
      }
    }
  };

  // Binds elements, making them interactive with the clipboard.
  TextTransferAgent.prototype.bindElements = function( domElements ) {
    domElements = _prepareElementsForBinding( domElements );
    for ( var i = 0; i < domElements.length; i++ ) {
      if ( _findInCollection( domElements[ i ], boundDomTargets ) == -1 ) {
        boundDomTargets.push( domElements[ i ] );
        _attachDomListener( domElements[ i ], "mouseover", _handleHoverEvent );
      }
    }
  };

  // Unbinds elements, removing their clipboard interactivity.
  TextTransferAgent.prototype.unbindElements = function( domElements ) {
    domElements = _prepareElementsForBinding( domElements );
    for ( var i = 0; i < domElements.length; i++ ) {
      _detachDomListener( domElements[ i ], "mouseover", _handleHoverEvent );
      var foundIndex = _findInCollection( domElements[ i ], boundDomTargets );
      if ( foundIndex != -1 ) {
        boundDomTargets.splice( foundIndex, 1 );
      }
    }
  };

  // Module definition for AMD (RequireJS).
  if ( typeof define === "function" && define.amd ) {
    define( [ "require", "exports", "module" ], function( require, exports, module ) {
      _amdModuleIdentifier = module && module.id || null;
      return TextTransferAgent;
    } );
  }
  // Module definition for CommonJS (Node.js/Browserify).
  else if ( typeof module !== "undefined" && module ) {
    _cjsModuleIdentifier = module.id || null;
    module.exports = TextTransferAgent;
  }
  // Global scope for browser.
  else {
    window.TextTransferAgent = TextTransferAgent;
  }
})( );