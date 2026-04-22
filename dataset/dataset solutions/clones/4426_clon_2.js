module . exports = function ( moduleDefinitions ) {
  // Cache for already loaded modules
  var loadedModulesCache = {};
  /*
   * Core module loading function.
   * Behaves similarly to a 'require' call.
   */
  function loadModule ( moduleId ) {
    // If module is already in cache, return its exports
    if ( loadedModulesCache[ moduleId ] ) {
      return loadedModulesCache[ moduleId ].exports;
    }
    // Create a new module object and add it to the cache
    var currentModuleObject = loadedModulesCache[ moduleId ] = {
      identifier: moduleId, /* Module ID */
      isLoaded: false,      /* Loading status */
      exports: {}           /* Exports object */
    };
    // Execute the module function, populating its exports
    moduleDefinitions[ moduleId ].call(
      currentModuleObject.exports,
      currentModuleObject,
      currentModuleObject.exports,
      loadModule
    );
    // Mark the module as loaded
    currentModuleObject.isLoaded = true;
    // Return the module's exports
    return currentModuleObject.exports;
  }
  // Store all module definitions on the loader function
  loadModule.allDefinitions = moduleDefinitions;
  // Store the module cache on the loader function
  loadModule.cachedObjects = loadedModulesCache;
  /**
   * Helper to define a property on an object if it doesn't exist.
   */
  loadModule.defineExport = function ( targetObject, propertyKey, getterFunction ) {
    if ( !loadModule.hasOwnProp( targetObject, propertyKey ) ) {
      Object.defineProperty( targetObject, propertyKey, {
        enumerable: true,
        get: getterFunction
      } );
    }
  };
  /*
   * Helper to mark an object as an ES module.
   */
  loadModule.markAsESM = function ( targetObject ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( targetObject, Symbol.toStringTag, { value: "Module" } );
    }
    Object.defineProperty( targetObject, "__esModule", { value: true } );
  };
  /*
   * Helper to get module exports, handling various module formats.
   */
  loadModule.getExport = function ( sourceModule, flags ) {
    // If flag 1 is set, resolve the module first
    if ( 1 & flags ) {
      sourceModule = loadModule( sourceModule );
    }
    // If flag 8 is set, return as is (raw module)
    if ( 8 & flags ) {
      return sourceModule;
    }
    // If flag 4 is set and it's an object and an ES module, return it
    if ( 4 & flags && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule ) {
      return sourceModule;
    }
    // Otherwise, create a new namespace object
    var newNamespaceObject = Object.create( null );
    loadModule.markAsESM( newNamespaceObject );
    // Set the default export
    Object.defineProperty( newNamespaceObject, "default", { enumerable: true, value: sourceModule } );
    // If flag 2 is set and not a string, copy all properties
    if ( 2 & flags && typeof sourceModule !== "string" ) {
      for ( var prop in sourceModule ) {
        loadModule.defineExport( newNamespaceObject, prop, ( function ( p ) {
          return sourceModule[ p ];
        } ).bind( null, prop ) );
      }
    }
    return newNamespaceObject;
  };
  /*
   * Helper to get a namespace object for a module's default export.
   */
  loadModule.getNamespaceObject = function ( sourceModule ) {
    var defaultExportGetter = sourceModule && sourceModule.__esModule
      ? function () {
        return sourceModule.default;
      }
      : function () {
        return sourceModule;
      };
    loadModule.defineExport( defaultExportGetter, "a", defaultExportGetter );
    return defaultExportGetter;
  };
  /*
   * Utility to check if an object has its own property.
   */
  loadModule.hasOwnProp = function ( targetObject, propertyKey ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyKey );
  };
  // Public path for assets (empty in this case)
  loadModule.publicPath = "";
  // Start the application by loading the startup module (module 0)
  return loadModule( ( loadModule.startupModuleId = 0 ) );
}( [
  /* Module 0: Main entry point for the application logic */
  function ( currentModule, moduleExports, fetchModule ) {
    // Load module 1, then execute it with the input from module 2
    fetchModule( 1 )(
      fetchModule( 2 )
        .readFileSync( "/dev/stdin", "UTF-8" )
        .split( "\n" )
    );
  },
  /* Module 1: Contains the graph processing and query logic */
  function ( thisModule, thisExports, getRequiredModule ) {
    "use strict";
    // Helper function for safe array destructuring
    function extractElements ( sourceArray, expectedLength ) {
      if ( Array.isArray( sourceArray ) ) {
        return sourceArray;
      }
      var collectedItems = [];
      var isDone = true;
      var hasError = false;
      var caughtError = void 0;
      try {
        for (
          var itemIterator = sourceArray[ Symbol.iterator ]();
          !( isDone = ( itemIterator.next() ).done ) &&
          ( collectedItems.push( itemIterator.value ), !expectedLength || collectedItems.length !== expectedLength );
          isDone = true
        ) {
          /* Loop continues */
        }
      } catch ( err ) {
        hasError = true;
        caughtError = err;
      } finally {
        try {
          if ( !isDone && itemIterator[ "return" ] != null ) {
            itemIterator[ "return" ]();
          }
        } finally {
          if ( hasError ) {
            throw caughtError;
          }
        }
      }
      return collectedItems;
    }
    thisModule.exports = function ( inputLineArray ) {
      // Parse the number of nodes from the first line
      var nodeCount = Number( inputLineArray[ 0 ] );
      // Initialize an adjacency list for the graph
      var nodeConnections = new Array( nodeCount );
      for ( var currentIdx = 0; currentIdx < nodeCount; currentIdx++ ) {
        nodeConnections[ currentIdx ] = [];
      }
      // Parse the query information (total queries and starting node)
      var initialQueryData = extractElements(
        inputLineArray[ nodeCount ].split( " " ).map( function ( stringVal ) {
          return Number( stringVal );
        } ),
        2
      );
      var totalQueries = initialQueryData[ 0 ];
      var startNodeIndex = initialQueryData[ 1 ];
      // Build the graph from the subsequent lines (edges)
      for ( var edgeLineIndex = 0; edgeLineIndex < nodeCount - 1; edgeLineIndex++ ) {
        var edgeDetails = extractElements(
          inputLineArray[ edgeLineIndex + 1 ].split( " " ).map( function ( stringVal ) {
            return Number( stringVal );
          } ),
          3
        );
        var firstNodeId = edgeDetails[ 0 ];
        var secondNodeId = edgeDetails[ 1 ];
        var edgeWeight = edgeDetails[ 2 ];
        // Add edges to the adjacency list, excluding connections to the start node itself
        if ( secondNodeId !== startNodeIndex ) {
          nodeConnections[ firstNodeId - 1 ].push( {
            vertex: secondNodeId - 1,
            cost: edgeWeight
          } );
        }
        if ( firstNodeId !== startNodeIndex ) {
          nodeConnections[ secondNodeId - 1 ].push( {
            vertex: firstNodeId - 1,
            cost: edgeWeight
          } );
        }
      }
      // Initialize an array to store shortest path costs from the start node
      var shortestPathCosts = new Array( nodeCount ).fill( -1 );
      // Initialize a queue for a Breadth-First Search (BFS) or similar traversal
      var processingQueue = [ { vertex: startNodeIndex - 1, currentPathCost: 0 } ];
      // Perform the traversal to find shortest paths
      while ( processingQueue.length > 0 ) {
        var currentNodeData = processingQueue.pop(); // Get next node to process
        var neighborCount = nodeConnections[ currentNodeData.vertex ].length;
        for ( var neighborIterator = 0; neighborIterator < neighborCount; neighborIterator++ ) {
          var neighborConnection = nodeConnections[ currentNodeData.vertex ][ neighborIterator ];
          // If this neighbor hasn't been visited yet (cost is -1)
          if ( shortestPathCosts[ neighborConnection.vertex ] === -1 ) {
            var newCalculatedCost = currentNodeData.currentPathCost + neighborConnection.cost;
            shortestPathCosts[ neighborConnection.vertex ] = newCalculatedCost;
            processingQueue.push( { vertex: neighborConnection.vertex, currentPathCost: newCalculatedCost } );
          }
        }
      }
      // Process each query
      for ( var queryIteration = 0; queryIteration < totalQueries; queryIteration++ ) {
        var queryNodePair = extractElements(
          inputLineArray[ queryIteration + nodeCount + 1 ].split( " " ).map( function ( stringVal ) {
            return Number( stringVal );
          } ),
          2
        );
        var queryNodeA = queryNodePair[ 0 ];
        var queryNodeB = queryNodePair[ 1 ];
        // Calculate the combined path cost for the query nodes
        var combinedPathCost = shortestPathCosts[ queryNodeA - 1 ] + shortestPathCosts[ queryNodeB - 1 ];
        // Output the result
        console.log( combinedPathCost );
      }
    };
  },
  /* Module 2: Provides the Node.js 'fs' module */
  function ( moduleReference, exportReference ) {
    moduleReference.exports = require( "node:fs" );
  }
] );