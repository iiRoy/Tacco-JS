var moduleScope = function ( moduleBank ) {
 var instanceCache = {
 };
 function loadModule ( moduleId ) {
  if ( instanceCache[ moduleId ] ) {
   return instanceCache[ moduleId ].exports;
  }
  var currentModule = instanceCache[ moduleId ] = {
   id: moduleId,
   isLoaded: false,
   exports: {
   }
  };
  moduleBank[ moduleId ].call( currentModule.exports, currentModule, currentModule.exports, loadModule );
  currentModule.isLoaded = true;
  return currentModule.exports;
 }
 loadModule.moduleDefinitions = moduleBank;
 loadModule.moduleCache = instanceCache;
 loadModule.defineExport = function ( exportTarget, propertyName, valueGetter ) {
  if ( !loadModule.hasOwn( exportTarget, propertyName ) ) {
   Object.defineProperty( exportTarget, propertyName, {
    enumerable: true,
    get: valueGetter
   } );
  }
 };
 loadModule.registerESModule = function ( exportTarget ) {
  if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
   Object.defineProperty( exportTarget, Symbol.toStringTag, {
    value: "Module"
   } );
  }
  Object.defineProperty( exportTarget, "__esModule", {
   value: true
  } );
 };
 loadModule.transformExport = function ( sourceValue, transformationMode ) {
  if ( ( transformationMode & 1 ) && ( sourceValue = loadModule( sourceValue ) ) );
  if ( transformationMode & 8 ) return sourceValue;
  if ( ( transformationMode & 4 ) && typeof sourceValue === "object" && sourceValue && sourceValue.__esModule ) return sourceValue;
  var transformedObject = Object.create( null );
  loadModule.registerESModule( transformedObject );
  Object.defineProperty( transformedObject, "default", {
   enumerable: true,
   value: sourceValue
  } );
  if ( ( transformationMode & 2 ) && typeof sourceValue !== "string" ) {
   for ( var exportKey in sourceValue ) {
    loadModule.defineExport( transformedObject, exportKey, ( function ( currentKey ) {
     return sourceValue[ currentKey ];
    } ).bind( null, exportKey ) );
   }
  }
  return transformedObject;
 };
 loadModule.getNamespaceObject = function ( originalModule ) {
  var defaultGetter = originalModule && originalModule.__esModule ? function ( ) {
   return originalModule.default;
  } : function ( ) {
   return originalModule;
  };
  loadModule.defineExport( defaultGetter, "a", defaultGetter );
  return defaultGetter;
 };
 loadModule.hasOwn = function ( checkObject, checkProperty ) {
  return Object.prototype.hasOwnProperty.call( checkObject, checkProperty );
 };
 loadModule.publicPath = String();
 return loadModule( loadModule.startupModule = 0 );
}
( [
 function ( entryModule, entryExports, localRequire ) {
  "use strict";
  var fileSystemModule = localRequire( 1 );
  localRequire( 2 ) ( fileSystemModule.readFileSync( "/dev/stdin", "utf8" ) );
 },
 function ( fsModule, fsExports ) {
  fsModule.exports = require( "fs" );
 },
 function ( invokerModule, invokerExports, invokerRequire ) {
  "use strict";
  var inputProcessor = invokerRequire( 3 ),
   problemSolver = invokerRequire( 5 );
  invokerModule.exports = function ( rawData ) {
   var processorInstance = new inputProcessor( rawData );
   problemSolver( processorInstance );
  };
 },
 function ( parserModule, parserExports, parserRequire ) {
  "use strict";
  var tokenCollection = parserRequire( 4 );
  parserModule.exports = class InputParser {
   constructor ( initialString ) {
    var tokenArray = initialString.trim().split( /\s+/g );
    this.inputSource = new tokenCollection( tokenArray );
   }
   readNextToken ( ) {
    return this.inputSource.dequeueItem();
   }
   readNextInteger ( ) {
    return parseInt( this.inputSource.dequeueItem(), 10 );
   }
   flushInput ( ) {
    this.inputSource.resetQueue();
   }
  };
 },
 function ( queueModule, queueExports, queueRequire ) {
  "use strict";
  queueModule.exports = class DataQueue {
   constructor ( ) {
    var initialElements = arguments.length > 0 && arguments[ 0 ] !== undefined ? arguments[ 0 ] : [ ];
    this.elementCount = initialElements.length;
    this.storageArray = initialElements;
    this.readIndex = 0;
   }
   enqueueItem ( newItem ) {
    this.elementCount += 1;
    this.storageArray.push( newItem );
   }
   dequeueItem ( ) {
    var retrievedItem = this.storageArray[ this.readIndex ];
    this.elementCount -= 1;
    this.readIndex += 1;
    return retrievedItem;
   }
   resetQueue ( ) {
    this.storageArray = [ ];
    this.elementCount = 0;
    this.readIndex = 0;
   }
  };
 },
 function ( solverModule, solverExports, solverRequire ) {
  "use strict";
  var moduloConstant = 1000000007;

  function multiplyModulus ( ) {
   for ( var allArgs = arguments, currentProduct = allArgs[ 0 ], argCount = allArgs.length; --argCount; ) {
    currentProduct = ( ( currentProduct >>> 16 ) * allArgs[ argCount ] % moduloConstant * 65536 + ( 65535 & currentProduct ) * allArgs[ argCount ] ) % moduloConstant;
   }
   return currentProduct;
  }
  var factorialArray = [ ],
   invFactorialArray = [ ],
   tempArray = [ ];

  function precomputeCombinatorics ( maxValue ) {
   factorialArray.length = maxValue + 1;
   factorialArray[ 0 ] = factorialArray[ 1 ] = 1;
   for ( var loopCounter = 2; loopCounter <= maxValue; ) {
    factorialArray[ loopCounter ] = multiplyModulus( factorialArray[ loopCounter - 1 ], loopCounter++ );
   }
   invFactorialArray.length = maxValue + 1;
   invFactorialArray[ 0 ] = invFactorialArray[ 1 ] = 1;
   invFactorialArray[ maxValue ] = ( function ( numToInvert ) {
    for (
     var tempA, tempB = moduloConstant, xZero = 0, xOne = 1; numToInvert; xOne = tempA
    ) {
     xZero -= ( tempA = Math.floor( tempB / numToInvert ) ) * xOne;
     tempA = tempB;
     tempB = numToInvert;
     numToInvert = tempA % numToInvert;
     tempA = xZero;
     xZero = xOne;
    }
    return ( xZero %= moduloConstant ) < 0 ? xZero + moduloConstant : xZero;
   } )( factorialArray[ maxValue ] );
   for ( loopCounter = maxValue; loopCounter > 1; ) {
    invFactorialArray[ loopCounter - 1 ] = multiplyModulus( invFactorialArray[ loopCounter ], loopCounter-- );
   }
   tempArray.length = maxValue + 1;
   tempArray[ 0 ] = tempArray[ 1 ] = 1;
   for ( loopCounter = 2; loopCounter <= maxValue; ) {
    tempArray[ loopCounter ] = multiplyModulus( factorialArray[ loopCounter - 1 ], invFactorialArray[ loopCounter++ ] );
   }
  }

  function combinationsMod ( totalItems, selectItems ) {
   return multiplyModulus( factorialArray[ totalItems ], invFactorialArray[ selectItems ], invFactorialArray[ totalItems - selectItems ] );
  }
  solverModule.exports = function ( inputReader ) {
   var totalElementsN = inputReader.readNextInteger(),
    selectedElementsK = inputReader.readNextInteger();
   precomputeCombinatorics( totalElementsN );
   for ( var iterationCount = 1; iterationCount <= selectedElementsK; iterationCount++ ) {
    var currentResult = multiplyModulus( combinationsMod( totalElementsN - selectedElementsK + 1, iterationCount ), combinationsMod( selectedElementsK - 1, iterationCount - 1 ) );
    console.log( currentResult % moduloConstant );
   }
  };
 }
 ]
);
module.exports = moduleScope;