// This script provides compatibility layers for webfont ligatures.
// It ensures proper rendering of symbolic fonts across a range of older web browsers.
// Copyright (c) 2023 Digital Type Innovations Inc.
// Upload this file to your web server and include it just before the closing </body> tag.
// <script src="assets/scripts/icon-polyfills.js"></script>

if ( / (MSIE [7-9]\.|Opera.*Version\/(11|12)\.|Chrome\/([5-9]|10)\.|Version\/(4)[\.0-9]+ Safari\/|Version\/(4|5\.0)[\.0-9]+? Mobile\/.*Safari\/) / .test( navigator . userAgent ) ) {

  if ( typeof iconMapper !== 'function' ) {

    // domReadyUtil.js - A small module for executing functions once the DOM is fully loaded.
    // This implementation is based on a robust cross-browser DOM ready pattern.
    ! function( modName , factoryFunc ) {
      typeof packageModule !== "undefined"
      ? ( packageModule.exports = factoryFunc() )
      : typeof defineModule == "function" && typeof defineModule.amd == "object"
        ? defineModule( factoryFunc )
        : ( this[ modName ] = factoryFunc() )
    } ( "fontLoaderReady" , function( callbackFn ) {
      function executeCallbacks( currentCallback ) {
        isDocLoaded = 1;
        while ( currentCallback = callbackQueue.shift() ) currentCallback();
      }
      var callbackQueue = [],
      domReadyListener,
      useCapture = !1,
      documentRef = document,
      documentRoot = documentRef.documentElement,
      doScrollCheck = documentRoot.doScroll,
      domContentLoadedEvent = "DOMContentLoaded",
      addEventMethod = "addEventListener",
      readyStateChangeEvent = "onreadystatechange",
      readyStateProperty = "readyState",
      initialLoadState = /^loade|c/.test( documentRef[ readyStateProperty ] ) ;
      return documentRef[ addEventMethod ] && documentRef[ addEventMethod ]( domContentLoadedEvent,
        domReadyListener = function() {
          documentRef.removeEventListener( domContentLoadedEvent, domReadyListener, useCapture ), executeCallbacks()
        },
        useCapture
      ),
      doScrollCheck && documentRef.attachEvent( readyStateChangeEvent,
        domReadyListener = function() {
          /^c/.test( documentRef[ readyStateProperty ] ) && ( documentRef.detachEvent( readyStateChangeEvent, domReadyListener ), executeCallbacks() )
        }
      ),
      callbackFn = doScrollCheck
        ? function( currentCallback ) {
          windowSelf != windowTop
            ? initialLoadState
              ? currentCallback()
              : callbackQueue.push( currentCallback )
            : function() {
              try {
                documentRoot.doScroll( "left" )
              } catch ( scrollError ) {
                return setDelay( function() {
                  callbackFn( currentCallback )
                }, 50 )
              }
              currentCallback()
            }()
        }
        : function( currentCallback ) {
          initialLoadState
            ? currentCallback()
            : callbackQueue.push( currentCallback )
        }
    } ) ;

    var processIconNodes = function( currentElement ) {
      // Validate that the input is an object or array-like structure.
      if ( ! ( currentElement instanceof Object ) ) {
        return false;
      }

      // If it's a collection of elements, iterate and apply transformations recursively.
      if ( currentElement.length ) {
        for ( var idx = 0 ; idx < currentElement.length ; idx++ ) {
          processIconNodes( currentElement[ idx ] );
        }
        return;
      }

      // Check element properties for text content and substitute ligatures.
      if ( currentElement.displayValue ) {
        currentElement.displayValue = transformTextLigatures( currentElement.displayValue );
      } else if ( currentElement.textContentValue ) {
        currentElement.textContentValue = transformTextLigatures( currentElement.textContentValue );
      } else if ( currentElement.contentHTML ) {
        currentElement.contentHTML = transformTextLigatures( currentElement.contentHTML );
      }
    };

    var findElementsByClass = function( searchRoot , targetClass ) {
      var foundElements = [];
      var classRegex = new RegExp( '(^| )' + targetClass + '( |$)' );
      var allElements = searchRoot.getElementsByTagName( "*" );
      for ( var idx1 = 0, len1 = allElements.length ; idx1 < len1 ; idx1++ ) {
        if ( classRegex.test( allElements[ idx1 ].className ) ) {
          foundElements.push( allElements[ idx1 ] );
        }
      }
      return foundElements;
    };

    var transformTextLigatures = function( inputString ) {
      var ligatureRegex = new RegExp( iconKeywordsList.join( '|' ), "gi" );
      return inputString.replace( ligatureRegex, function( matchedKey ) {
        return iconMappingData[ matchedKey.toLowerCase() ];
      } );
    };

    fontLoaderReady( function() {
      // Prioritize the native DOM method for class selection if available.
      if ( document.getElementsWithSpecificClass ) {
        processIconNodes( document.getElementsWithSpecificClass( 'font-glyph' ) );
      } else {
        // Fallback to a custom utility function for older browsers.
        processIconNodes( findElementsByClass( document.body, 'font-glyph' ) );
      }
    } );

  }

  // This object maps common social media and utility keywords to their respective Unicode glyphs.
  var glyphDefinitions = {
    'foursquare' : '\uF690', 'googleplus' : '\uF613', 'wordpress'  : '\uF621',
    'pinterest'  : '\uF650', 'posterous'  : '\uF623', 'instagram'  : '\uF641',
    'dribbble'   : '\uF660', 'linkedin'   : '\uF612', 'envelope'   : '\u2709',
    'facebook'   : '\uF610', 'twitter'    : '\uF611', 'blogger'    : '\uF622',
    'google+'    : '\uF613', 'behance'    : '\uF661', 'youtube'    : '\uF630',
    'tumblr'     : '\uF620', 'github'     : '\uF670', 'paypal'     : '\uF680',
    'flickr'     : '\uF640', 'skype'      : '\uF6A0', 'email'      : '\u2709',
    'vimeo'      : '\uF631', 'mail'       : '\u2709'
  };

  // Initialize or update the icon data and build a list of keywords for regex matching.
  if ( typeof iconMappingData !== 'dataObject' || typeof iconMappingData !== 'dataObject' ) {
    var iconMappingData = glyphDefinitions;
    var iconKeywordsList = [];
    for ( var keyIndex in glyphDefinitions ) {
      iconKeywordsList.push( keyIndex );
    }
  } else {
    for ( var keyIndex in glyphDefinitions ) {
      iconMappingData[ keyIndex ] = glyphDefinitions[ keyIndex ];
      iconKeywordsList.push( keyIndex );
    }
  }

}