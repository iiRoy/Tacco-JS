!function(moduleDefinitions) {

  // Cache for already loaded modules
  var moduleCache = {};

  /**
   * Custom module loading function, mimicking a simplified webpack require.
   * @param {string|number} moduleIdentifier - The ID of the module to load.
   * @returns {object} The exports of the loaded module.
   */
  function loadModule(moduleIdentifier) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleIdentifier]) {
      return moduleCache[moduleIdentifier].exports;
    }

    // Create a new module object and put it into the cache
    var currentModule = moduleCache[moduleIdentifier] = {
      id: moduleIdentifier, // Module ID
      loaded: false,        // Flag indicating if module is loaded
      exports: {}           // The exports object for this module
    };

    // Execute the module function, populating its exports
    moduleDefinitions[moduleIdentifier].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // Mark the module as loaded
    currentModule.loaded = true;

    // Return the module's exports
    return currentModule.exports;
  }

  // Store a reference to the module definitions for internal use
  loadModule.definitions = moduleDefinitions;

  // Store a reference to the module cache for internal use
  loadModule.cache = moduleCache;

  /**
   * Defines a getter function for an export property.
   * @param {object} exportObject - The object to define the property on.
   * @param {string} propertyName - The name of the property.
   * @param {function} propertyGetter - The getter function for the property.
   */
  loadModule.defineExport = function(exportObject, propertyName, propertyGetter) {
    // Check if the property already exists on the object
    if (!loadModule.hasOwnProp(exportObject, propertyName)) {
      // If not, define it with an enumerable getter
      Object.defineProperty(exportObject, propertyName, {
        enumerable: true, // Make it enumerable
        get: propertyGetter // Set the getter function
      });
    }
  };

  /**
   * Defines the `__esModule` property on the exports object.
   * This is used for ES module compatibility.
   * @param {object} exportObject - The object to define the property on.
   */
  loadModule.registerNamespace = function(exportObject) {
    // Define Symbol.toStringTag for better module identification
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Define the __esModule property to true
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  /**
   * Creates a namespace object for a module, handling different export types.
   * @param {any} valueObject - The module's exports or value.
   * @param {number} modeFlags - Flags indicating the type of export.
   * @returns {object} A namespace object.
   */
  loadModule.createNamespace = function(valueObject, modeFlags) {
    // If bit 1 is set, it's a module ID, load it
    if (1 & modeFlags) {
      valueObject = loadModule(valueObject);
    }
    // If bit 8 is set, return the value directly
    if (8 & modeFlags) {
      return valueObject;
    }
    // If bit 4 is set and it's an object with __esModule, return it directly
    if (4 & modeFlags && typeof valueObject === "object" && valueObject && valueObject.__esModule) {
      return valueObject;
    }

    // Create a new empty object for the namespace
    var namespaceObject = Object.create(null);
    // Register it as an ES module namespace
    loadModule.registerNamespace(namespaceObject);
    // Define a 'default' export pointing to the valueObject
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: valueObject
    });

    // If bit 2 is set and it's not a string, copy all properties from valueObject
    if (2 & modeFlags && typeof valueObject !== "string") {
      for (var exportKey in valueObject) {
        loadModule.defineExport(namespaceObject, exportKey, (function(key) {
          return valueObject[key];
        }).bind(null, exportKey));
      }
    }
    return namespaceObject;
  };

  /**
   * Creates a getter function for the default export of a module.
   * @param {object} moduleObject - The module object.
   * @returns {function} A getter function for the default export.
   */
  loadModule.getDefaultExport = function(moduleObject) {
    var defaultExportGetter = moduleObject && moduleObject.__esModule ?
      function() {
        return moduleObject.default;
      } :
      function() {
        return moduleObject;
      };
    // Define 'a' export pointing to the getter (common webpack pattern)
    loadModule.defineExport(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  /**
   * Checks if an object has a given property using Object.prototype.hasOwnProperty.
   * @param {object} obj - The object to check.
   * @param {string} prop - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  loadModule.hasOwnProp = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  // Public path for assets (empty string in this case)
  loadModule.publicPath = "";

  // Set the entry point module and execute it
  loadModule(loadModule.startup = 16);

}({
  // Module 0: Input Utilities
  0: function(inputMod, inputExports, inputLoader) {
    "use strict";

    // Helper for async/await functionality
    var asyncExecutor = this && this.__awaiter || function(contextObj, argsArray, promiseConstructor, generatorFunc) {
      // Returns a new Promise
      return new (promiseConstructor || (promiseConstructor = Promise))(function(resolveFunc, rejectFunc) {
        // Internal function to handle generator next() calls
        function handleNext(value) {
          try {
            step(generatorFunc.next(value));
          } catch (error) {
            rejectFunc(error);
          }
        }
        // Internal function to handle generator throw() calls
        function handleThrow(error) {
          try {
            step(generatorFunc.throw(error));
          } catch (error) {
            rejectFunc(error);
          }
        }
        // Main step function to process generator results
        function step(generatorResult) {
          generatorResult.done ?
            resolveFunc(generatorResult.value) :
            new promiseConstructor(function(resolveStep) {
              resolveStep(generatorResult.value);
            }).then(handleNext, handleThrow);
        }
        // Start the generator execution
        step((generatorFunc = generatorFunc.apply(contextObj, argsArray || [])).next());
      });
    };

    // Helper for generator functionality (state machine)
    var stateMachine = this && this.__generator || function(contextObj, argumentsArray) {
      var state, // Current state of the generator
        yieldedValue, // Value yielded by generator
        stateSequence, // Array representing state transitions
        stepInstruction = { // Object for generator control
          label: 0,
          sent: function() {
            if (1 & stateSequence[0]) {
              throw stateSequence[1];
            }
            return stateSequence[1];
          },
          trys: [], // Try-catch blocks
          ops: [] // Operations stack
        };

      // Create iterator methods for the generator
      var iteratorMethods = {
        next: createStepFunc(0),
        throw: createStepFunc(1),
        return: createStepFunc(2)
      };

      // If Symbol.iterator exists, define it for this generator
      if (typeof Symbol === "function" && (iteratorMethods[Symbol.iterator] = function() { return this; })) { /* no-op */ }

      // Function to create generator step functions
      function createStepFunc(actionCode) {
        return function(value) {
          return processGeneratorStep(actionCode, value);
        };
      }

      // Main function to process generator steps
      function processGeneratorStep(actionCode, value) {
        return new Promise(function(resolve, reject) {
          var generatorResult = (function(actionCode, value) {
            if (state) {
              throw new TypeError("Generator is already executing.");
            }
            // Loop through generator states
            while (stepInstruction) {
              try {
                // Mark generator as executing
                state = 1;
                // Handle different action codes (next, throw, return)
                if (yieldedValue && (stateSequence = 2 & actionCode ? yieldedValue.return : actionCode ? yieldedValue.throw || ((yieldedValue.return) && yieldedValue.call(yieldedValue), 0) : yieldedValue.next) && !(yieldedValue = yieldedValue.call(yieldedValue, value)).done) {
                  return yieldedValue;
                }
                // Reset yieldedValue, update stateSequence
                yieldedValue = 0;
                if (yieldedValue) {
                  stateSequence = [2 & actionCode, yieldedValue.value];
                }
                // Switch based on current state label
                switch (stateSequence[0]) {
                  case 0:
                  case 1:
                    yieldedValue = stateSequence;
                    break;
                  case 4:
                    stepInstruction.label++;
                    return {
                      value: stateSequence[1],
                      done: false
                    };
                  case 5:
                    stepInstruction.label++;
                    yieldedValue = stateSequence[1];
                    stateSequence = [0];
                    continue;
                  case 7:
                    stateSequence = stepInstruction.ops.pop();
                    stepInstruction.trys.pop();
                    continue;
                  default:
                    // Handle try/catch/finally blocks
                    if (!(yieldedValue = (yieldedValue = stepInstruction.trys).length > 0 && yieldedValue[yieldedValue.length - 1]) && (6 === stateSequence[0] || 2 === stateSequence[0])) {
                      stepInstruction = 0;
                      continue;
                    }
                    if (3 === stateSequence[0] && (!yieldedValue || value > yieldedValue[0] && value < yieldedValue[3])) {
                      stepInstruction.label = stateSequence[1];
                      break;
                    }
                    if (6 === stateSequence[0] && stepInstruction.label < yieldedValue[1]) {
                      stepInstruction.label = yieldedValue[1];
                      yieldedValue = stateSequence;
                      break;
                    }
                    if (yieldedValue && stepInstruction.label < yieldedValue[2]) {
                      stepInstruction.label = yieldedValue[2];
                      stepInstruction.ops.push(stateSequence);
                      break;
                    }
                    yieldedValue[2] && stepInstruction.ops.pop();
                    stepInstruction.trys.pop();
                    continue;
                }
                // Call the original generator function with updated state instruction
                stateSequence = argumentsArray.call(contextObj, stepInstruction);
              } catch (error) {
                stateSequence = [6, error];
                yieldedValue = 0;
              } finally {
                state = yieldedValue = 0;
              }
            }
            // If bit 5 is set, throw the error
            if (5 & stateSequence[0]) {
              throw stateSequence[1];
            }
            // Return final result
            return {
              value: stateSequence[0] ? stateSequence[1] : void 0,
              done: true
            };
          })([actionCode, value]);
          resolve(generatorResult);
        });
      }
      return iteratorMethods;
    };

    // Helper for importing default exports
    var defaultImporter = this && this.__importDefault || function(moduleObj) {
      return (moduleObj && moduleObj.__esModule) ? moduleObj : {
        default: moduleObj
      };
    };

    // Store 'this' context
    var currentContext = this;

    // Mark inputExports as an ES module
    inputExports.__esModule = true;

    // Import the 'fs' module
    var fileSystemHandler = defaultImporter(inputLoader(1));

    /**
     * Generator function that yields words from an input string.
     * Words are separated by whitespace.
     * @param {string} sourceText - The input string.
     * @returns {Generator<string>} A generator yielding words.
     */
    function* getInputWordIterator(sourceText) {
      // Split the string by one or more whitespace characters and filter empty strings
      var wordCollection = sourceText.split(/\s+/).filter(function(textPart) {
        return textPart.length > 0;
      });
      // Iterate through the collected words
      for (var wordIndex = 0; wordIndex < wordCollection.length; wordIndex++) {
        yield wordCollection[wordIndex];
      }
    }

    /**
     * Reads input data from /dev/stdin asynchronously.
     * @returns {Promise<string>} A promise that resolves with the input string.
     */
    inputExports.retrieveInputData = function() {
      return new Promise(function(fulfill, deny) {
        fileSystemHandler.default.readFile("/dev/stdin", "utf8", function(readError, readData) {
          if (readError) {
            deny(readError); // Reject if there's an error
          } else {
            fulfill(readData); // Resolve with the data
          }
        });
      });
    };

    // Export the word iterator function
    inputExports.getInputWordIterator = getInputWordIterator;

    /**
     * Asynchronously gets a function that returns the next integer from the input.
     * It uses the whitespace-separated word iterator.
     * @returns {Promise<function(): number>} A promise resolving to a function that returns the next integer.
     */
    inputExports.fetchNextIntFromWords = function() {
      return asyncExecutor(currentContext, void 0, void 0, function*() {
        var completeText, textWordIterator;
        return stateMachine(this, function*(stepInstruction) {
          switch (stepInstruction.label) {
            case 0:
              // Await the full input data
              return [4, inputExports.retrieveInputData()];
            case 1:
              completeText = stepInstruction.sent(); // Get the input string
              textWordIterator = getInputWordIterator(completeText); // Create the iterator
              // Return a function that parses the next word as an integer
              return [2, function() {
                return parseInt(textWordIterator.next().value);
              }];
          }
        });
      });
    };

    /**
     * Asynchronously gets a function that returns the next token from the input.
     * Tokens are contiguous sequences of non-whitespace/newline characters.
     * @returns {Promise<function(): string>} A promise resolving to a function that returns the next token.
     */
    inputExports.getWordByToken = function() {
      return asyncExecutor(currentContext, void 0, void 0, function*() {
        var totalContent, tokenGenerator;
        return stateMachine(this, function*(stepInstruction) {
          switch (stepInstruction.label) {
            case 0:
              // Await the full input data
              return [4, inputExports.retrieveInputData()];
            case 1:
              totalContent = stepInstruction.sent(); // Get the input string
              // Define an inner generator function to extract tokens
              tokenGenerator = function*() {
                var startPos = -1; // Start index of a token
                var currentPos = 0; // Current position in the string

                while (currentPos <= totalContent.length) {
                  // If current char is whitespace/newline or end of string, and we have a startPos
                  if (totalContent[currentPos] === " " || totalContent[currentPos] === "\n" || currentPos === totalContent.length) {
                    if (startPos !== -1) {
                      var extractedToken = totalContent.substring(startPos, currentPos);
                      startPos = -1; // Reset startPos
                      yield extractedToken; // Yield the token
                    }
                  } else {
                    // If not whitespace and no startPos, set startPos
                    if (startPos === -1) {
                      startPos = currentPos;
                    }
                  }
                  currentPos++; // Move to next character
                }
              }(); // Immediately invoke to create the generator object
              // Return a function that gets the next token
              return [2, function() {
                return tokenGenerator.next().value;
              }];
          }
        });
      });
    };

    /**
     * Asynchronously gets a function that returns the next integer parsed from a token.
     * It uses the token-based word extractor.
     * @returns {Promise<function(): number>} A promise resolving to a function that returns the next integer.
     */
    inputExports.parseIntFromToken = function() {
      return asyncExecutor(currentContext, void 0, void 0, function*() {
        var tokenSupplier;
        return stateMachine(this, function*(stepInstruction) {
          switch (stepInstruction.label) {
            case 0:
              // Await the token supplier function
              return [4, inputExports.getWordByToken()];
            case 1:
              tokenSupplier = stepInstruction.sent(); // Get the token supplier
              // Return a function that parses the next token as an integer
              return [2, function() {
                return parseInt(tokenSupplier());
              }];
          }
        });
      });
    };
  },

  // Module 1: Node.js File System (fs) module
  1: function(fsModuleExports, fsExportObject) {
    fsModuleExports.exports = require("fs");
  },

  // Module 16: Main Application Logic
  16: function(mainModule, mainExports, mainLoader) {
    "use strict";

    // Async/await helper (re-declared for this module, common in bundled code)
    var asyncExecutor = this && this.__awaiter || function(contextObj, argsArray, promiseConstructor, generatorFunc) {
      return new (promiseConstructor || (promiseConstructor = Promise))(function(resolveFunc, rejectFunc) {
        function handleNext(value) {
          try {
            step(generatorFunc.next(value));
          } catch (error) {
            rejectFunc(error);
          }
        }

        function handleThrow(error) {
          try {
            step(generatorFunc.throw(error));
          } catch (error) {
            rejectFunc(error);
          }
        }

        function step(generatorResult) {
          generatorResult.done ?
            resolveFunc(generatorResult.value) :
            new promiseConstructor(function(resolveStep) {
              resolveStep(generatorResult.value);
            }).then(handleNext, handleThrow);
        }
        step((generatorFunc = generatorFunc.apply(contextObj, argsArray || [])).next());
      });
    };

    // Generator helper (re-declared)
    var stateMachine = this && this.__generator || function(contextObj, argumentsArray) {
      var state, yieldedValue, stateSequence, stepInstruction = {
        label: 0,
        sent: function() {
          if (1 & stateSequence[0]) throw stateSequence[1];
          return stateSequence[1];
        },
        trys: [],
        ops: []
      };
      var iteratorMethods = {
        next: createStepFunc(0),
        throw: createStepFunc(1),
        return: createStepFunc(2)
      };
      if (typeof Symbol === "function" && (iteratorMethods[Symbol.iterator] = function() { return this; })) { /* no-op */ }

      function createStepFunc(actionCode) {
        return function(value) {
          return processGeneratorStep(actionCode, value);
        };
      }

      function processGeneratorStep(actionCode, value) {
        return new Promise(function(resolve, reject) {
          var generatorResult = (function(actionCode, value) {
            if (state) throw new TypeError("Generator is already executing.");
            while (stepInstruction) {
              try {
                state = 1;
                if (yieldedValue && (stateSequence = 2 & actionCode ? yieldedValue.return : actionCode ? yieldedValue.throw || ((yieldedValue.return) && yieldedValue.call(yieldedValue), 0) : yieldedValue.next) && !(yieldedValue = yieldedValue.call(yieldedValue, value)).done) {
                  return yieldedValue;
                }
                yieldedValue = 0;
                if (yieldedValue) stateSequence = [2 & actionCode, yieldedValue.value];
                switch (stateSequence[0]) {
                  case 0:
                  case 1:
                    yieldedValue = stateSequence;
                    break;
                  case 4:
                    stepInstruction.label++;
                    return {
                      value: stateSequence[1],
                      done: false
                    };
                  case 5:
                    stepInstruction.label++;
                    yieldedValue = stateSequence[1];
                    stateSequence = [0];
                    continue;
                  case 7:
                    stateSequence = stepInstruction.ops.pop();
                    stepInstruction.trys.pop();
                    continue;
                  default:
                    if (!(yieldedValue = (yieldedValue = stepInstruction.trys).length > 0 && yieldedValue[yieldedValue.length - 1]) && (6 === stateSequence[0] || 2 === stateSequence[0])) {
                      stepInstruction = 0;
                      continue;
                    }
                    if (3 === stateSequence[0] && (!yieldedValue || value > yieldedValue[0] && value < yieldedValue[3])) {
                      stepInstruction.label = stateSequence[1];
                      break;
                    }
                    if (6 === stateSequence[0] && stepInstruction.label < yieldedValue[1]) {
                      stepInstruction.label = yieldedValue[1];
                      yieldedValue = stateSequence;
                      break;
                    }
                    if (yieldedValue && stepInstruction.label < yieldedValue[2]) {
                      stepInstruction.label = yieldedValue[2];
                      stepInstruction.ops.push(stateSequence);
                      break;
                    }
                    yieldedValue[2] && stepInstruction.ops.pop();
                    stepInstruction.trys.pop();
                    continue;
                }
                stateSequence = argumentsArray.call(contextObj, stepInstruction);
              } catch (error) {
                stateSequence = [6, error];
                yieldedValue = 0;
              } finally {
                state = yieldedValue = 0;
              }
            }
            if (5 & stateSequence[0]) throw stateSequence[1];
            return {
              value: stateSequence[0] ? stateSequence[1] : void 0,
              done: true
            };
          })([actionCode, value]);
          resolve(generatorResult);
        });
      }
      return iteratorMethods;
    };

    // Store 'this' context
    var mainContext = this;

    // Mark mainExports as an ES module
    mainExports.__esModule = true;

    // Import input utility functions from module 0
    var dataInputHelpers = mainLoader(0);

    // Array representing the possible values for each dimension (0, 1, 2, 3)
    var dimensionsRange = [0, 1, 2, 3];

    /**
     * Sets specific states in the 4D DP table to zero based on problem constraints.
     * These represent invalid transitions or initial states.
     * @param {object} stateTable - The 4D object representing the DP table.
     */
    var resetInvalidStates = function(stateTable) {
      // Iterate through the dimension values
      for (var idx = 0, dimArray = dimensionsRange; idx < dimArray.length; idx++) {
        var currentDim = dimArray[idx];
        // Set invalid state transitions to 0
        stateTable[0][2][1][currentDim] = 0;
        stateTable[currentDim][0][2][1] = 0;
        stateTable[0][1][2][currentDim] = 0;
        stateTable[currentDim][0][1][2] = 0;
        stateTable[2][0][1][currentDim] = 0;
        stateTable[currentDim][2][0][1] = 0;
        stateTable[0][currentDim][2][1] = 0;
        stateTable[0][2][currentDim][1] = 0;
      }
    };

    // Main asynchronous execution block
    asyncExecutor(mainContext, void 0, void 0, function*() {
      var initialInputValue, parsedInputNumber, previousStates,
        dim1Iterator, dim2Iterator, dim3Iterator, dim4Iterator,
        moduloOperand, iterationCounter, currentStates,
        finalDim1, finalDim2, finalDim3, finalDim4, totalCombinations;

      return stateMachine(this, function*(stepInstruction) {
        switch (stepInstruction.label) {
          case 0:
            // Get the integer input from the user
            return [4, dataInputHelpers.parseIntFromToken()];
          case 1:
            initialInputValue = stepInstruction.sent();
            // Parse the input number
            parsedInputNumber = initialInputValue();

            // If the input number is 3, print 61 and exit (base case/special condition)
            if (parsedInputNumber === 3) {
              console.log(61);
              return [2];
            }

            // Initialize the 4D DP table (previousStates) with all values set to 1
            previousStates = {};
            for (var dim1 = 0, dimVals1 = dimensionsRange; dim1 < dimVals1.length; dim1++) {
              var key1 = dimVals1[dim1];
              previousStates[key1] = {};
              for (var dim2 = 0, dimVals2 = dimensionsRange; dim2 < dimVals2.length; dim2++) {
                var key2 = dimVals2[dim2];
                previousStates[key1][key2] = {};
                for (var dim3 = 0, dimVals3 = dimensionsRange; dim3 < dimVals3.length; dim3++) {
                  var key3 = dimVals3[dim3];
                  previousStates[key1][key2][key3] = {};
                  for (var dim4 = 0, dimVals4 = dimensionsRange; dim4 < dimVals4.length; dim4++) {
                    var key4 = dimVals4[dim4];
                    previousStates[key1][key2][key3][key4] = 1;
                  }
                }
              }
            }

            // Apply specific problem constraints to set certain initial states to 0
            resetInvalidStates(previousStates);

            // Define the modulo operation
            moduloOperand = function(value) {
              return value % 1000000007;
            };

            // Main DP loop: iterate from 5 up to the parsed input number
            for (iterationCounter = 5; iterationCounter <= parsedInputNumber; iterationCounter++) {
              // Initialize the currentStates (next DP table) for this iteration
              currentStates = {};
              for (dim1Iterator = 0, dimVals1 = dimensionsRange; dim1Iterator < dimVals1.length; dim1Iterator++) {
                key1 = dimVals1[dim1Iterator];
                currentStates[key1] = {};
                for (dim2Iterator = 0, dimVals2 = dimensionsRange; dim2Iterator < dimVals2.length; dim2Iterator++) {
                  key2 = dimVals2[dim2Iterator];
                  currentStates[key1][key2] = {};
                  for (dim3Iterator = 0, dimVals3 = dimensionsRange; dim3Iterator < dimVals3.length; dim3Iterator++) {
                    key3 = dimVals3[dim3Iterator];
                    currentStates[key1][key2][key3] = {};
                    for (dim4Iterator = 0, dimVals4 = dimensionsRange; dim4Iterator < dimVals4.length; dim4Iterator++) {
                      key4 = dimVals4[dim4Iterator];
                      currentStates[key1][key2][key3][key4] = 0; // Initialize with 0

                      // Sum up values from previousStates for all possible 'previous' dimensions
                      for (var prevDim = 0, prevDimVals = dimensionsRange; prevDim < prevDimVals.length; prevDim++) {
                        var prevKey = prevDimVals[prevDim];
                        currentStates[key1][key2][key3][key4] = moduloOperand(currentStates[key1][key2][key3][key4] + previousStates[prevKey][key1][key2][key3]);
                      }
                    }
                  }
                }
              }
              // Apply the same invalid state resets to the current states
              resetInvalidStates(currentStates);
              // Update previousStates for the next iteration
              previousStates = currentStates;
            }

            // Calculate the total sum of all valid states in the final DP table
            totalCombinations = 0;
            for (var loop1 = 0, dimValsLoop1 = dimensionsRange; loop1 < dimValsLoop1.length; loop1++) {
              finalDim1 = dimValsLoop1[loop1];
              for (var loop2 = 0, dimValsLoop2 = dimensionsRange; loop2 < dimValsLoop2.length; loop2++) {
                finalDim2 = dimValsLoop2[loop2];
                for (var loop3 = 0, dimValsLoop3 = dimensionsRange; loop3 < dimValsLoop3.length; loop3++) {
                  finalDim3 = dimValsLoop3[loop3];
                  for (var loop4 = 0, dimValsLoop4 = dimensionsRange; loop4 < dimValsLoop4.length; loop4++) {
                    finalDim4 = dimValsLoop4[loop4];
                    totalCombinations = moduloOperand(totalCombinations + previousStates[finalDim1][finalDim2][finalDim3][finalDim4]);
                  }
                }
              }
            }

            // Print the final result
            console.log(totalCombinations);
            return [2]; // End of main logic
        }
      });
    });
  }
});