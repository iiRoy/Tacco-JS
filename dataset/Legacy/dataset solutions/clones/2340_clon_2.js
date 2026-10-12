module.exports = function( allModules ) {
  /*
   * This module loader emulates a Webpack-like bundle structure.
   * It manages module caching and execution.
   */

  // A registry to store already loaded and initialized modules.
  var moduleRegistry = {};

  /**
   * The central function for loading and executing modules.
   * It checks the cache first; if a module is not found, it's loaded, executed, and then cached.
   * @param {number} requestedModuleId - The unique identifier of the module to be loaded.
   * @returns {object} The exports object from the loaded module.
   */
  function loadAndExecuteModule( requestedModuleId ) {
    // If the module has already been loaded, return its cached exports.
    if ( moduleRegistry[ requestedModuleId ] ) {
      return moduleRegistry[ requestedModuleId ].exports;
    }

    // Otherwise, create a new module entry in the registry.
    var currentModuleInstance = moduleRegistry[ requestedModuleId ] = {
      moduleId: requestedModuleId, // Store the module's ID.
      isLoaded: false, // Flag indicating if the module's code has finished executing.
      exports: {} // The object where the module's public interface will be stored.
    };

    // Execute the module's factory function.
    // The factory function receives:
    // 1. The module's `exports` object (which it populates).
    // 2. The `module` object itself (containing `moduleId`, `isLoaded`, `exports`).
    // 3. A reference to this `loadAndExecuteModule` function for internal dependencies.
    allModules[ requestedModuleId ].call( currentModuleInstance.exports, currentModuleInstance, currentModuleInstance.exports, loadAndExecuteModule );

    // Mark the module as fully loaded after its factory function completes.
    currentModuleInstance.isLoaded = true;
    return currentModuleInstance.exports;
  }


  // --- Utility functions attached to the main module loader, mirroring Webpack's helper methods ---

  // Expose the array of all available modules.
  loadAndExecuteModule.allAvailableModules = allModules;
  // Expose the internal module cache for debugging or introspection.
  loadAndExecuteModule.moduleCacheReference = moduleRegistry;

  /**
   * Defines an enumerable getter property on a target object.
   * It prevents redefining a property if it already exists directly on the object.
   * @param {object} objectTarget - The object on which to define the property.
   * @param {string} propertyNameKey - The name of the property to define.
   * @param {function} propertyGetter - The getter function that provides the property's value.
   */
  loadAndExecuteModule.defineExportProperty = function( objectTarget, propertyNameKey, propertyGetter ) {
    if ( !loadAndExecuteModule.hasOwnProperty( objectTarget, propertyNameKey ) ) {
      Object.defineProperty( objectTarget, propertyNameKey, {
        enumerable: true, // Make the property iterable.
        get: propertyGetter // Assign the getter function.
      } );
    }
  };

  /**
   * Marks a given object as an ECMAScript module.
   * This typically involves setting `Symbol.toStringTag` and `__esModule` properties.
   * @param {object} moduleObject - The object to be marked as an ES module.
   */
  loadAndExecuteModule.markAsEsModule = function( moduleObject ) {
    // Set Symbol.toStringTag for better console output for modules.
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( moduleObject, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    // Indicate that this object represents an ES module.
    Object.defineProperty( moduleObject, "__esModule", {
      value: true
    } );
  };

  /**
   * Provides interoperability for various module formats, especially for default exports.
   * This function handles different flags to determine how a module's exports should be presented.
   * @param {any} sourceModule - The raw module exports or module ID.
   * @param {number} conversionFlags - Bitmask flags indicating the desired conversion behavior.
   * @returns {any} The processed module exports, potentially wrapped for compatibility.
   */
  loadAndExecuteModule.interopNamespace = function( sourceModule, conversionFlags ) {
    // If flag 1 is set, treat sourceModule as a module ID and load it.
    if ( conversionFlags & 1 ) {
      sourceModule = loadAndExecuteModule( sourceModule );
    }
    // If flag 8 is set, return the module as-is.
    if ( conversionFlags & 8 ) {
      return sourceModule;
    }
    // If flag 4 is set and it's an ES module, return it directly.
    if ( conversionFlags & 4 && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule ) {
      return sourceModule;
    }

    // Otherwise, create a new object to hold the default export and potentially other named exports.
    var defaultExportContainer = Object.create( null );
    loadAndExecuteModule.markAsEsModule( defaultExportContainer );
    Object.defineProperty( defaultExportContainer, "default", {
      enumerable: true,
      value: sourceModule
    } );

    // If flag 2 is set and the source module is not a string, copy named exports.
    if ( conversionFlags & 2 && typeof sourceModule !== "string" ) {
      for ( var keyName in sourceModule ) {
        loadAndExecuteModule.defineExportProperty( defaultExportContainer, keyName, ( function( currentKey ) {
          return sourceModule[ currentKey ];
        } ).bind( null, keyName ) );
      }
    }
    return defaultExportContainer;
  };

  /**
   * Generates a getter function for module exports, particularly useful for default exports.
   * This ensures that the primary export can be accessed consistently.
   * @param {object} moduleExportsObject - The object containing the module's exports.
   * @returns {function} A function that, when called, returns the module's primary export.
   */
  loadAndExecuteModule.getDefaultExportGetter = function( moduleExportsObject ) {
    var exportAccessFunction = moduleExportsObject && moduleExportsObject.__esModule ?
      function() {
        return moduleExportsObject.default;
      } :
      function() {
        return moduleExportsObject;
      };
    // Attach the getter itself as property 'a' (a common Webpack pattern).
    loadAndExecuteModule.defineExportProperty( exportAccessFunction, "a", exportAccessFunction );
    return exportAccessFunction;
  };

  /**
   * Checks if an object has a specific property directly on itself (not inherited from its prototype chain).
   * @param {object} targetObject - The object to inspect.
   * @param {string} keyToCheck - The name of the property to look for.
   * @returns {boolean} True if the property exists directly on the object, false otherwise.
   */
  loadAndExecuteModule.hasOwnProperty = function( targetObject, keyToCheck ) {
    return Object.prototype.hasOwnProperty.call( targetObject, keyToCheck );
  };

  // The base path for public assets (often used for dynamic imports or asset loading).
  // In this bundle, it's an empty string.
  loadAndExecuteModule.basePublicPath = "";

  // Set the entry module ID and immediately load it to start the application.
  return loadAndExecuteModule( loadAndExecuteModule.entryModuleId = 0 );
}(
  // --- Array of all application modules, indexed by their module IDs ---
  [
    /* --- Module ID 0: Main application entry point --- */
    function( currentModule, moduleExports, moduleRequester ) {
      "use strict";
      // Load the Node.js 'fs' (file system) module, which is module ID 1.
      var fileSystemAccess = moduleRequester( 1 );
      // Load module ID 2 (the input processor) and immediately call it
      // with the content read from standard input (/dev/stdin).
      moduleRequester( 2 )( fileSystemAccess.readFileSync( "/dev/stdin", "utf8" ) );
    },

    /* --- Module ID 1: Node.js 'fs' module wrapper --- */
    function( currentModule, moduleExports ) {
      // Export the native Node.js 'fs' module.
      currentModule.exports = require( "fs" );
    },

    /* --- Module ID 2: Input processing and problem solver initialization --- */
    function( currentModule, moduleExports, moduleRequester ) {
      "use strict";
      // Load the DataStreamProcessor class (module ID 3).
      var dataInputHandler = moduleRequester( 3 );
      // Load the main problem-solving routine (module ID 5).
      var problemSolverRoutine = moduleRequester( 5 );

      // Export a function that orchestrates input handling and problem solving.
      currentModule.exports = function( rawInputString ) {
        // Create an instance of the input processor with the provided raw input.
        var inputProcessingInstance = new dataInputHandler( rawInputString );
        // Pass the processed input to the main solver routine.
        problemSolverRoutine( inputProcessingInstance );
      };
    },

    /* --- Module ID 3: DataStreamProcessor Class (Input Handler) --- */
    function( currentModule, moduleExports, moduleRequester ) {
      "use strict";
      // Load the BasicQueue utility class (module ID 4).
      var queueUtility = moduleRequester( 4 );

      // Define and export the DataStreamProcessor class.
      currentModule.exports = class DataStreamProcessor {
        /**
         * Constructor for the DataStreamProcessor.
         * It initializes the input stream by tokenizing the raw input string.
         * @param {string} rawInputText - The complete raw input string.
         */
        constructor( rawInputText ) {
          // Trim leading/trailing whitespace and split the input by any whitespace character.
          var parsedTokens = rawInputText.trim().split( /\s+/g );
          // Store the tokens in an internal queue for sequential access.
          this.tokenQueue = new queueUtility( parsedTokens );
        }

        /**
         * Retrieves the next string token from the input stream.
         * @returns {string} The next available string token.
         */
        retrieveString() {
          return this.tokenQueue.dequeueElement();
        }

        /**
         * Retrieves the next integer token from the input stream.
         * @returns {number} The next available integer token.
         */
        retrieveInteger() {
          return parseInt( this.tokenQueue.dequeueElement(), 10 );
        }

        /**
         * Clears the internal input token queue, resetting the stream.
         */
        resetStream() {
          this.tokenQueue.clearAll();
        }
      };
    },

    /* --- Module ID 4: BasicQueue Class (Simple Queue Implementation) --- */
    function( currentModule, moduleExports, moduleRequester ) {
      "use strict";
      // Define and export a basic Queue data structure.
      currentModule.exports = class BasicQueue {
        /**
         * Constructor for the BasicQueue.
         * Initializes the queue, optionally with a set of elements.
         * @param {Array<any>} [initialElements=[]] - An optional array of elements to start the queue with.
         */
        constructor() {
          // Use default parameter if no arguments are provided.
          var initialElements = arguments.length > 0 && arguments[ 0 ] !== undefined ? arguments[ 0 ] : [];
          this.currentQueueSize = initialElements.length; // Tracks the number of elements.
          this.queueStorage = initialElements; // The underlying array storing queue elements.
          this.nextReadIndex = 0; // The index of the next element to be dequeued.
        }

        /**
         * Adds an element to the back of the queue.
         * @param {any} newElement - The element to be added.
         */
        enqueueElement( newElement ) {
          this.currentQueueSize += 1;
          this.queueStorage.push( newElement );
        }

        /**
         * Removes and returns the element from the front of the queue.
         * @returns {any} The element that was at the front of the queue.
         */
        dequeueElement() {
          var retrievedElement = this.queueStorage[ this.nextReadIndex ];
          this.currentQueueSize -= 1;
          this.nextReadIndex += 1; // Move the read pointer forward.
          return retrievedElement;
        }

        /**
         * Clears all elements from the queue and resets its state.
         */
        clearAll() {
          this.queueStorage = [];
          this.currentQueueSize = 0;
          this.nextReadIndex = 0;
        }
      };
    },

    /* --- Module ID 5: Main Problem Solver Logic (Graph Traversal & Analysis) --- */
    function( currentModule, moduleExports, moduleRequester ) {
      "use strict";
      // Export the primary function responsible for solving the problem.
      currentModule.exports = function( inputReaderService ) {
        // Read the number of nodes and the starting positions for two entities (Target and Agent).
        var nodeCount = inputReaderService.retrieveInteger();
        var targetStartNode = inputReaderService.retrieveInteger() - 1; // Convert to 0-indexed.
        var agentStartNode = inputReaderService.retrieveInteger() - 1; // Convert to 0-indexed.

        // Initialize data structures:
        // 1. Adjacency list to represent the graph connections.
        var adjacencyStructure = new Array( nodeCount );
        // 2. An array to store traversal-related data (visited status, distances) for each node.
        var nodeTraversalData = new Array( nodeCount );

        // Initialize each node's entry in the adjacency list and traversal data.
        for ( var nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++ ) {
          adjacencyStructure[ nodeIdx ] = []; // Each node has an empty list of neighbors initially.
          nodeTraversalData[ nodeIdx ] = {
            visitedByTarget: 0, // 0: not visited, 1: visited by Target.
            visitedByAgent: 0, // 0: not visited, 1: visited by Agent.
            distanceFromTarget: -1, // -1: unreachable from Target.
            distanceFromAgent: -1 // -1: unreachable from Agent.
          };
        }

        // Read the edges (connections) between nodes and populate the adjacency list.
        // Assuming an undirected graph, add edges in both directions.
        for ( var edgeCounter = 0; edgeCounter < nodeCount - 1; edgeCounter++ ) {
          var firstNode = inputReaderService.retrieveInteger() - 1;
          var secondNode = inputReaderService.retrieveInteger() - 1;
          adjacencyStructure[ firstNode ].push( secondNode );
          adjacencyStructure[ secondNode ].push( firstNode );
        }


        // --- Begin Breadth-First Search (BFS) from the Agent's starting node ---

        // Mark the Agent's start node as visited and set its distance from itself to 0.
        nodeTraversalData[ agentStartNode ].visitedByAgent = 1;
        nodeTraversalData[ agentStartNode ].distanceFromAgent = 0;
        // Initialize the BFS queue for the Agent.
        var agentBfsQueue = [ {
          vertexId: agentStartNode,
          travelDist: 0
        } ];

        // Process the queue until it's empty.
        while ( agentBfsQueue.length > 0 ) {
          var currentPathInfo = agentBfsQueue.pop(); // Dequeue the current node and its distance.
          var currentNeighbors = adjacencyStructure[ currentPathInfo.vertexId ]; // Get its neighbors.

          // Iterate through all neighbors of the current node.
          for ( var neighborIterator = 0; neighborIterator < currentNeighbors.length; neighborIterator++ ) {
            var neighborNodeId = currentNeighbors[ neighborIterator ];

            // If this neighbor has not yet been visited by the Agent.
            if ( nodeTraversalData[ neighborNodeId ].visitedByAgent !== 1 ) {
              nodeTraversalData[ neighborNodeId ].visitedByAgent = 1; // Mark as visited.
              nodeTraversalData[ neighborNodeId ].distanceFromAgent = currentPathInfo.travelDist + 1; // Update distance.
              // Enqueue the neighbor for further exploration.
              agentBfsQueue.push( {
                vertexId: neighborNodeId,
                travelDist: currentPathInfo.travelDist + 1
              } );
            }
          }
        }


        // --- Begin Breadth-First Search (BFS) from the Target's starting node ---

        // Mark the Target's start node as visited and set its distance from itself to 0.
        nodeTraversalData[ targetStartNode ].visitedByTarget = 1;
        nodeTraversalData[ targetStartNode ].distanceFromTarget = 0;
        // Initialize the BFS queue for the Target.
        var targetBfsQueue = [ {
          vertexId: targetStartNode,
          travelDist: 0
        } ];

        // Process the queue until it's empty.
        while ( targetBfsQueue.length > 0 ) {
          var currentVertexData = targetBfsQueue.pop(); // Dequeue the current node and its distance.
          var connectedNodes = adjacencyStructure[ currentVertexData.vertexId ]; // Get its connected nodes.

          // Iterate through all connected nodes of the current vertex.
          for ( var connectedIdx = 0; connectedIdx < connectedNodes.length; connectedIdx++ ) {
            var connectedNodeId = connectedNodes[ connectedIdx ];

            // If this connected node has not yet been visited by the Target.
            if ( nodeTraversalData[ connectedNodeId ].visitedByTarget !== 1 ) {
              nodeTraversalData[ connectedNodeId ].visitedByTarget = 1; // Mark as visited.
              nodeTraversalData[ connectedNodeId ].distanceFromTarget = currentVertexData.travelDist + 1; // Update distance.
              // Enqueue the connected node for further exploration.
              targetBfsQueue.push( {
                vertexId: connectedNodeId,
                travelDist: currentVertexData.travelDist + 1
              } );
            }
          }
        }


        // --- Calculate the final result based on the computed traversal distances ---

        // `maximumTargetReach` stores the maximum distance the Target can reach
        // while still being strictly faster than the Agent to that node.
        var maximumTargetReach = 0;
        // `minimumCommonPathDistance` stores the smallest distance where both Target and Agent
        // can reach a node in the same amount of time.
        var minimumCommonPathDistance = 99999999999; // Initialize with a very large value.
        // `hasEqualDistancePath` indicates if there's at least one node where Target and Agent arrive simultaneously.
        var hasEqualDistancePath = false;

        // Iterate through all nodes to compare their distances from Target and Agent.
        for ( var graphNodeIndex = 0; graphNodeIndex < nodeCount; graphNodeIndex++ ) {
          // Condition 1: Target reaches the node strictly faster than the Agent.
          if ( nodeTraversalData[ graphNodeIndex ].distanceFromTarget < nodeTraversalData[ graphNodeIndex ].distanceFromAgent ) {
            var currentTargetDistance = nodeTraversalData[ graphNodeIndex ].distanceFromTarget;
            maximumTargetReach = Math.max( currentTargetDistance, maximumTargetReach );
          }

          // Condition 2: Target and Agent reach the node at the exact same time.
          if ( nodeTraversalData[ graphNodeIndex ].distanceFromTarget === nodeTraversalData[ graphNodeIndex ].distanceFromAgent ) {
            hasEqualDistancePath = true; // Set flag to true.
            minimumCommonPathDistance = Math.min( minimumCommonPathDistance, nodeTraversalData[ graphNodeIndex ].distanceFromTarget );
          }
        }

        // Determine the final output:
        // If there are nodes reachable at the same time by both (hasEqualDistancePath is true),
        // the answer is the maximum of `maximumTargetReach` and `minimumCommonPathDistance`.
        // Otherwise (no common path), the answer is simply `maximumTargetReach`.
        var computedFinalValue = hasEqualDistancePath ? Math.max( maximumTargetReach, minimumCommonPathDistance ) : maximumTargetReach;
        console.log( computedFinalValue );
      };
    }
  ]
);