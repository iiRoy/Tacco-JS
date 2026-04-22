module.exports=function(moduleDefinitions){
  let moduleCache={};
  /**
   * Loads a module by its ID from the provided definitions.
   * If the module is already cached, its exports are returned immediately.
   * Otherwise, the module is initialized, executed, and then cached.
   * @param {number} moduleId - The unique identifier for the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function retrieveModule(moduleId){
    if(moduleCache[moduleId]) return moduleCache[moduleId].exports;
    const moduleObject = moduleCache[moduleId]={
      identifier:moduleId,
      isLoaded:false,
      exports:{}
    };
    moduleDefinitions[moduleId].call(moduleObject.exports,moduleObject,moduleObject.exports,retrieveModule);
    moduleObject.isLoaded=true;
    return moduleObject.exports;
  }
  retrieveModule.modules=moduleDefinitions;
  retrieveModule.cache=moduleCache;
  /**
   * Defines a property on a target object only if it doesn't already exist.
   * This function is used to ensure properties are enumerable and have a getter.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} getterFunction - The getter function for the property.
   */
  retrieveModule.defineProperty=function(targetObject,propertyName,getterFunction){
    retrieveModule.hasOwn(targetObject,propertyName)||Object.defineProperty(targetObject,propertyName,{enumerable:true,get:getterFunction});
  };
  /**
   * Registers a module as an ES Module by adding '__esModule' and 'Symbol.toStringTag' properties.
   * This helps with compatibility and debugging in environments expecting ES Modules.
   * @param {object} targetModule - The module exports object to register.
   */
  retrieveModule.registerModule=function(targetModule){
    "undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(targetModule,Symbol.toStringTag,{value:"Module"});
    Object.defineProperty(targetModule,"__esModule",{value:true});
  };
  /**
   * Transforms and normalizes module content based on provided flags for ES Module compatibility.
   * This function handles various scenarios like loading dependencies, returning raw content,
   * or creating a namespace object with a default export.
   * @param {any} moduleContent - The content of the module, which might be an ID or actual exports.
   * @param {number} transformationFlags - Bitwise flags indicating how to transform the module.
   * @returns {any} The transformed module content or a namespace object.
   */
  retrieveModule.transformModule=function(moduleContent,transformationFlags){
    if(1&transformationFlags&&(moduleContent=retrieveModule(moduleContent)));
    if(8&transformationFlags) return moduleContent;
    if(4&transformationFlags&&"object"==typeof moduleContent&&moduleContent&&moduleContent.__esModule) return moduleContent;
    const namespaceObject=Object.create(null);
    retrieveModule.registerModule(namespaceObject);
    Object.defineProperty(namespaceObject,"default",{enumerable:true,value:moduleContent});
    if(2&transformationFlags&&"string"!=typeof moduleContent) for(const propertyKey in moduleContent) retrieveModule.defineProperty(namespaceObject,propertyKey,((key)=>moduleContent[key]).bind(null,propertyKey));
    return namespaceObject;
  };
  /**
   * Creates a getter function for a module's default export, handling both CommonJS and ES Module formats.
   * @param {object} inputModule - The module object potentially containing '__esModule' and 'default' properties.
   * @returns {function} A function that returns the module's default export.
   */
  retrieveModule.normalizeModule=function(inputModule){
    const defaultExportGetter=inputModule&&inputModule.__esModule?function(){return inputModule.default}:function(){return inputModule};
    retrieveModule.defineProperty(defaultExportGetter,"a",defaultExportGetter);
    return defaultExportGetter;
  };
  /**
   * Checks if an object has a specified property directly on itself (not inherited).
   * @param {object} targetObject - The object to check.
   * @param {string} propertyName - The name of the property.
   * @returns {boolean} True if the property exists directly on the object, false otherwise.
   */
  retrieveModule.hasOwn=function(targetObject,propertyName){
    return Object.prototype.hasOwnProperty.call(targetObject,propertyName);
  };
  retrieveModule.publicPath="";
  retrieveModule(retrieveModule.startupModuleId=0);
}(
  [
    // Module 0: Primary application startup point
    function(currentModule,moduleExports,moduleLoader){
      "use strict";
      // Load the Node.js file system handler.
      let fileSystemHandler=moduleLoader(1);
      // Load the main data processing routine and execute it with input from standard input.
      moduleLoader(2)(fileSystemHandler.readFileSync("/dev/stdin","utf8"));
    },
    // Module 1: Wrapper for Node.js 'fs' module
    function(currentModule,moduleExports){
      currentModule.exports=require("node:fs");
    },
    // Module 2: Orchestrates input parsing and graph processing
    function(currentModule,moduleExports,moduleLoader){
      "use strict";
      // Fetch the DataStreamReader class and the graph processing function.
      let inputParserClass=moduleLoader(3), processingRoutine=moduleLoader(5);
      // Export a function that takes raw input data and initiates processing.
      currentModule.exports=function(rawData){
        let streamProcessor=new inputParserClass(rawData);
        processingRoutine(streamProcessor);
      };
    },
    // Module 3: DataStreamReader class for sequential token extraction
    function(currentModule,moduleExports,moduleLoader){
      "use strict";
      currentModule.exports=class DataStreamReader{
        /**
         * Initializes the DataStreamReader with raw string data.
         * The data is trimmed and split into tokens based on whitespace.
         * @param {string} sourceData - The raw string input.
         */
        constructor(sourceData){
          const tokenArray=sourceData.trim().split(/\s+/g);
          this.tokenQueue=new moduleLoader(4)(tokenArray);
        }
        /**
         * Retrieves the next string token from the stream.
         * @returns {string} The dequeued string token.
         */
        readString(){
          return this.tokenQueue.dequeue();
        }
        /**
         * Retrieves the next integer token from the stream.
         * @returns {number} The dequeued integer token.
         */
        readInteger(){
          return Number.parseInt(this.tokenQueue.dequeue(),10);
        }
        /**
         * Clears all remaining tokens from the stream.
         */
        finishReading(){
          this.tokenQueue.flush();
        }
      };
    },
    // Module 4: ElementQueue class for managing a FIFO collection of items
    function(currentModule,moduleExports){
      "use strict";
      currentModule.exports=class ElementQueue{
        /**
         * Initializes a new ElementQueue, optionally with initial elements.
         * @param {Array<any>} [initialElements=[]] - An array of elements to pre-populate the queue.
         */
        constructor(initialElements=[]){
          this.currentSize=initialElements.length;
          this.queuedElements=initialElements;
          this.currentIndex=0;
        }
        /**
         * Adds an item to the end of the queue.
         * @param {any} itemToAdd - The item to be enqueued.
         */
        enqueue(itemToAdd){
          this.currentSize+=1;
          this.queuedElements.push(itemToAdd);
        }
        /**
         * Removes and returns the item from the front of the queue.
         * @returns {any} The dequeued item.
         */
        dequeue(){
          const retrievedItem=this.queuedElements[this.currentIndex];
          this.currentSize-=1;
          this.currentIndex+=1;
          return retrievedItem;
        }
        /**
         * Resets the queue, clearing all elements and indices.
         */
        flush(){
          this.queuedElements=[];
          this.currentSize=0;
          this.currentIndex=0;
        }
      };
    },
    // Module 5: Core graph algorithm logic and query processing
    function(currentModule,moduleExports,moduleLoader){
      "use strict";
      // Load the Floyd-Warshall algorithm implementation.
      const floydWarshallAlgorithm=moduleLoader(6);
      currentModule.exports=function(inputSource){
        // Read graph dimensions and parameters from the input stream.
        const numberOfNodes=inputSource.readInteger(), numberOfEdges=inputSource.readInteger(), maxAllowedDistance=inputSource.readInteger();
        // Initialize the direct path matrix, representing initial edge weights.
        const directPathMatrix=new Array(numberOfNodes);
        for(let nodeIndex=0;nodeIndex<numberOfNodes;nodeIndex++) directPathMatrix[nodeIndex]=new Array(numberOfNodes).fill(Number.MAX_SAFE_INTEGER);
        // Populate the matrix with edge data from input. Edges are undirected.
        for(let edgeCount=0;edgeCount<numberOfEdges;edgeCount++){
          const startNode=inputSource.readInteger(), endNode=inputSource.readInteger(), edgeWeight=inputSource.readInteger();
          directPathMatrix[startNode-1][endNode-1]=edgeWeight;
          directPathMatrix[endNode-1][startNode-1]=edgeWeight;
        }
        // Calculate all-pairs shortest paths based on original edge weights.
        const shortestPathMatrix=floydWarshallAlgorithm(directPathMatrix);
        // Adjust the direct path matrix based on `maxAllowedDistance`.
        // If an original shortest path is within the limit, its new cost is 1.
        for(let rowIdx=0;rowIdx<numberOfNodes;rowIdx++) for(let colIdx=0;colIdx<numberOfNodes;colIdx++) shortestPathMatrix[rowIdx][colIdx]<=maxAllowedDistance&&(directPathMatrix[rowIdx][colIdx]=1);
        // Recalculate all-pairs shortest paths using the adjusted costs (effectively counting "hops").
        const adjustedShortestPathMatrix=floydWarshallAlgorithm(directPathMatrix);
        // Process queries for shortest paths in the adjusted graph.
        const numberOfQueries=inputSource.readInteger();
        for(let queryIndex=0;queryIndex<numberOfQueries;queryIndex++){
          const queryStartNode=inputSource.readInteger(), queryEndNode=inputSource.readInteger(), finalDistance=adjustedShortestPathMatrix[queryStartNode-1][queryEndNode-1];
          // Output -1 if no path, otherwise the distance minus 1.
          Number.MAX_SAFE_INTEGER===finalDistance?console.log(-1):console.log(finalDistance-1);
        }
      };
    },
    // Module 6: Floyd-Warshall Algorithm implementation for all-pairs shortest paths
    function(currentModule,moduleExports){
      "use strict";
      currentModule.exports=function(adjacencyMatrix){
        const vertexCount=adjacencyMatrix.length;
        // Create a deep copy of the adjacency matrix to store distances.
        const distanceMatrix=[];
        for(let vertexIdx=0;vertexIdx<vertexCount;vertexIdx++) distanceMatrix.push(adjacencyMatrix[vertexIdx].concat());
        // Apply the Floyd-Warshall algorithm.
        // Iterate through all possible intermediate vertices.
        for(let intermediateVertex=0;intermediateVertex<vertexCount;intermediateVertex++)
          // Iterate through all possible starting vertices.
          for(let startVertex=0;startVertex<vertexCount;startVertex++)
            // Iterate through all possible ending vertices.
            for(let endVertex=0;endVertex<vertexCount;endVertex++)
              // If the path through 'intermediateVertex' is shorter, update the distance.
              distanceMatrix[startVertex][endVertex]>distanceMatrix[startVertex][intermediateVertex]+distanceMatrix[intermediateVertex][endVertex]&&
              (distanceMatrix[startVertex][endVertex]=distanceMatrix[startVertex][intermediateVertex]+distanceMatrix[intermediateVertex][endVertex]);
        return distanceMatrix;
      };
    }
  ]
);