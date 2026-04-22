const obtainSystemModule = require;

module.payload = (function ( moduleDefinitions ) {
  var moduleRegistry = {};

  function fetchModule ( moduleKey ) {
    if ( moduleRegistry[moduleKey] ) {
      return moduleRegistry[moduleKey].publishedOutput;
    }

    var moduleEntry = moduleRegistry[moduleKey] = {
      identification: moduleKey,
      isProcessed: !1,
      publishedOutput: {}
    };

    moduleDefinitions[moduleKey].call(
        moduleEntry.publishedOutput,
        moduleEntry,
        moduleEntry.publishedOutput,
        fetchModule
    );

    moduleEntry.isProcessed = !0;
    return moduleEntry.publishedOutput;
  }

  fetchModule.definitions = moduleDefinitions;
  fetchModule.registry = moduleRegistry;

  fetchModule.defineOutputProperty = function ( targetObj, propName, valueGetter ) {
    if ( !fetchModule.hasProperty( targetObj, propName ) ) {
      Object.defineProperty( targetObj, propName, {
        enumerable: !0,
        get: valueGetter
      } );
    }
  };

  fetchModule.flagAsEsModule = function ( targetObj ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( targetObj, Symbol.toStringTag, { value: "Module" } );
    }
    Object.defineProperty( targetObj, "__esModule", { value: !0 } );
  };

  fetchModule.createExportNamespace = function ( moduleVal, modeFlags ) {
    if ( 1 & modeFlags ) {
      moduleVal = fetchModule( moduleVal );
    }
    if ( 8 & modeFlags ) {
      return moduleVal;
    }
    if ( 4 & modeFlags && typeof moduleVal === "object" && moduleVal && moduleVal.__esModule ) {
      return moduleVal;
    }

    var namespaceObj = Object.create( null );
    fetchModule.flagAsEsModule( namespaceObj );
    Object.defineProperty( namespaceObj, "default", { enumerable: !0, value: moduleVal } );

    if ( 2 & modeFlags && typeof moduleVal !== "string" ) {
      for ( var propertyKey in moduleVal ) {
        fetchModule.defineOutputProperty( namespaceObj, propertyKey, ( function ( currentKey ) {
          return moduleVal[currentKey];
        } ).bind( null, propertyKey ) );
      }
    }
    return namespaceObj;
  };

  fetchModule.getPrimaryExport = function ( moduleRef ) {
    var primaryExporter = moduleRef && moduleRef.__esModule ?
        function () { return moduleRef.default; } :
        function () { return moduleRef; };
    fetchModule.defineOutputProperty( primaryExporter, "a", primaryExporter );
    return primaryExporter;
  };

  fetchModule.hasProperty = function ( targetObj, propKey ) {
    return Object.prototype.hasOwnProperty.call( targetObj, propKey );
  };

  fetchModule.assetPath = "";

  return fetchModule( fetchModule.initialModuleId = 0 );
}( [
  function ( moduleContext, moduleOutput, requireModule ) {
    requireModule( 1 )(
        requireModule( 2 )
            .readSync( "/dev/stdin", "UTF-8" )
            .split( "\n" )
    );
  },

  function ( currentContext, moduleResults, requireModule ) {
    "use strict";

    function extractLimitedItems ( sourceIterable, maxItems ) {
      if ( Array.isArray( sourceIterable ) ) {
        return sourceIterable;
      }

      var collectedItems = [],
          iterationCompleted = !0,
          exceptionOccurred = !1,
          caughtEx = void 0;

      try {
        for (
            var currentItem, dataIterator = sourceIterable[Symbol.iterator]();
            !( iterationCompleted = ( currentItem = dataIterator.next() ).done ) &&
            ( collectedItems.push( currentItem.value ), !maxItems || collectedItems.length !== maxItems );
            iterationCompleted = !0
        ) { /* intentionally empty */ }
      } catch ( iterationError ) {
        exceptionOccurred = !0;
        caughtEx = iterationError;
      } finally {
        try {
          if ( !iterationCompleted && dataIterator["return"] != null ) {
            dataIterator["return"]();
          }
        } finally {
          if ( exceptionOccurred ) {
            throw caughtEx;
          }
        }
      }

      return collectedItems;
    }

    currentContext.output = function ( inputLines ) {
      var graphDimensions = extractLimitedItems(
          inputLines[0].split( " " ).map( function ( stringVal ) {
            return Number( stringVal );
          } ),
          2
      );
      var numberOfNodes = graphDimensions[0];
      var numberOfEdges = graphDimensions[1];

      var graphAdjacency = new Array( numberOfNodes );
      for ( var currentIdx = 0; currentIdx < numberOfNodes; currentIdx++ ) {
        graphAdjacency[currentIdx] = [];
      }

      for ( var edgeIdx = 0; edgeIdx < numberOfEdges; edgeIdx++ ) {
        var edgeEndpoints = extractLimitedItems(
            inputLines[edgeIdx + 1].split( " " ).map( function ( numStr ) {
              return Number( numStr ) - 1;
            } ),
            2
        );
        var originNode = edgeEndpoints[0];
        var destinationNode = edgeEndpoints[1];
        graphAdjacency[originNode].push( destinationNode );
      }

      for ( var entryNode = 0; entryNode < numberOfNodes; entryNode++ ) {
        var pathTraversalStatus = new Array( numberOfNodes ).fill( !1 );
        pathTraversalStatus[entryNode] = !0;

        var discoveryStack = [ { nodeIdentifier: entryNode, traversalFlags: pathTraversalStatus, currentPathLength: 1 } ];

        while ( discoveryStack.length > 0 ) {
          var currentPathPoint = discoveryStack.pop();

          var iterationComplete = !0,
              errorPresent = !1,
              caughtException = void 0;

          try {
            for (
                var adjacentItem, adjacentIterator = graphAdjacency[currentPathPoint.nodeIdentifier][Symbol.iterator]();
                !( iterationComplete = ( adjacentItem = adjacentIterator.next() ).done );
                iterationComplete = !0
            ) {
              var adjacentNode = adjacentItem.value;

              if ( adjacentNode === entryNode ) {
                console.log( currentPathPoint.currentPathLength );
                for ( var pathNodeIdx = 0; pathNodeIdx < numberOfNodes; pathNodeIdx++ ) {
                  if ( currentPathPoint.traversalFlags[pathNodeIdx] === !0 ) {
                    console.log( pathNodeIdx + 1 );
                  }
                }
                return;
              }

              if ( currentPathPoint.traversalFlags[adjacentNode] === !1 ) {
                var updatedTraversalFlags = currentPathPoint.traversalFlags.concat();
                updatedTraversalFlags[adjacentNode] = !0;

                discoveryStack.push( {
                  nodeIdentifier: adjacentNode,
                  traversalFlags: updatedTraversalFlags,
                  currentPathLength: currentPathPoint.currentPathLength + 1
                } );
              }
            }
          } catch ( traversalIssue ) {
            errorPresent = !0;
            caughtException = traversalIssue;
          } finally {
            try {
              if ( !iterationComplete && adjacentIterator["return"] != null ) {
                adjacentIterator["return"]();
              }
            } finally {
              if ( errorPresent ) {
                throw caughtException;
              }
            }
          }
        }
      }

      console.log( -1 );
    };
  },

  function ( moduleContext, moduleOutput ) {
    moduleContext.output = obtainSystemModule( "fs" );
  }
] );