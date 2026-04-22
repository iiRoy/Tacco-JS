module.exports = function ( sourceModules ) {

  var loadedModulesCache = {};

  function moduleLoader ( moduleIdentifier ) {
    if ( loadedModulesCache[ moduleIdentifier ] ) {
      return loadedModulesCache[ moduleIdentifier ].exports;
    }

    var moduleRecord = loadedModulesCache[ moduleIdentifier ] = {
      id: moduleIdentifier,
      loaded: false,
      exports: {}
    };

    sourceModules[ moduleIdentifier ].call( moduleRecord.exports, moduleRecord, moduleRecord.exports, moduleLoader );

    moduleRecord.loaded = true;
    return moduleRecord.exports;
  }

  moduleLoader.definitions = sourceModules;

  moduleLoader.cache = loadedModulesCache;

  moduleLoader.defineProp = function ( targetObject, propertyName, getterFunction ) {
    if ( !moduleLoader.hasProp( targetObject, propertyName ) ) {
      Object.defineProperty( targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      } );
    }
  };

  moduleLoader.registerNs = function ( targetObject ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( targetObject, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    Object.defineProperty( targetObject, "__esModule", {
      value: true
    } );
  };

  moduleLoader.interopDefault = function ( targetModule, flags ) {
    if ( flags & 1 ) {
      targetModule = moduleLoader( targetModule );
    }
    if ( flags & 8 ) {
      return targetModule;
    }
    if ( flags & 4 && typeof targetModule === "object" && targetModule && targetModule.__esModule ) {
      return targetModule;
    }

    var interopObject = Object.create( null );

    moduleLoader.registerNs( interopObject );

    Object.defineProperty( interopObject, "default", {
      enumerable: true,
      value: targetModule
    } );

    if ( flags & 2 && typeof targetModule !== "string" ) {
      for ( var keyName in targetModule ) {
        moduleLoader.defineProp( interopObject, keyName, ( function ( propKey ) {
          return function () {
            return targetModule[ propKey ];
          };
        } ).bind( null, keyName ) );
      }
    }
    return interopObject;
  };

  moduleLoader.getNsObject = function ( moduleExports ) {
    var defaultExportGetter = moduleExports && moduleExports.__esModule ?
      function () {
        return moduleExports.default;
      } :
      function () {
        return moduleExports;
      };
    moduleLoader.defineProp( defaultExportGetter, "a", defaultExportGetter );
    return defaultExportGetter;
  };

  moduleLoader.hasProp = function ( checkObject, checkProperty ) {
    return Object.prototype.hasOwnProperty.call( checkObject, checkProperty );
  };

  moduleLoader.basePath = "";

  return moduleLoader( moduleLoader.entryPoint = 0 );

}( [
  function ( currentModule, exportsObject, moduleRequester ) {
    "use strict";
    var fileSystemModule = moduleRequester( 1 );
    moduleRequester( 2 )( fileSystemModule.readFileSync( "/dev/stdin", "utf8" ) );
  },
  function ( currentModule, exportsObject ) {
    currentModule.exports = require( "fs" );
  },
  function ( currentModule, exportsObject, moduleRequester ) {
    "use strict";
    var dataProcessorClass = moduleRequester( 3 );
    var solutionLogic = moduleRequester( 5 );
    currentModule.exports = function ( rawInputData ) {
      var processorInstance = new dataProcessorClass( rawInputData );
      solutionLogic( processorInstance );
    };
  },
  function ( currentModule, exportsObject, moduleRequester ) {
    "use strict";
    var queueClass = moduleRequester( 4 );
    currentModule.exports = class InputHandler {
      constructor ( rawDataString ) {
        var tokenizedData = rawDataString.trim().split( /\s+/g );
        this.inputQueue = new queueClass( tokenizedData );
      }
      readStringToken () {
        return this.inputQueue.dequeueToken();
      }
      readIntegerToken () {
        return parseInt( this.inputQueue.dequeueToken(), 10 );
      }
      finishProcessing () {
        this.inputQueue.clearQueue();
      }
    };
  },
  function ( currentModule, exportsObject, moduleRequester ) {
    "use strict";
    currentModule.exports = class TokenQueue {
      constructor () {
        var initialTokens = arguments.length > 0 && arguments[ 0 ] !== undefined ? arguments[ 0 ] : [];
        this.queueLength = initialTokens.length;
        this.tokenArray = initialTokens;
        this.readIndex = 0;
      }
      enqueueToken ( itemValue ) {
        this.queueLength += 1;
        this.tokenArray.push( itemValue );
      }
      dequeueToken () {
        var retrievedToken = this.tokenArray[ this.readIndex ];
        this.queueLength -= 1;
        this.readIndex += 1;
        return retrievedToken;
      }
      clearQueue () {
        this.tokenArray = [];
        this.queueLength = 0;
        this.readIndex = 0;
      }
    };
  },
  function ( currentModule, exportsObject, moduleRequester ) {
    "use strict";
    currentModule.exports = function ( inputReader ) {
      var totalElements = inputReader.readIntegerToken();
      var valueArray = new Array( totalElements );
      for ( var elementIndex = 0; elementIndex < totalElements; elementIndex++ ) {
        valueArray[ elementIndex ] = inputReader.readIntegerToken();
      }

      var countsTracker = new Array( totalElements + 1 ).fill( 0 );
      for ( var iteratorVal = 1; iteratorVal <= totalElements; iteratorVal++ ) {
        countsTracker[ valueArray[ iteratorVal ] ] = countsTracker[ valueArray[ iteratorVal ] - 1 ] + 1;
      }

      var maximumFrequency = 0;
      for ( var iteratorVal = 1; iteratorVal <= totalElements; iteratorVal++ ) {
        maximumFrequency = Math.max( maximumFrequency, countsTracker[ iteratorVal ] );
      }
      console.log( totalElements - maximumFrequency );
    };
  }
] );