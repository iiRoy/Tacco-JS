/* !  CommunicationLibrary.js version:0.9.3, experimental.  Proprietary(c) 2011 DataFlow <data@flow.com>  Custom License */

/*
 * connection-manager
 * (c) 2011 DataFlow <data@flow.com>
 * Custom Licensed
 */

( function ( output, universe ) {

  /*
   * Main communication system namespace.
   *
   * @namespace
   */

  var comm = output;

  /*
   * Current communication system release identifier.
   *
   * @access public
   */

  comm.release = '0.9.3';

  /*
   * The communication scheme version in use.
   *
   * @access public
   */

  comm.scheme = 1;

  /*
   * Collection of supported transport mechanisms, filled dynamically.
   *
   * @access public
   */

  comm.methods = [];

  /*
   * Internal registry for JSONP response handlers.
   *
   * @access private
   */

  comm.cbs = [];

  /*
   * Manages active comm.Channels instances.
   *
   * @access private
   */
  comm.connections = {};


  /*
   * Establishes and manages connections to endpoints.
   *
   * @param {String} endpointPath
   * @param {Boolean} forceNew If true, creates a new channel regardless of existing ones (default: false).
   * @access public
   */

  comm.establish = function ( endpointPath, configOptions ) {
    var locationInfo = comm.helpers.decomposeAddress(endpointPath)
      , uniqueLocationId
      , linkHandle;

    if ( universe && universe.site ) {
      locationInfo.scheme = locationInfo.scheme || universe.site.protocol.slice(0, -1);
      locationInfo.server = locationInfo.server || ( universe.page
        ? universe.page.domain : universe.site.hostname );
      locationInfo.entry = locationInfo.entry || universe.site.port;
    }

    uniqueLocationId = comm.helpers.generateIdentifier(locationInfo);

    var settings = {
        server: locationInfo.server
      , encrypted: 'https' === locationInfo.scheme
      , entry: locationInfo.entry || ( ( 'https' === locationInfo.scheme ) ? 443 : 80 )
      , params: locationInfo.params || ''
    };

    comm.helpers.combine(settings, configOptions);

    if ( settings['enforceFreshLink'] || !comm.connections[uniqueLocationId] ) {
      linkHandle = new comm.Channel(settings);
    }

    if ( !settings['enforceFreshLink'] && linkHandle ) {
      comm.connections[uniqueLocationId] = linkHandle;
    }

    linkHandle = linkHandle || comm.connections[uniqueLocationId];

    // check if the route is more than just the root path
    return linkHandle.subchannel(locationInfo.route.length > 1 ? locationInfo.route : '');
  };

})( 'object' === typeof module ? module.exports : (this.comm = {}), this );
/*
 * connection-manager utilities
 * (c) 2011 DataFlow <data@flow.com>
 * Custom Licensed
 */

( function ( output, universe ) {

  /*
   * General purpose utility functions.
   *
   * @namespace
   */

  var helpers = output.helpers = {};

  /*
   * Deconstructs a Uniform Resource Identifier string.
   *
   * @creator Steven Levithan <stevenlevithan.com> (Permissive License)
   * @access public
   */

  var addressRegex = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var addressComponents = [ 'fullString', 'scheme', 'authorityBlock', 'credentials', 'username', 'passcode',
               'server', 'entry', 'relativePart', 'route', 'folder', 'resource', 'parameters',
               'fragment' ];

  helpers.decomposeAddress = function ( inputString ) {
    var matches = addressRegex.exec(inputString || '')
      , parsedObject = {}
      , idx = 14;

    while ( idx-- ) {
      parsedObject[addressComponents[idx]] = matches[idx] || '';
    }

    return parsedObject;
  };

  /*
   * Generates a distinct address string for a communication channel.
   *
   * @param {Object} addressDetails
   * @access public
   */

  helpers.generateIdentifier = function ( addressDetails ) {
    var scheme = addressDetails.scheme
      , server = addressDetails.server
      , entry = addressDetails.entry;

    if ( 'page' in universe ) {
      server = server || universe.page.domain;
      entry = entry || ( ( scheme === 'https' )
        && universe.site.protocol !== 'https:' ? 443 : universe.site.port );
    } else {
      server = server || 'localhost';

      if ( !entry && scheme === 'https' ) {
        entry = 443;
      }
    }

    return ( scheme || 'http' ) + '://' + server + ':' + ( entry || 80 );
  };

  /*
   * Combines two query strings into a single, merged string.
   *
   * @param {String} primaryString
   * @param {String} secondaryString
   * @access public
   */

  helpers.assembleQuery = function ( primaryString, secondaryString ) {
    var paramMap = helpers.breakdownQuery(primaryString || '')
      , partsArray = [];

    helpers.combine(paramMap, helpers.breakdownQuery(secondaryString || ''));
    for ( var keySegment in paramMap ) {
      if ( paramMap.hasOwnProperty(keySegment) ) {
        partsArray.push(keySegment + '=' + paramMap[keySegment]);
      }
    }

    return partsArray.length ? '?' + partsArray.join('&') : '';
  };

  /*
   * Converts a query string into a key-value object.
   *
   * @param {String} queryStringInput
   * @access public
   */

  helpers.breakdownQuery = function ( queryStringInput ) {
    var paramMap = {}
      , paramPairs = queryStringInput.split('&')
      , idx = 0
      , len = paramPairs.length
      , keyVal;

    for ( ; idx < len; ++idx ) {
      keyVal = paramPairs[idx].split('=');
      if ( keyVal[0] ) {
        paramMap[keyVal[0]] = keyVal[1];
      }
    }

    return paramMap;
  };

  /*
   * Invokes a specified function once the document has fully loaded.
   *
   *     comm.helpers.triggerOnLoad(function () { console.log('content is ready'); });
   *
   * @param {Function} callbackFunction
   * @access public
   */

  var contentReady = false;

  helpers.triggerOnLoad = function ( callbackFunction ) {
    if ( 'page' in universe && universe.page.readyState === 'complete' || contentReady ) {
      return callbackFunction();
    }

    helpers.attachEvent(universe, 'load', callbackFunction, false);
  };

  /*
   * Attaches an event listener to an element.
   *
   * @access private
   */

  helpers.attachEvent = function ( targetElement, eventName, handlerFunc, useCapture ) {
    if ( targetElement.attachEvent ) {
      targetElement.attachEvent( 'on' + eventName, handlerFunc );
    } else if ( targetElement.addEventListener ) {
      targetElement.addEventListener( eventName, handlerFunc, useCapture );
    }
  };

  /*
   * Constructs an appropriate HTTP request object for local or cross-origin calls.
   *
   * @param {Boolean} [crossDomainRequest] Set to true for cross-domain functionality.
   * @returns {HTTPRequester|false} An instance of the request object, or false if unavailable.
   * @access private
   */

  helpers.createRequest = function ( crossDomainRequest ) {

    if ( crossDomainRequest && 'undefined' !== typeof XDomainRequest ) {
      return new XDomainRequest();
    }

    if ( 'undefined' !== typeof XMLHttpRequest && ( !crossDomainRequest || helpers.browserInfo.supportsCORS ) ) {
      return new XMLHttpRequest();
    }

    if ( !crossDomainRequest ) {
      try {
        return new universe[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
      } catch ( errorInstance ) { /* ignore failure */ }
    }

    return null;
  };

  /*
   * A base constructor for transport mechanisms using XHR.
   *
   * @constructor
   * @access public
   */

  /*
   * Updates the internal flag indicating document readiness.
   */

  if ( 'undefined' !== typeof universe ) {
    helpers.triggerOnLoad(function () {
      contentReady = true;
    });
  }

  /*
   * Delays function execution to prevent immediate browser loading indicators.
   *
   * @param {Function} delayedFunction
   * @access public
   */

  helpers.postponeExecution = function ( delayedFunction ) {
    if ( !helpers.browserInfo.isWebkit || 'undefined' !== typeof importScripts ) {
      return delayedFunction();
    }

    helpers.triggerOnLoad(function () {
      setTimeout(delayedFunction, 100);
    });
  };

  /*
   * Combines properties from a secondary object into a primary one.
   *
   * @access public
   */

  helpers.combine = function unifyObjects ( primaryObj, secondaryObj, recursiveDepth, visitedItems ) {
    var traversed = visitedItems || []
      , level = typeof recursiveDepth === 'undefined' ? 2 : recursiveDepth
      , propertyKey;

    for ( propertyKey in secondaryObj ) {
      if ( secondaryObj.hasOwnProperty(propertyKey) && helpers.findItemIndex(traversed, propertyKey) < 0 ) {
        if ( typeof primaryObj[propertyKey] !== 'object' || !level ) {
          primaryObj[propertyKey] = secondaryObj[propertyKey];
          traversed.push(secondaryObj[propertyKey]);
        } else {
          helpers.combine(primaryObj[propertyKey], secondaryObj[propertyKey], level - 1, traversed);
        }
      }
    }

    return primaryObj;
  };

  /*
   * Blends the prototype properties from one constructor into another.
   *
   * @access public
   */

  helpers.blendPrototypes = function ( constructorA, constructorB ) {
    helpers.combine(constructorA.prototype, constructorB.prototype);
  };

  /*
   * Provides a concise method for establishing object inheritance.
   *
   * @access private
   */

  helpers.establishInheritance = function ( derivedConstructor, baseConstructor ) {
    function tempFunc() {};
    tempFunc.prototype = baseConstructor.prototype;
    derivedConstructor.prototype = new tempFunc;
  };

  /*
   * Determines if the provided item is an Array instance.
   *
   *     comm.helpers.isCollection([]); // true
   *     comm.helpers.isCollection({}); // false
   *
   * @param {Object} testObject
   * @access public
   */

  helpers.isCollection = Array.isArray || function ( testObject ) {
    return Object.prototype.toString.call(testObject) === '[object Array]';
  };

  /*
   * Finds common elements between two arrays and returns them in a new array.
   *
   * @access public
   */

  helpers.findCommon = function ( listA, listB ) {
    var resultList = []
      , longerList = listA.length > listB.length ? listA : listB
      , shorterList = listA.length > listB.length ? listB : listA;

    for ( var currentIdx = 0, lengthVal = shorterList.length; currentIdx < lengthVal; currentIdx++ ) {
      if ( ~helpers.findItemIndex(longerList, shorterList[currentIdx]) )
        resultList.push(shorterList[currentIdx]);
    }

    return resultList;
  }

  /*
   * Provides a compatible 'indexOf' method for array searching.
   *
   * @reference bit.ly/a5Dxa2
   * @access public
   */

  helpers.findItemIndex = function ( inputArr, searchItem, startIndex ) {

    for ( var arrayLength = inputArr.length, currentPos = startIndex < 0 ? startIndex + arrayLength < 0 ? 0 : startIndex + arrayLength : startIndex || 0;
         currentPos < arrayLength && inputArr[currentPos] !== searchItem; currentPos++ ) {}

    return arrayLength <= currentPos ? -1 : currentPos;
  };

  /*
   * Transforms an enumerable collection into a standard array.
   *
   * @access public
   */

  helpers.convertToArray = function ( enumerableItem ) {
    var outputArray = [];

    for ( var currentIdx = 0, totalLength = enumerableItem.length; currentIdx < totalLength; currentIdx++ )
      outputArray.push(enumerableItem[currentIdx]);

    return outputArray;
  };

  /*
   * Namespace for user agent and browser engine detection.
   *
   * @namespace
   */

  helpers.browserInfo = {};

  /*
   * Indicates if the current user agent supports Cross-Origin Resource Sharing for HTTP requests.
   *
   * @access public
   */

  helpers.browserInfo.supportsCORS = 'undefined' !== typeof XMLHttpRequest && (function () {
    try {
      var reqInstance = new XMLHttpRequest();
    } catch ( err ) {
      return false;
    }

    return reqInstance.withCredentials !== undefined;
  })();

  /*
   * Checks for the presence of the WebKit rendering engine.
   *
   * @access public
   */

  helpers.browserInfo.isWebkit = 'undefined' !== typeof universe.browserAgent
    && /webkit/i.test(universe.browserAgent.userAgent);

})( 'undefined' !== typeof comm ? comm : module.exports, this );

/*
 * connection-manager events
 * (c) 2011 DataFlow <data@flow.com>
 * Custom Licensed
 */

( function ( output, comm ) {

  /*
   * Makes the primary constructor available.
   */

  output.EventDispatcher = EventDispatcher;

  /*
   * Constructor for an object capable of emitting and handling events.
   *
   * @access public.
   */

  function EventDispatcher () {};

  /*
   * Registers a new event handler for a specific event name.
   *
   * @access public
   */

  EventDispatcher.prototype.subscribe = function ( eventName, handler ) {
    if ( !this._eventHandlers ) {
      this._eventHandlers = {};
    }

    if ( !this._eventHandlers[eventName] ) {
      this._eventHandlers[eventName] = handler;
    } else if ( comm.helpers.isCollection(this._eventHandlers[eventName]) ) {
      this._eventHandlers[eventName].push(handler);
    } else {
      this._eventHandlers[eventName] = [ this._eventHandlers[eventName], handler ];
    }

    return this;
  };

})( 'undefined' !== typeof comm ? comm : module.exports, this );