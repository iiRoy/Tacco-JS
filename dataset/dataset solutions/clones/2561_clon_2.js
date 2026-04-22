module.exports=function( moduleDefinitions ) {
  // This object acts as a cache for already loaded modules.
  let loadedModules = {};

  /**
   * The core module loading function.
   * @param {number} moduleId The identifier for the module to load.
   * @returns {object} The exports of the requested module.
   */
  function retrieveModule ( moduleId ) {
    // If the module is already in the cache, return its exports.
    if ( loadedModules[moduleId] ) {
      return loadedModules[moduleId].exports;
    }

    // If not in cache, create a new module entry.
    // 'currentModule' stores metadata and exports for the current module.
    let currentModule = loadedModules[moduleId] = {
      identifier: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's definition function, populating its exports.
    // The definition function is expected to be in the 'moduleDefinitions' array.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, retrieveModule);

    // Mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Attach module definitions to the loader for internal use.
  retrieveModule.definitions = moduleDefinitions;

  // Attach the module cache to the loader.
  retrieveModule.cache = loadedModules;

  /**
   * Defines a getter function for an export property.
   * @param {object} exportObject The object to define the property on.
   * @param {string} propertyName The name of the property.
   * @param {Function} getterFunction The function to call to get the property's value.
   */
  retrieveModule.definePropertyGetter = function( exportObject, propertyName, getterFunction ) {
    // Only define if the property doesn't already exist.
    if ( !retrieveModule.hasOwn( exportObject, propertyName ) ) {
      Object.defineProperty( exportObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  /**
   * Marks an object as an ES Module, adding __esModule and Symbol.toStringTag properties.
   * @param {object} exportObject The object to mark.
   */
  retrieveModule.markAsEsModule = function( exportObject ) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty( exportObject, Symbol.toStringTag, { value: 'Module' } );
    }
    Object.defineProperty( exportObject, '__esModule', { value: true } );
  };

  /**
   * Creates a namespace object for a module.
   * Handles various module export formats (ESM, CJS, etc.).
   * @param {any} valueToWrap The module's exports or value.
   * @param {number} modeFlags Flags indicating export type.
   * @returns {object} A namespace object.
   */
  retrieveModule.createNamespaceObject = function( valueToWrap, modeFlags ) {
    // If flag 1 is set, it means the value is a module ID, so resolve it.
    if ( 1 & modeFlags ) {
      valueToWrap = retrieveModule( valueToWrap );
    }

    // If flag 8 is set, simply return the value as is.
    if ( 8 & modeFlags ) {
      return valueToWrap;
    }

    // If flag 4 is set and it's an object with __esModule, return it directly.
    if ( 4 & modeFlags && typeof valueToWrap === 'object' && valueToWrap && valueToWrap.__esModule ) {
      return valueToWrap;
    }

    // Otherwise, create a new namespace object.
    let namespaceHolder = Object.create(null);
    retrieveModule.markAsEsModule(namespaceHolder);
    Object.defineProperty( namespaceHolder, 'default', { enumerable: true, value: valueToWrap } );

    // If flag 2 is set and it's not a string, copy all properties.
    if ( 2 & modeFlags && typeof valueToWrap !== 'string' ) {
      for ( let propKey in valueToWrap ) {
        retrieveModule.definePropertyGetter( namespaceHolder, propKey, ( function( propName ) {
          return valueToWrap[propName];
        } ).bind(null, propKey) );
      }
    }
    return namespaceHolder;
  };

  /**
   * Creates a default getter function for a module.
   * @param {object} moduleExports The module's exports.
   * @returns {Function} A function that returns the default export.
   */
  retrieveModule.makeDefaultGetter = function( moduleExports ) {
    let defaultExportAccessor = moduleExports && moduleExports.__esModule
      ? function() { return moduleExports.default; }
      : function() { return moduleExports; };
    retrieveModule.definePropertyGetter( defaultExportAccessor, 'a', defaultExportAccessor );
    return defaultExportAccessor;
  };

  /**
   * Checks if an object has a specific property.
   * @param {object} targetObject The object to check.
   * @param {string} propertyName The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  retrieveModule.hasOwn = function( targetObject, propertyName ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyName );
  };

  // Public path for assets (empty in this case).
  retrieveModule.publicPath = "";

  // Set the entry module ID and immediately execute it.
  return retrieveModule( retrieveModule.startupModule = 0 );
}([
  /* Module 0: Main Application Entry Point */
  function( moduleObj, moduleExports, moduleResolver ) {
    "use strict";
    // Import the file system utility module.
    const fileSystemUtility = moduleResolver(1);

    // Import and execute the main processing function.
    // It reads input from stdin and passes it to the processing function.
    moduleResolver(2)( fileSystemUtility.readFileSync("/dev/stdin", "utf8") );
  },

  /* Module 1: File System Module */
  function( moduleObj, moduleExports ) {
    // Export the Node.js 'fs' module directly.
    moduleObj.exports = require("fs");
  },

  /* Module 2: Input Processing Orchestrator */
  function( moduleObj, moduleExports, moduleResolver ) {
    "use strict";
    // Import the InputReader class and the main processing logic.
    const inputProcessorClass = moduleResolver(3);
    const processingLogicFunction = moduleResolver(5);

    /**
     * Exports a function to process a given raw input string.
     * @param {string} rawInputString The string containing all input data.
     */
    moduleObj.exports = function( rawInputString ) {
      // Create an instance of the InputReader to parse the input.
      const processorInstance = new inputProcessorClass( rawInputString );
      // Pass the reader instance to the main processing logic.
      processingLogicFunction( processorInstance );
    };
  },

  /* Module 3: Input Reader Class */
  function( moduleObj, moduleExports, moduleResolver ) {
    "use strict";
    // Import the TokenStream class.
    const tokenStreamClass = moduleResolver(4);

    /**
     * InputReader class for parsing input from a string.
     * It uses a TokenStream internally to manage tokens.
     */
    moduleObj.exports = class InputReader {
      /**
       * Constructor for InputReader.
       * @param {string} fullInputText The complete input string.
       */
      constructor( fullInputText ) {
        // Trim whitespace and split the input into tokens by any whitespace.
        const tokenArray = fullInputText.trim().split(/\s+/g);
        // Initialize the internal token stream with the parsed tokens.
        this.tokenSource = new tokenStreamClass( tokenArray );
      }

      /**
       * Reads and returns the next raw token as a string.
       * @returns {string} The next token.
       */
      readRawToken() {
        return this.tokenSource.dequeueElement();
      }

      /**
       * Reads the next token and parses it as an integer.
       * @returns {number} The next token parsed as an integer.
       */
      readIntToken() {
        return parseInt( this.tokenSource.dequeueElement(), 10 );
      }

      /**
       * Clears the internal token stream, effectively resetting the reader.
       */
      finishReading() {
        this.tokenSource.clearAll();
      }
    };
  },

  /* Module 4: Token Stream (Queue-like) Class */
  function( moduleObj, moduleExports ) {
    "use strict";

    /**
     * TokenStream class implements a basic queue-like structure for tokens.
     */
    moduleObj.exports = class TokenStream {
      /**
       * Constructor for TokenStream.
       * @param {Array<any>} [initialElements=[]] An optional array of elements to initialize the stream with.
       */
      constructor() {
        // Handle optional initial elements from arguments.
        const initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.elementCount = initialElements.length; // Current number of elements.
        this.elementList = initialElements;         // The underlying array storing elements.
        this.currentIndex = 0;                      // Index of the next element to dequeue.
      }

      /**
       * Adds a new value to the end of the stream.
       * @param {any} newValue The value to add.
       */
      enqueueElement( newValue ) {
        this.elementCount += 1;
        this.elementList.push( newValue );
      }

      /**
       * Removes and returns the element at the front of the stream.
       * Increments the internal index.
       * @returns {any} The dequeued element.
       */
      dequeueElement() {
        const dequeuedValue = this.elementList[this.currentIndex];
        this.elementCount -= 1;
        this.currentIndex += 1;
        return dequeuedValue;
      }

      /**
       * Clears all elements from the stream and resets its state.
       */
      clearAll() {
        this.elementList = [];
        this.elementCount = 0;
        this.currentIndex = 0;
      }
    };
  },

  /* Module 5: Core Logic for Heap Operations */
  function( moduleObj, moduleExports, moduleResolver ) {
    "use strict";
    // Import the PriorityQueue class.
    const priorityQueueClass = moduleResolver(6);

    /**
     * Exports a function that processes input using a priority queue.
     * This function simulates a process where items are added to a queue,
     * then repeatedly divided and re-added, finally summing the remaining items.
     * @param {InputReader} dataReader An instance of the InputReader to get input values.
     */
    moduleObj.exports = function( dataReader ) {
      // Read the number of initial items (N) and the number of operations (K).
      const initialItemsCount = dataReader.readIntToken();
      const operationRounds = dataReader.readIntToken();

      // Initialize a new priority queue (max-heap by default for numbers).
      const itemQueue = new priorityQueueClass();

      // Populate the priority queue with initial items.
      for ( let loopCounterA = 0; loopCounterA < initialItemsCount; loopCounterA++ ) {
        const currentItemValue = dataReader.readIntToken();
        itemQueue.pushItem( currentItemValue );
      }

      // Perform K operations: take the largest item, halve it, and re-add it.
      for ( let loopCounterB = 0; loopCounterB < operationRounds; loopCounterB++ ) {
        const topElement = itemQueue.getTop();
        itemQueue.removeTop();
        itemQueue.pushItem( Math.floor( topElement / 2 ) );
      }

      // Calculate the sum of all remaining items in the priority queue.
      let finalSum = 0;
      while ( itemQueue.heapCount > 0 ) {
        finalSum += itemQueue.getTop();
        itemQueue.removeTop();
      }

      // Output the final sum to the console.
      console.log( finalSum );
    };
  },

  /* Module 6: Priority Queue Class Implementation */
  function( moduleObj, moduleExports ) {
    "use strict";

    /**
     * Comparator function for a min-heap (less than or equal).
     * @param {any} val1
     * @param {any} val2
     * @returns {boolean} True if val1 is less than or equal to val2.
     */
    function lessOrEqualComparator( val1, val2 ) {
      return val1 <= val2;
    }

    /**
     * Comparator function for a max-heap (greater than or equal).
     * @param {any} val1
     * @param {any} val2
     * @returns {boolean} True if val1 is greater than or equal to val2.
     */
    function greaterOrEqualComparator( val1, val2 ) {
      return val1 >= val2;
    }

    /**
     * PriorityQueue class implementation using a binary heap.
     * Can be configured as a min-heap or max-heap.
     */
    moduleObj.exports = class PriorityQueue {
      /**
       * Constructor for PriorityQueue.
       * @param {Array<any>} [initialHeapArray=[]] Optional initial array to build the heap from.
       * @param {boolean} [isMinHeapConfig=false] If true, creates a min-heap; otherwise, a max-heap.
       * @param {Function} [customComparisonFunc=undefined] An optional custom comparison function.
       */
      constructor() {
        // Handle constructor arguments for initial array, min-heap flag, and custom comparator.
        const initialHeapArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        const isMinHeapConfig = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1]; // Default to true if not provided.
        const customComparisonFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

        // Set the comparison function based on configuration. Default to max-heap (greaterOrEqualComparator).
        this.comparisonFunction = isMinHeapConfig ? lessOrEqualComparator : greaterOrEqualComparator;
        if ( customComparisonFunc ) {
          this.comparisonFunction = customComparisonFunc;
        }

        this.heapStorage = initialHeapArray;       // The array representing the heap.
        this.heapCount = this.heapStorage.length;  // Current number of elements in the heap.

        // If initialized with elements, build the heap structure.
        this.heapifyStructure();
      }

      /**
       * Builds the heap property from an existing array (in-place).
       * Starts from the last parent node and moves up.
       */
      heapifyStructure() {
        let lastParentIndex = 0;
        const currentHeapSize = this.heapCount;

        // Find the last node that has at least one child.
        // This effectively finds the last parent node.
        for ( ; ( 2 * lastParentIndex + 1 ) <= currentHeapSize; ) {
          lastParentIndex = 2 * lastParentIndex + 1;
        }

        // Iterate backwards from the last parent to the root, performing down-heap operations.
        for ( let loopIndex = lastParentIndex - 1; loopIndex >= 0; ) {
          // Check if the current node has a left child beyond the heap bounds.
          // If so, it's not a parent, decrement and continue.
          if ( ( 2 * loopIndex + 1 ) > ( currentHeapSize - 1 ) ) {
            loopIndex--;
          } else {
            this.downHeap( loopIndex ); // Perform down-heap to maintain heap property.
            loopIndex--;
          }
        }
      }

      /**
       * Restores the heap property by moving an element down the heap.
       * Used after removing the top element or inserting a smaller element.
       * @param {number} startIndex The index from which to start the down-heap operation.
       */
      downHeap( startIndex ) {
        const currentHeapSize = this.heapCount;
        let currentPosition = startIndex;

        // Continue as long as the current node has at least a left child.
        while ( ( 2 * currentPosition + 1 ) < currentHeapSize ) {
          const leftChildValue = this.heapStorage[ 2 * currentPosition + 1 ];
          // Get right child value, or left child value if no right child exists.
          const rightChildValue = ( 2 * currentPosition + 2 ) < currentHeapSize
            ? this.heapStorage[ 2 * currentPosition + 2 ]
            : leftChildValue;

          // Determine which child (left or right) is the "better" child according to the comparator.
          // For a max-heap, this is the larger child. For a min-heap, the smaller child.
          const chosenChildValue = this.comparisonFunction( rightChildValue, leftChildValue )
            ? leftChildValue
            : rightChildValue;
          const chosenChildIndex = this.comparisonFunction( rightChildValue, leftChildValue )
            ? ( 2 * currentPosition + 1 )
            : ( 2 * currentPosition + 2 );

          // If the chosen child is "better" than the current node, we're done (heap property holds).
          if ( this.comparisonFunction( chosenChildValue, this.heapStorage[currentPosition] ) ) {
            break;
          }

          // Swap the current node with the chosen child.
          const tempSwapValue = chosenChildValue;
          this.heapStorage[chosenChildIndex] = this.heapStorage[currentPosition];
          this.heapStorage[currentPosition] = tempSwapValue;

          // Move down to the child's position and repeat.
          currentPosition = chosenChildIndex;
        }
      }

      /**
       * Restores the heap property by moving an element up the heap.
       * Used after adding a new element.
       * @param {number} startIndex The index from which to start the up-heap operation.
       */
      upHeap( startIndex ) {
        let currentPosition = startIndex;

        // Continue as long as the current node is not the root.
        while ( currentPosition !== 0 ) {
          // Calculate the parent's index.
          const parentPosition = Math.floor( ( currentPosition - 1 ) / 2 );

          // If the current node is "better" than its parent, we're done.
          if ( this.comparisonFunction( this.heapStorage[currentPosition], this.heapStorage[parentPosition] ) ) {
            break;
          }

          // Swap the current node with its parent.
          const tempSwapValue = this.heapStorage[parentPosition];
          this.heapStorage[parentPosition] = this.heapStorage[currentPosition];
          this.heapStorage[currentPosition] = tempSwapValue;

          // Move up to the parent's position and repeat.
          currentPosition = parentPosition;
        }
      }

      /**
       * Adds a new item to the priority queue, maintaining the heap property.
       * @param {any} itemToAdd The item to be added.
       */
      pushItem( itemToAdd ) {
        this.heapCount += 1;
        this.heapStorage.push( itemToAdd );
        this.upHeap( this.heapCount - 1 ); // Perform up-heap from the new item's position.
      }

      /**
       * Returns the top element of the priority queue without removing it.
       * @returns {any} The top element.
       */
      getTop() {
        return this.heapStorage[0];
      }

      /**
       * Removes and returns the top element of the priority queue.
       * @returns {boolean} True if an element was removed, false if the queue was empty.
       */
      removeTop() {
        // Only proceed if the heap is not empty.
        if ( this.heapCount !== 0 ) {
          this.heapCount -= 1;
          // Move the last element to the root, then remove the last element.
          this.heapStorage[0] = this.heapStorage.pop();
          this.downHeap( 0 ); // Perform down-heap from the root to restore heap property.
          return true;
        }
        return false; // Return false if the heap was empty.
      }

      /**
       * Returns the internal array representation of the heap.
       * (Note: this array might not be sorted, only heap-ordered).
       * @returns {Array<any>} The array holding the heap elements.
       */
      getValuesList() {
        return this.heapStorage;
      }
    };
  }
]);