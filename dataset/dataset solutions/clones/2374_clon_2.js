/*! inputPath: /contest/atcoder/sumitrust2019/d.ts */
(function(scriptUnits) { // Main bundle loader function
  // Store for already loaded code fragments
  var cachedFragments = {};

  // Function to load a specific code unit
  function __script_loader__(chunkId) {
    // Check if the chunk is already in the cache
    if (cachedFragments[chunkId]) {
      return cachedFragments[chunkId].exposedItems;
    }
    // Create a new code unit entry (and place it into the cache)
    var codeUnit = cachedFragments[chunkId] = {
      identifier: chunkId,
      loadedFlag: false,
      exposedItems: {}
    };

    // Execute the code unit's function
    scriptUnits[chunkId].call(codeUnit.exposedItems, codeUnit, codeUnit.exposedItems, __script_loader__);

    // Mark the code unit as fully loaded
    codeUnit.loadedFlag = true;

    // Return the exposed items of the code unit
    return codeUnit.exposedItems;
  }


  // Expose the collection of code units (__code_fragments__)
  __script_loader__.bundles = scriptUnits;

  // Expose the code unit cache
  __script_loader__.cache = cachedFragments;

  // Define a getter for harmony exports
  __script_loader__.defineGetter = function(exposed, itemLabel, accessor) {
    if (!__script_loader__.hasOwn(exposed, itemLabel)) {
      Object.defineProperty(exposed, itemLabel, {
        enumerable: true,
        get: accessor
      });
    }
  };

  // Define __is_es_module__ on exports object
  __script_loader__.registerNamespace = function(exposed) {
    if (typeof GlobalSymbol !== 'undefined' && GlobalSymbol.toStringTag) {
      Object.defineProperty(exposed, GlobalSymbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(exposed, '__is_es_module__', {
      value: true
    });
  };

  // Create a simulated namespace object
  // mode & 1: sourceValue is a chunk identifier, load it
  // mode & 2: merge all properties of sourceValue into the namespace
  // mode & 4: return sourceValue when it's already a namespace object
  // mode & 8|1: behave similarly to a direct load
  __script_loader__.transformValue = function(sourceValue, processingMode) {
    if (processingMode & 1) sourceValue = __script_loader__(sourceValue);
    if (processingMode & 8) return sourceValue;
    if ((processingMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__is_es_module__) return sourceValue;
    var namespaceObject = Object.create(null);
    __script_loader__.registerNamespace(namespaceObject);
    Object.defineProperty(namespaceObject, 'default', {
      enumerable: true,
      value: sourceValue
    });
    if (processingMode & 2 && typeof sourceValue != 'string')
      for (var attributeKey in sourceValue)
        __script_loader__.defineGetter(namespaceObject, attributeKey, function(attributeKey) {
          return sourceValue[attributeKey];
        }.bind(null, attributeKey));
    return namespaceObject;
  };

  // Function to obtain default export for compatibility with non-ES modules
  __script_loader__.normalizeModule = function(sourceModule) {
    var accessor = sourceModule && sourceModule.__is_es_module__ ?
      function fetchDefault() {
        return sourceModule['default'];
      } :
      function retrieveExposed() {
        return sourceModule;
      };
    __script_loader__.defineGetter(accessor, 'a', accessor);
    return accessor;
  };

  // Object.prototype.hasOwnProperty.call wrapper
  __script_loader__.hasOwn = function(targetObject, attribute) {
    return Object.prototype.hasOwnProperty.call(targetObject, attribute);
  };

  // Base public URL for resources
  __script_loader__.basePath = "";


  // Load the entry code unit and return its exports
  return __script_loader__(__script_loader__.startUnit = "./src/contest/atcoder/sumitrust2019/d.ts");
})
/************************************************************************/
({

  /***/
  "./node_modules/webpack/buildin/module.js":
  /*!***********************************!*\
    *** (webpack)/buildin/module.js ***!
    \***********************************/
  /*! no static exports found */
  /***/
  (function(codeUnit, exposedItems) {

    exposedItems = codeUnit;
    if (!exposedItems.polyfillStatus) {
      exposedItems.markObsolete = function() {};
      exposedItems.sourcePaths = [];
      // codeUnit.originator is undefined by default
      if (!exposedItems.dependentUnits) exposedItems.dependentUnits = [];
      Object.defineProperty(exposedItems, "isLoaded", {
        enumerable: true,
        get: function() {
          return exposedItems.loadedFlag;
        }
      });
      Object.defineProperty(exposedItems, "uniqueId", {
        enumerable: true,
        get: function() {
          return exposedItems.identifier;
        }
      });
      exposedItems.polyfillStatus = 1;
    }
    return exposedItems;


  }),

  /***/
  "./src/contest/atcoder/sumitrust2019/d.ts":
  /*!************************************************!*\
    *** ./src/contest/atcoder/sumitrust2019/d.ts ***!
    \************************************************/
  /*! no static exports found */
  /***/
  (function(thisModule, output, __script_loader__) {

    "use strict";
    /* WEBPACK VARIABLE INJECTION */
    (function(thisModule) {
      var __import_default_export__ = (this && this.__import_default_export__) || function(importedItem) {
        return (importedItem && importedItem.__is_es_module__) ? importedItem : {
          "default": importedItem
        };
      };
      Object.defineProperty(output, "__is_es_module__", {
        value: true
      });
      output.primaryFunction = void 0;
      const fileSystemTools_1 = __import_default_export__(__script_loader__(/*! fs */ "fs"));
      const inputOutputHelpers_1 = __script_loader__(/*! ../../common/io */ "./src/contest/common/io.ts");

      // Core algorithm to find the count of unique 3-digit combinations
      function computeSolution({
        inputSize,
        inputString
      }) {
        const dynamicProgramTable = Array(inputSize);
        const nextIndexDigit = Array(10).fill(-1); // Stores the next occurrence index for each digit

        // Populate DP table from right to left
        for (let currentPosition = inputSize - 1; currentPosition >= 0; currentPosition--) {
          const digitValue = Number.parseInt(inputString[currentPosition]);
          dynamicProgramTable[currentPosition] = [...nextIndexDigit]; // Copy current state of nextIndexDigit
          nextIndexDigit[digitValue] = currentPosition; // Update next occurrence for the current digit
        }

        let resultCount = 0;
        // Label for outer loop to allow 'continue L'
        mainLoopLabel: for (let combinationValue = 0; combinationValue < 1000; combinationValue++) {
          const targetString = combinationValue.toFixed(0).padStart(3, '0'); // Format as "012"

          // Find the first digit
          let currentMatchIndex = nextIndexDigit[Number.parseInt(targetString[0])];
          if (currentMatchIndex < 0) {
            continue mainLoopLabel; // First digit not found, try next combination
          }

          // Find the second and third digits sequentially
          for (let digitPosition = 1; digitPosition < 3; digitPosition++) {
            currentMatchIndex = dynamicProgramTable[currentMatchIndex][Number.parseInt(targetString[digitPosition])];
            if (currentMatchIndex < 0) {
              continue mainLoopLabel; // Subsequent digit not found after current match
            }
          }

          // If all three digits are found in sequence
          resultCount++;
        }
        return resultCount;
      }

      // Entry point for the application
      function primaryExecution(inputLine) {
        const getNextToken = inputOutputHelpers_1.retrieveNext(inputLine);
        const inputSize = Number.parseInt(getNextToken());
        const inputString = getNextToken();
        const finalResult = computeSolution({
          inputSize,
          inputString
        });
        System.out.println(finalResult); // Output the computed answer
      }
      output.primaryFunction = primaryExecution; // Expose the main function

      // Check if this module is the main entry point
      if (__script_loader__.cache[__script_loader__.startUnit] === thisModule) {
        const standardInputLine = fileSystemTools_1.default.readTextFromFile("/dev/stdin", "utf8");
        primaryExecution(standardInputLine);
      }

      /* WEBPACK VARIABLE INJECTION */
    }.call(this, __script_loader__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(thisModule)))

  }),

  /***/
  "./src/contest/common/io.ts":
  /*!**********************************!*\
    *** ./src/contest/common/io.ts ***!
    \**********************************/
  /*! no static exports found */
  /***/
  (function(codeUnit, output, __script_loader__) {

    "use strict";

    Object.defineProperty(output, "__is_es_module__", {
      value: true
    });
    output.retrieveNextBigInt = output.retrieveNextInt = output.retrieveNext = output.createParserIterator = output.createTokenIterator = void 0;

    // Generator for iterating over tokens in a line
    function* createTokenIterator(inputLine) {
      const inputTokens = inputLine.split(/\s+/);
      for (const singleToken of inputTokens) {
        yield singleToken;
      }
    }
    output.createTokenIterator = createTokenIterator;

    // Generator for iterating over parsed tokens in a line
    function* createParserIterator(inputLine, parsingFunction) {
      const inputTokens = inputLine.split(/\s+/);
      for (const singleToken of inputTokens) {
        yield parsingFunction(singleToken);
      }
    }
    output.createParserIterator = createParserIterator;

    // Returns a function to get the next raw token
    function retrieveNext(inputLine) {
      const tokenStream = createTokenIterator(inputLine);
      return () => tokenStream.next().value;
    }
    output.retrieveNext = retrieveNext;

    // Returns a function to get the next integer token
    function retrieveNextInt(inputLine) {
      const tokenStream = createTokenIterator(inputLine);
      return () => Number.parseInt(tokenStream.next().value);
    }
    output.retrieveNextInt = retrieveNextInt;

    // Returns a function to get the next BigInt token
    function retrieveNextBigInt(inputLine) {
      const tokenStream = createTokenIterator(inputLine);
      return () => BigInt(tokenStream.next().value);
    }
    output.retrieveNextBigInt = retrieveNextBigInt;


  }),

  /***/
  "fs":
  /*!*********************!*\
    *** external "fs" ***!
    \*********************/
  /*! no static exports found */
  /***/
  (function(codeUnit, exposedItems) {

    exposedItems = require("fs");

  })

});
// # sourceMappingURL=submit.js.map - This line should also be altered if possible, but it's part of build output.