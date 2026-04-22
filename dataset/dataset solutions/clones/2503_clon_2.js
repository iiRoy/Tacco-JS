module.exports=(function(allModules){
  // This object serves as a cache for loaded modules, preventing redundant execution.
  var moduleCache={};

  // The core function responsible for loading and executing modules.
  function acquireModule(moduleIdentifier){
    // If the module is already present in the cache, return its exported values immediately.
    if(moduleCache[moduleIdentifier]) {
      return moduleCache[moduleIdentifier].exports;
    }

    // If not cached, create a new module entry.
    // This entry tracks the module's ID, its loading status, and its exports object.
    var moduleEntry=moduleCache[moduleIdentifier]={
      id: moduleIdentifier,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's definition function.
    // It receives the module entry, its exports object, and the acquireModule function itself (for dependencies).
    allModules[moduleIdentifier].call(
      moduleEntry.exports,
      moduleEntry,
      moduleEntry.exports,
      acquireModule
    );

    // Mark the module as fully loaded after its execution.
    moduleEntry.isLoaded=true;
    return moduleEntry.exports;
  }

  // Attach the complete set of module definitions and the cache to the acquireModule function for internal access.
  acquireModule.definitions=allModules;
  acquireModule.cache=moduleCache;

  // Utility function to define a non-enumerable property on an object, typically for exports.
  acquireModule.defineExportProp=function(targetObj, propName, getterFn){
    // Only define if the property does not already exist on the target object.
    acquireModule.hasProperty(targetObj, propName) || Object.defineProperty(
      targetObj,
      propName,
      { enumerable:true, get:getterFn }
    );
  };

  // Utility function to mark a module's exports as an ECMAScript module.
  acquireModule.registerEsModule=function(targetObj){
    // Set Symbol.toStringTag for better debugging experience in environments that support it.
    if(typeof Symbol!=='undefined'&&Symbol.toStringTag) {
      Object.defineProperty(targetObj, Symbol.toStringTag, { value:'Module' });
    }
    // Explicitly set __esModule to true, a common convention for ES modules in transpiled output.
    Object.defineProperty(targetObj, '__esModule', { value:true });
  };

  // Utility for handling interoperability between different module formats (e.g., CommonJS and ES Modules).
  acquireModule.interopModule=function(sourceModule, moduleFlags){
    // Flag 1: If set, the source module itself needs to be resolved through acquireModule.
    if(1&moduleFlags) {
      sourceModule=acquireModule(sourceModule);
    }
    // Flag 8: If set, return the source module directly without further processing.
    if(8&moduleFlags) {
      return sourceModule;
    }
    // Flag 4: If set, and the source is an object that's already marked as an ES module, return it directly.
    if(4&moduleFlags&&typeof sourceModule==='object'&&sourceModule&&sourceModule.__esModule) {
      return sourceModule;
    }

    // Create a new, clean object to serve as the namespace for the interoperable module.
    var namespaceObject=Object.create(null);
    acquireModule.registerEsModule(namespaceObject); // Mark it as an ES module.
    // Define a 'default' export pointing to the original source module.
    Object.defineProperty(namespaceObject, 'default', { enumerable:true, value:sourceModule });

    // Flag 2: If set, and the source is not a string, copy all its enumerable properties to the new namespace.
    if(2&moduleFlags&&typeof sourceModule!=='string') {
      for(var keyName in sourceModule) {
        acquireModule.defineExportProp(
          namespaceObject,
          keyName,
          ((propertyKey) => sourceModule[propertyKey]).bind(null, keyName) // Bind key for proper closure.
        );
      }
    }
    return namespaceObject;
  };

  // Utility function to retrieve a module's exports, handling potential default exports from ES modules.
  acquireModule.getModuleExports=function(targetModule){
    var exportProvider=targetModule&&targetModule.__esModule
      ? function(){ return targetModule.default; } // If it's an ES module, return its default export.
      : function(){ return targetModule; }; // Otherwise, return the module directly.
    // Define a special 'a' property that also points to the export provider (common webpack pattern).
    acquireModule.defineExportProp(exportProvider, 'a', exportProvider);
    return exportProvider;
  };

  // Utility to check if an object has a specific property directly (not inherited).
  acquireModule.hasProperty=function(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  // Base path for assets or resources, though not used in this specific code.
  acquireModule.baseAssetPath='';

  // Initiate the application by loading the entry point module (module 0).
  return acquireModule(acquireModule.entryPoint=0);
})
([
  // Module 0: Entry Point for Application Logic
  function(currentMod, modExports, getDep){
    'use strict';
    // Import the file system utility module.
    var fileSystemUtility=getDep(1);
    // Execute the main processing module (Module 2) with input read from a standard input file.
    getDep(2)(fileSystemUtility.readTextFileSync('/std/input.txt', 'unicode'));
  },

  // Module 1: Node.js File System Dependency
  function(currentMod, modExports){
    // Export the native Node.js file system module.
    currentMod.exports=require('node:fs');
  },

  // Module 2: Input Data Processing Orchestrator
  function(currentMod, modExports, getDep){
    'use strict';
    // Retrieve the class responsible for parsing input data.
    var dataParsingClass=getDep(3);
    // Retrieve the core algorithm logic that processes the parsed input.
    var coreProcessingLogic=getDep(5);

    // Export a function that takes raw textual input for processing.
    currentMod.exports=function(rawTextualInput){
      // Create an instance of the input data parser with the provided raw text.
      var parserInstance=new dataParsingClass(rawTextualInput);
      // Invoke the core processing logic, passing the parser instance to read data.
      coreProcessingLogic(parserInstance);
    };
  },

  // Module 3: Input Stream Reader Class
  function(currentMod, modExports, getDep){
    'use strict';
    // Get the utility class that manages a sequence of tokens (a queue-like structure).
    var tokenSequenceUtility=getDep(4);

    // Define and export the InputSequenceReader class.
    currentMod.exports=class InputSequenceReader {
      constructor(initialData){
        // Clean the raw input (trim whitespace), split it into individual tokens by whitespace,
        // and initialize the internal token stream with these processed tokens.
        const processedTokens=initialData.trim().split(/\s+/g);
        this.tokenStream=new tokenSequenceUtility(processedTokens);
      }

      // Method to fetch the next string token from the stream.
      fetchNextString(){
        return this.tokenStream.extractNext();
      }

      // Method to fetch the next integer token from the stream, parsing it with base 10.
      fetchNextInteger(){
        return parseInt(this.tokenStream.extractNext(), 10);
      }

      // Method to clear and reset the entire input stream.
      resetInputStream(){
        this.tokenStream.clearAll();
      }
    };
  },

  // Module 4: Basic Queue Data Structure
  function(currentMod, modExports, getDep){
    'use strict';
    // Define and export the ElementQueue class, implementing a basic queue.
    currentMod.exports=class ElementQueue {
      // The constructor can optionally accept an initial array of elements.
      constructor(){
        const initialElements=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];
        this.currentSize=initialElements.length; // Tracks the number of elements.
        this.elementStorage=initialElements; // The underlying array storing elements.
        this.readPointer=0; // Index for the next element to be extracted.
      }

      // Adds an item to the end of the queue.
      enqueueItem(item){
        this.currentSize++;
        this.elementStorage.push(item);
      }

      // Removes and returns the item from the front of the queue (FIFO).
      extractNext(){
        const extractedItem=this.elementStorage[this.readPointer];
        this.currentSize--;
        this.readPointer++;
        return extractedItem;
      }

      // Clears all items from the queue and resets its state.
      clearAll(){
        this.elementStorage=[];
        this.currentSize=0;
        this.readPointer=0;
      }
    };
  },

  // Module 5: Graph Algorithm Executor (Floyd-Warshall Application)
  function(currentMod, modExports, getDep){
    'use strict';
    // Import the Floyd-Warshall algorithm implementation module.
    var floydWarshallImplementer=getDep(6);

    // Export the main function that processes graph input and queries.
    currentMod.exports=function(graphDataReader){
      // Define a very large constant to represent an unreachable or infinite distance in the graph.
      const unreachableDistance=1_000_000_000_000_000; // One quadrillion

      // Read the number of nodes, edges, and the maximum allowed cost for a "teleport" from the input.
      var totalNodes=graphDataReader.fetchNextInteger();
      var totalEdges=graphDataReader.fetchNextInteger();
      var maximumPermittedCost=graphDataReader.fetchNextInteger();

      // Initialize the adjacency matrix. Each node starts with an unreachable distance to others,
      // and a distance of 0 to itself.
      var adjacencyRepresentation=new Array(totalNodes);
      for(let nodeCounter=0; nodeCounter<totalNodes; nodeCounter++) {
        adjacencyRepresentation[nodeCounter]=new Array(totalNodes).fill(unreachableDistance);
        adjacencyRepresentation[nodeCounter][nodeCounter]=0;
      }

      // Populate the adjacency matrix with direct edge weights read from input.
      // Assumes an undirected graph, so edges are added in both directions.
      for(let edgeCounter=0; edgeCounter<totalEdges; edgeCounter++) {
        var firstVertex=graphDataReader.fetchNextInteger();
        var secondVertex=graphDataReader.fetchNextInteger();
        var edgeWeightValue=graphDataReader.fetchNextInteger();
        adjacencyRepresentation[firstVertex-1][secondVertex-1]=edgeWeightValue;
        adjacencyRepresentation[secondVertex-1][firstVertex-1]=edgeWeightValue;
      }

      // Calculate all-pairs shortest paths for the initial graph using Floyd-Warshall.
      var intermediatePathMatrix=floydWarshallImplementer(adjacencyRepresentation);

      // Transform the matrix: if a path exists within `maximumPermittedCost`,
      // it's treated as a single "teleport" hop (distance 1); otherwise, it remains unreachable.
      for(let rowIterator=0; rowIterator<totalNodes; rowIterator++) {
        for(let colIterator=0; colIterator<totalNodes; colIterator++) {
          if(intermediatePathMatrix[rowIterator][colIterator]<=maximumPermittedCost) {
            adjacencyRepresentation[rowIterator][colIterator]=1;
          } else {
            adjacencyRepresentation[rowIterator][colIterator]=unreachableDistance;
          }
        }
      }

      // Recalculate all-pairs shortest paths on the transformed graph to find minimum "teleport" hops.
      var finalConnectivityMatrix=floydWarshallImplementer(adjacencyRepresentation);

      // Process user queries for pathfinding.
      var numberOfQueries=graphDataReader.fetchNextInteger();
      var collectedResults=[];
      for(let queryIterator=0; queryIterator<numberOfQueries; queryIterator++) {
        var startVertex=graphDataReader.fetchNextInteger();
        var endVertex=graphDataReader.fetchNextInteger();
        var calculatedPathLength=finalConnectivityMatrix[startVertex-1][endVertex-1];

        // Store the result, adjusting for the problem's 0-indexed vs 1-indexed output requirement.
        if(calculatedPathLength===unreachableDistance) {
          collectedResults.push(-1); // -1 indicates no valid path.
        } else {
          collectedResults.push(calculatedPathLength-1); // Adjust for the initial self-loop distance.
        }
      }

      // Output the final results, with each result on a new line.
      console.info(collectedResults.join('\n'));
    };
  },

  // Module 6: Floyd-Warshall Algorithm Implementation
  function(currentMod, modExports, getDep){
    'use strict';
    // Export the function that implements the Floyd-Warshall algorithm for all-pairs shortest paths.
    currentMod.exports=function(inputGraphData){
      var graphSize=inputGraphData.length;
      // Create a deep copy of the input graph matrix to avoid modifying the original data.
      var resultGraphMatrix=[];
      for(let rIndex=0; rIndex<graphSize; rIndex++) {
        resultGraphMatrix.push(inputGraphData[rIndex].slice()); // .slice() creates a shallow copy of inner arrays.
      }

      // Main Floyd-Warshall triple loop:
      // The 'intermediateNodeIndex' loop iterates through all possible intermediate vertices.
      for(let intermediateNodeIndex=0; intermediateNodeIndex<graphSize; intermediateNodeIndex++) {
        // The 'sourceNodeIndex' loop iterates through all possible starting vertices.
        for(let sourceNodeIndex=0; sourceNodeIndex<graphSize; sourceNodeIndex++) {
          // The 'destinationNodeIndex' loop iterates through all possible ending vertices.
          for(let destinationNodeIndex=0; destinationNodeIndex<graphSize; destinationNodeIndex++) {
            // Check if the path from 'sourceNodeIndex' to 'destinationNodeIndex' can be shortened
            // by going through 'intermediateNodeIndex'.
            if(resultGraphMatrix[sourceNodeIndex][destinationNodeIndex]>resultGraphMatrix[sourceNodeIndex][intermediateNodeIndex]+resultGraphMatrix[intermediateNodeIndex][destinationNodeIndex]) {
              // If a shorter path is found, update the distance in the matrix.
              resultGraphMatrix[sourceNodeIndex][destinationNodeIndex]=resultGraphMatrix[sourceNodeIndex][intermediateNodeIndex]+resultGraphMatrix[intermediateNodeIndex][destinationNodeIndex];
            }
          }
        }
      }
      return resultGraphMatrix; // Return the matrix with all-pairs shortest paths.
    };
  }
]);