module.exports = function( moduleDefinitions ) {
  var moduleCache = {};

  function retrieveModule( moduleKey ) {
    if ( moduleCache[ moduleKey ] ) {
      return moduleCache[ moduleKey ].exportedContent;
    }
    var currentModule = moduleCache[ moduleKey ] = {
      id: moduleKey,
      isLoaded: false,
      exportedContent: {}
    };
    moduleDefinitions[ moduleKey ].call( currentModule.exportedContent, currentModule, currentModule.exportedContent, retrieveModule );
    currentModule.isLoaded = true;
    return currentModule.exportedContent;
  }

  retrieveModule.definitions = moduleDefinitions;
  retrieveModule.cache = moduleCache;

  retrieveModule.defineExportProperty = function( targetObject, propertyName, getterFunction ) {
    retrieveModule.hasOwnProperty( targetObject, propertyName ) || Object.defineProperty( targetObject, propertyName, {
      enumerable: true,
      get: getterFunction
    } );
  };

  retrieveModule.markAsModule = function( moduleObject ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( moduleObject, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    Object.defineProperty( moduleObject, "__esModule", {
      value: true
    } );
  };

  retrieveModule.processWildcardImport = function( importSource, importFlags ) {
    if ( 1 & importFlags && ( importSource = retrieveModule( importSource ) ) ) return importSource;
    if ( 8 & importFlags ) return importSource;
    if ( 4 & importFlags && typeof importSource === "object" && importSource && importSource.__esModule ) return importSource;
    var newModuleObject = Object.create( null );
    retrieveModule.markAsModule( newModuleObject );
    Object.defineProperty( newModuleObject, "default", {
      enumerable: true,
      value: importSource
    } );
    if ( 2 & importFlags && typeof importSource !== "string" ) {
      for ( var propertyKey in importSource ) {
        retrieveModule.defineExportProperty( newModuleObject, propertyKey, ( function( currentKey ) {
          return importSource[ currentKey ];
        } ).bind( null, propertyKey ) );
      }
    }
    return newModuleObject;
  };

  retrieveModule.getModuleDefault = function( moduleReference ) {
    var defaultExportAccessor = moduleReference && moduleReference.__esModule ? function() {
      return moduleReference.default;
    } : function() {
      return moduleReference;
    };
    retrieveModule.defineExportProperty( defaultExportAccessor, "a", defaultExportAccessor );
    return defaultExportAccessor;
  };

  retrieveModule.hasOwnProperty = function( objectToCheck, propertyToCheck ) {
    return Object.prototype.hasOwnProperty.call( objectToCheck, propertyToCheck );
  };

  retrieveModule.basePath = "";

  return retrieveModule( retrieveModule.entryPoint = 0 );
}( [
  function( currentContext, contextExports, fetchModule ) {
    fetchModule( 1 )( fetchModule( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );
  },
  function( moduleOutput, moduleContents ) {
    function splitAndExtract( inputCollection, segmentLimit ) {
      return ( function( segmentData ) {
        if ( Array.isArray( segmentData ) ) return segmentData;
      } )( inputCollection ) || ( function( iterableSource, maxCount ) {
        var collectedParts = [],
          isIterationComplete = true,
          hasErrorOccurred = false,
          errorInformation = undefined;
        try {
          for ( var currentItem, dataIterator = iterableSource[ Symbol.iterator ](); !( isIterationComplete = ( currentItem = dataIterator.next() ).done ) && ( collectedParts.push( currentItem.value ), !maxCount || collectedParts.length !== maxCount ); isIterationComplete = true ) {}
        } catch ( exceptionObject ) {
          hasErrorOccurred = true;
          errorInformation = exceptionObject;
        } finally {
          try {
            if ( !isIterationComplete && dataIterator.return != null ) dataIterator.return();
          } finally {
            if ( hasErrorOccurred ) throw errorInformation;
          }
        }
        return collectedParts;
      } )( inputCollection, segmentLimit ) || ( function() {
        throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
      } )();
    }

    moduleOutput.exports = function( rawTextData ) {
      for (
        var dataLines = rawTextData.split( "\n" ),
          numericalConfig = splitAndExtract( dataLines[ 0 ].split( " " ).map( function( stringValue ) {
            return Number( stringValue );
          } ), 5 ),
          totalCount = numericalConfig[ 0 ],
          // numericalConfig[1] is evaluated but its value is not used
          startIndex = numericalConfig[ 2 ],
          endIndex = numericalConfig[ 3 ],
          finalPosition = numericalConfig[ 4 ],
          charArray = dataLines[ 1 ].split( "" ),
          loopCounter = 1; loopCounter < totalCount; loopCounter++
      ) {
        if ( "#" === charArray[ loopCounter - 1 ] && "#" === charArray[ loopCounter ] ) {
          return void console.log( "No" );
        }
      }
      if ( !( endIndex < finalPosition ) ) {
        for ( var consecutiveDots = 0, currentPosition = startIndex; currentPosition < finalPosition - 1; currentPosition++ ) {
          if ( "." === charArray[ currentPosition ] ) {
            if ( 2 === consecutiveDots ) return void console.log( "Yes" );
            consecutiveDots += 1;
          } else {
            consecutiveDots = 0;
          }
        }
        return finalPosition - 2 >= 0 && finalPosition - 2 < totalCount && "#" === charArray[ finalPosition - 2 ] || finalPosition >= 0 && finalPosition < totalCount && charArray[ finalPosition ], void console.log( "No" );
      }
      console.log( "Yes" );
    };
  },
  function( fileSystemModule, moduleContent ) {
    fileSystemModule.exports = require( "fs" );
  }
] );