/* This is a custom module system for bundling JavaScript files. */
module.exports = function ( componentDefinitions ) {
  // A cache for already loaded modules to prevent redundant processing.
  var loadedComponents = {};

  /**
   * Resolves and loads a component by its identifier.
   * @param {number} componentKey The unique identifier for the component.
   * @returns {object} The exports of the loaded component.
   */
  function loadComponent ( componentKey ) {
    // If the component is already in the cache, return its exports immediately.
    if ( loadedComponents[componentKey] ) {
      return loadedComponents[componentKey].exportedContent;
    }

    // Initialize a new component object in the cache.
    var componentObject = loadedComponents[componentKey] = {
      identification: componentKey,
      isInitialized: false,
      exportedContent: {}
    };

    // Execute the component's definition function.
    // The definition function receives (module, exports, require)
    componentDefinitions[componentKey].call(
      componentObject.exportedContent,
      componentObject,
      componentObject.exportedContent,
      loadComponent
    );

    // Mark the component as initialized.
    componentObject.isInitialized = true;

    // Return the exports of the newly loaded component.
    return componentObject.exportedContent;
  }

  // Store the component definitions array on the loader for internal access.
  loadComponent.definitions = componentDefinitions;

  // Store the cache on the loader.
  loadComponent.cache = loadedComponents;

  /**
   * Defines a property on an object, similar to `Object.defineProperty`.
   * @param {object} targetObj The object on which to define the property.
   * @param {string} propName The name of the property.
   * @param {function} getterFunc A function that returns the value of the property.
   */
  loadComponent.defineExport = function ( targetObj, propName, getterFunc ) {
    // Check if the property already exists to avoid overwriting.
    if ( !loadComponent.hasOwnProperty( targetObj, propName ) ) {
      Object.defineProperty( targetObj, propName, {
        enumerable: true,
        get: getterFunc
      } );
    }
  };

  /**
   * Marks an exports object as an ES module for compatibility.
   * @param {object} exportsObj The object to mark as an ES module.
   */
  loadComponent.markAsESModule = function ( exportsObj ) {
    // Set Symbol.toStringTag for better debugging.
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( exportsObj, Symbol.toStringTag, { value: "Component" } );
    }
    // Set the __isComponent flag.
    Object.defineProperty( exportsObj, "__isComponent", { value: true } );
  };

  /**
   * Creates an object that mimics an ES module, handling various export types.
   * @param {any} sourceValue The original value to be exported.
   * @param {number} processingFlags Flags indicating how to process the sourceValue.
   * @returns {object} A normalized ES module-like object.
   */
  loadComponent.normalizeExport = function ( sourceValue, processingFlags ) {
    // If flag 1 is set, load the component and use its exports.
    if ( processingFlags & 1 ) {
      sourceValue = loadComponent( sourceValue );
    }

    // If flag 8 is set, return the sourceValue directly.
    if ( processingFlags & 8 ) {
      return sourceValue;
    }

    // If flag 4 is set and it's an object marked as an ES module, return it directly.
    if ( ( processingFlags & 4 ) && typeof sourceValue === "object" && sourceValue && sourceValue.__isComponent ) {
      return sourceValue;
    }

    // Create a new empty object for the normalized export.
    var normalizedModule = Object.create( null );

    // Mark it as an ES module.
    loadComponent.markAsESModule( normalizedModule );

    // Define a 'default' property pointing to the sourceValue.
    Object.defineProperty( normalizedModule, "default", {
      enumerable: true,
      value: sourceValue
    } );

    // If flag 2 is set and sourceValue is not a string, copy all properties from sourceValue.
    if ( ( processingFlags & 2 ) && typeof sourceValue !== "string" ) {
      for ( var propKey in sourceValue ) {
        loadComponent.defineExport(
          normalizedModule,
          propKey,
          ( function ( key ) { return sourceValue[key]; } ).bind( null, propKey )
        );
      }
    }

    return normalizedModule;
  };

  /**
   * Creates a getter function for accessing an export, handling default exports.
   * @param {any} originalExport The export value or module object.
   * @returns {function} A function that returns the actual export.
   */
  loadComponent.getExportGetter = function ( originalExport ) {
    // Determine the getter logic based on whether it's an ES module.
    var exportAccessor = originalExport && originalExport.__isComponent
      ? function () { return originalExport.default; }
      : function () { return originalExport; };

    // Define a dummy 'a' property on the getter itself, a webpack convention.
    loadComponent.defineExport( exportAccessor, "a", exportAccessor );
    return exportAccessor;
  };

  /**
   * Checks if an object has a property directly (not inherited).
   * @param {object} targetObject The object to check.
   * @param {string} propertyId The name of the property.
   * @returns {boolean} True if the property exists directly on the object, false otherwise.
   */
  loadComponent.hasOwnProperty = function ( targetObject, propertyId ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyId );
  };

  // Set the public path for asset loading (empty in this case).
  loadComponent.assetPath = "";

  // Start the application by loading the entry component (component ID 0).
  // The 'startComponent' property on the loader can be used to set the entry point.
  return loadComponent( loadComponent.startComponent = 0 );
}(
  [
    /* Component 0: Main application entry point. */
    function ( currentModule, moduleOutput, getDependency ) {
      // Read input from stdin, process it using component 1, and then
      // pass the result to component 1's exported function.
      getDependency( 1 )(
        getDependency( 2 ).readFileSync( "/dev/stdin", "UTF-8" )
      );
    },

    /* Component 1: Core logic for processing input data. */
    function ( currentModule, moduleOutput ) {
      currentModule.exports = function ( inputStringData ) {
        // Split the input string into individual lines.
        var dataLines = inputStringData.split( "\n" );

        // The first line contains the number of vertices.
        var numVertices = Number( dataLines[0] );

        // Adjacency list to store connections for each vertex.
        var nodeConnections = [];

        // Stores the initial target node for each vertex.
        var initialTargets = [];

        // Loop through each vertex to parse its connections.
        for ( var vertexIndex = 0; vertexIndex < numVertices; vertexIndex++ ) {
          // Parse the connection data for the current vertex.
          var currentVertexLinks = dataLines[vertexIndex + 1]
            .split( " " )
            .map( function ( linkStr ) {
              return Number( linkStr ) - 1; // Convert to 0-indexed numbers.
            } );

          // Store the first link as the initial target.
          initialTargets.push( currentVertexLinks[0] );

          // Add all links for this vertex to the adjacency list.
          nodeConnections.push( currentVertexLinks );
        }

        // Calculate the total number of expected edges in a complete graph (n*(n-1)/2).
        var expectedEdges = numVertices * ( numVertices - 1 ) / 2;

        // Array to keep track of how many times each node's connections have been visited.
        var connectionUsageCounts = new Array( numVertices ).fill( 0 );

        // Array to store the maximum depth reached for each node.
        var maxNodeDepths = new Array( numVertices ).fill( 0 );

        // Queue for breadth-first-like processing of nodes.
        var processingQueue = [];

        // Initialize the queue with all vertices.
        for ( var nodeIdentifier = 0; nodeIdentifier < numVertices; nodeIdentifier++ ) {
          processingQueue.push( nodeIdentifier );
        }

        // Variables for tracking maximum depth and processed edges.
        var overallMaxDepth = 0;
        var totalProcessedEdges = 0;

        // Process nodes from the queue until it's empty.
        while ( processingQueue.length > 0 ) {
          // Get the next node to process.
          var currentProcessingNode = processingQueue.shift();

          // Check for a specific cycle condition (node points to its own initial target, and that target points back to the node).
          if ( initialTargets[initialTargets[currentProcessingNode]] === currentProcessingNode ) {
            totalProcessedEdges += 1; // Increment the count of processed edges.

            // Get the node connected to the current node.
            var linkedNode = initialTargets[currentProcessingNode];

            // Calculate the new maximum depth for both current and linked nodes.
            var calculatedDepth = Math.max( maxNodeDepths[currentProcessingNode], maxNodeDepths[linkedNode] ) + 1;

            // Update the overall maximum depth if this is greater.
            if ( overallMaxDepth < calculatedDepth ) {
              overallMaxDepth = calculatedDepth;
            }

            // Assign the calculated depth to both connected nodes.
            maxNodeDepths[currentProcessingNode] = calculatedDepth;
            maxNodeDepths[linkedNode] = calculatedDepth;

            // Increment usage counters for both nodes.
            connectionUsageCounts[currentProcessingNode] += 1;
            connectionUsageCounts[linkedNode] += 1;

            // If current node still has unvisited connections:
            if ( connectionUsageCounts[currentProcessingNode] !== numVertices ) {
              // Update its target to the next connection.
              initialTargets[currentProcessingNode] = nodeConnections[currentProcessingNode][connectionUsageCounts[currentProcessingNode]];
              // If the new target forms a cycle, re-add to queue.
              if ( initialTargets[initialTargets[currentProcessingNode]] === currentProcessingNode ) {
                processingQueue.push( currentProcessingNode );
              }
            }

            // If linked node still has unvisited connections:
            if ( connectionUsageCounts[linkedNode] !== numVertices ) {
              // Update its target to the next connection.
              initialTargets[linkedNode] = nodeConnections[linkedNode][connectionUsageCounts[linkedNode]];
              // If the new target forms a cycle, re-add to queue.
              if ( initialTargets[initialTargets[linkedNode]] === linkedNode ) {
                processingQueue.push( linkedNode );
              }
            }
          }
        }

        // Output the result: max depth if all edges processed, otherwise -1.
        if ( totalProcessedEdges === expectedEdges ) {
          console.log( overallMaxDepth );
        } else {
          console.log( -1 );
        }
      };
    },

    /* Component 2: Node.js file system module. */
    function ( currentModule, moduleOutput ) {
      currentModule.exports = require( "fs" );
    }
  ]
);