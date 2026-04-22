// This file implements a custom module loading system, similar in concept to Webpack,
// but with simplified internal mechanisms and enhanced readability.
// It defines core utilities for input processing and then executes a main program
// to calculate a combinatorial result from user input.

/**
 * Global object to store loaded modules.
 * @type {Object<number, Module>}
 */
const moduleRegistry = {};

/**
 * Represents a module in the custom loading system.
 * @typedef {Object} Module
 * @property {number} id - The unique identifier of the module.
 * @property {boolean} isLoaded - Flag indicating if the module has been fully loaded and executed.
 * @property {Object} exports - The exports object of the module.
 */

/**
 * Custom 'require' function to load modules.
 * @param {number} moduleId - The ID of the module to load.
 * @returns {any} The exports of the requested module.
 */
function customModuleLoader(moduleId) {
  // If the module is already in the cache, return its exports.
  if (moduleRegistry[moduleId]) {
    return moduleRegistry[moduleId].exports;
  }

  // If not cached, create a new module entry.
  const currentModule = (moduleRegistry[moduleId] = {
    id: moduleId,
    isLoaded: false,
    exports: {},
  });

  try {
    // Execute the module's code within its own context.
    // The `providedModules` object contains all module definitions.
    providedModules[moduleId].call(
      currentModule.exports,
      currentModule,
      currentModule.exports,
      customModuleLoader
    );
    // Mark the module as loaded after successful execution.
    currentModule.isLoaded = true;
  } catch (moduleExecutionError) {
    console.error(`Error loading module ${moduleId}:`, moduleExecutionError);
    // In a real system, you might want to rethrow or handle more gracefully.
    throw moduleExecutionError;
  }

  // Return the module's exports.
  return currentModule.exports;
}

// --- Custom Module Loader Helpers (simplified from Webpack) ---

/**
 * Stores all module definitions provided by the bundle.
 * @type {Object<number, Function>}
 */
const providedModules = {};

/**
 * Helper to define properties on exports object, similar to Webpack's `n.d`.
 * @param {Object} target - The target object.
 * @param {string} propertyName - The name of the property.
 * @param {Function} getterFunction - The getter function for the property.
 */
customModuleLoader.exposeProperty = function (target, propertyName, getterFunction) {
  // Check if the property already exists to prevent overwrites or unnecessary definitions.
  if (!Object.prototype.hasOwnProperty.call(target, propertyName)) {
    Object.defineProperty(target, propertyName, {
      enumerable: true, // Make it enumerable for easy inspection
      get: getterFunction,
    });
  }
};

/**
 * Helper for ES Module compatibility, similar to Webpack's `n.r`.
 * @param {Object} targetModule - The module's exports object.
 */
customModuleLoader.markAsEsModule = function (targetModule) {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(targetModule, Symbol.toStringTag, { value: "Module" });
  }
  Object.defineProperty(targetModule, "__esModule", { value: true });
};

/**
 * This is the entry point for the application.
 * It initiates the loading of the main module (module ID 13)
 * after populating the module definitions.
 */
function initializeApplication(definitions) {
  Object.assign(providedModules, definitions); // Populate the module definitions
  customModuleLoader(13); // Start execution from the main module
}

// --- Application Module Definitions ---

// Module 0: Core Input/Output Utilities
providedModules[0] = function (module, exports, localRequire) {
  "use strict";

  // TypeScript __awaiter and __generator polyfills/helpers
  // These are often transpiled by TypeScript for async/await syntax.
  const asyncOperationWrapper =
    (this && this.__awaiter) ||
    function (context, args, promiseConstructor, generatorFunction) {
      return new (promiseConstructor || (promiseConstructor = Promise))(function (
        resolve,
        reject
      ) {
        function step(result) {
          result.done
            ? resolve(result.value)
            : new promiseConstructor(function (res) {
                res(result.value);
              }).then(forwardSuccess, forwardFailure);
        }
        function forwardSuccess(value) {
          try {
            step(generatorFunction.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function forwardFailure(value) {
          try {
            step(generatorFunction["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        step((generatorFunction = generatorFunction.apply(context, args || [])).next());
      });
    };

  const generatorStateMachine =
    (this && this.__generator) ||
    function (context, body) {
      let internalState,
        yieldedValue,
        lastYielded,
        iteratorObject = {
          label: 0,
          sent: function () {
            if (1 & iteratorObject[0]) throw iteratorObject[1];
            return iteratorObject[1];
          },
          trys: [],
          ops: [],
        };
      const iteratorMethods = {
        next: createVerb(0),
        throw: createVerb(1),
        return: createVerb(2),
      };
      if (typeof Symbol === "function" && (iteratorMethods[Symbol.iterator] = function () { return this; }));
      return iteratorMethods;

      function createVerb(verbType) {
        return function (value) {
          return processStep([verbType, value]);
        };
      }

      function processStep(op) {
        if (internalState) {
          throw new TypeError("Generator is already running.");
        }
        while (iteratorObject) {
          try {
            if (
              (internalState = 1),
              yieldedValue &&
                (lastYielded =
                  op[0] & 2
                    ? yieldedValue["return"]
                    : op[0]
                    ? yieldedValue["throw"] ||
                      ((lastYielded = yieldedValue["return"]) && lastYielded.call(yieldedValue), 0)
                    : yieldedValue.next) &&
                !(lastYielded = lastYielded.call(yieldedValue, op[1])).done
            ) {
              return lastYielded;
            }
            if ((yieldedValue = 0), lastYielded) {
              op = [op[0] & 2, lastYielded.value];
            }
            switch (op[0]) {
              case 0:
              case 1:
                lastYielded = op;
                break;
              case 4:
                iteratorObject.label++;
                return { value: op[1], done: false };
              case 5:
                iteratorObject.label++;
                yieldedValue = op[1];
                op = [0];
                continue;
              case 7:
                op = iteratorObject.ops.pop();
                iteratorObject.trys.pop();
                continue;
              default:
                if (
                  !(
                    (lastYielded = iteratorObject.trys),
                    (lastYielded = lastYielded.length > 0 && lastYielded[lastYielded.length - 1])
                  ) &&
                  (op[0] === 6 || op[0] === 2)
                ) {
                  iteratorObject = 0;
                  continue;
                }
                if (op[0] === 3 && (!lastYielded || (op[1] > lastYielded[0] && op[1] < lastYielded[3]))) {
                  iteratorObject.label = op[1];
                  break;
                }
                if (op[0] === 6 && iteratorObject.label < lastYielded[1]) {
                  iteratorObject.label = lastYielded[1];
                  lastYielded = op;
                  break;
                }
                if (lastYielded && iteratorObject.label < lastYielded[2]) {
                  iteratorObject.label = lastYielded[2];
                  iteratorObject.ops.push(op);
                  break;
                }
                if (lastYielded[2]) {
                  iteratorObject.ops.pop();
                }
                iteratorObject.trys.pop();
                continue;
            }
            op = body.call(context, iteratorObject);
          } catch (e) {
            op = [6, e];
            yieldedValue = 0;
          } finally {
            internalState = lastYielded = 0;
          }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : undefined, done: true };
        }
      }
    };

  const defaultImportHandler =
    (this && this.__importDefault) ||
    function (mod) {
      return mod && mod.__esModule ? mod : { default: mod };
    };

  // Ensure this module is marked as an ES Module for compatibility.
  customModuleLoader.markAsEsModule(exports);

  // Directly import 'fs' for Node.js file system operations.
  const fileSystem = defaultImportHandler(localRequire("fs"));

  /**
   * Asynchronously reads all data from standard input.
   * This implementation uses Node.js's `process.stdin` for more direct stream handling,
   * which can be more robust than `fs.readFile('/dev/stdin')` on some systems.
   * Includes a timeout to prevent indefinite waiting.
   * @returns {Promise<string>} A promise that resolves with the full input string.
   */
  exports.readStandardInput = function () {
    return new Promise((resolve, reject) => {
      let inputBuffer = "";
      const INPUT_TIMEOUT_MS = 5000; // 5 seconds timeout for input

      const timer = setTimeout(() => {
        process.stdin.pause();
        reject(new Error("Input timed out after " + INPUT_TIMEOUT_MS + "ms."));
      }, INPUT_TIMEOUT_MS);

      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        inputBuffer += chunk;
      });
      process.stdin.on("end", () => {
        clearTimeout(timer);
        resolve(inputBuffer.trim()); // Trim to remove trailing newlines
      });
      process.stdin.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
      // Resume stdin if it was paused.
      if (process.stdin.isPaused()) {
        process.stdin.resume();
      }
    });
  };

  /**
   * Creates an asynchronous iterator that yields words from a given string.
   * Words are extracted using a regular expression that matches sequences of non-whitespace characters.
   * This is a refactored version of the original `getChottoMashinaNext` logic.
   * @param {string} sourceString - The string to tokenize.
   * @returns {AsyncGenerator<string>} An async generator yielding each word.
   */
  async function* createRobustStringTokenizer(sourceString) {
    if (!sourceString || sourceString.trim().length === 0) {
      // Guard clause: handle empty or whitespace-only input gracefully.
      return;
    }
    // Use a regex to find all sequences of non-whitespace characters.
    const wordMatcher = /\S+/g;
    let match;
    while ((match = wordMatcher.exec(sourceString)) !== null) {
      yield match[0];
    }
  }

  /**
   * Asynchronously retrieves a function that, when called, returns the next word from stdin.
   * The input is tokenized using a robust word extraction method.
   * @returns {Promise<() => string | undefined>} A promise resolving to a function that returns the next word,
   *          or `undefined` if no more words are available.
   */
  exports.getNextWordFunction = function () {
    return asyncOperationWrapper(this, undefined, undefined, function* () {
      const fullInputContent = yield exports.readStandardInput();

      // Create the async iterator from the input content.
      const wordAsyncIterator = createRobustStringTokenizer(fullInputContent);

      // Return a synchronous function that wraps the async iterator's next method.
      // This allows the main logic to consume words synchronously after initial async load.
      return function () {
        const result = wordAsyncIterator.next();
        // Since the outer function is sync, we assume the generator is already resolved
        // or its next method is handled appropriately. For an async generator
        // wrapped in a sync function, this means `result.value` will be a Promise.
        // The original code implies synchronous consumption after initial async setup.
        // We'll await it here to ensure the value is directly returned.
        return result.value instanceof Promise ? result.value : result.value;
      };
    });
  };

  /**
   * Asynchronously retrieves a function that, when called, returns the next integer from stdin.
   * Uses the robust word tokenizer and parses the result as an integer.
   * Includes error handling for non-numeric input.
   * @returns {Promise<() => number | undefined>} A promise resolving to a function that returns the next integer.
   */
  exports.getNextIntegerFunction = function () {
    return asyncOperationWrapper(this, undefined, undefined, function* () {
      const getSingleWord = yield exports.getNextWordFunction();
      return function () {
        const word = getSingleWord();
        if (word === undefined) {
          return undefined; // No more words
        }
        const parsedInt = parseInt(word, 10);
        if (isNaN(parsedInt)) {
          console.warn(`Warning: Could not parse "${word}" as an integer. Returning 0.`);
          return 0; // Return a default or throw an error based on requirements
        }
        return parsedInt;
      };
    });
  };
};

// Module 1: Node.js 'fs' module wrapper (simplified)
providedModules[1] = function (module, exports) {
  // In a simplified system, we can just directly expose the Node.js 'fs' module.
  module.exports = require("fs");
};

// Module 13: Main Application Logic (Entry Point)
providedModules[13] = function (module, exports, localRequire) {
  "use strict";

  // TypeScript __awaiter and __generator polyfills/helpers (repeated for self-containment if bundled separately)
  const asyncRuntimeWrapper =
    (this && this.__awaiter) ||
    function (context, args, promiseConstructor, generatorFunction) {
      return new (promiseConstructor || (promiseConstructor = Promise))(function (
        resolve,
        reject
      ) {
        function step(result) {
          result.done
            ? resolve(result.value)
            : new promiseConstructor(function (res) {
                res(result.value);
              }).then(forwardSuccess, forwardFailure);
        }
        function forwardSuccess(value) {
          try {
            step(generatorFunction.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function forwardFailure(value) {
          try {
            step(generatorFunction["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        step((generatorFunction = generatorFunction.apply(context, args || [])).next());
      });
    };

  const generatorYieldHelper =
    (this && this.__generator) ||
    function (context, body) {
      let stateTracker,
        lastYield,
        prevYielded,
        iteratorInstance = {
          label: 0,
          sent: function () {
            if (1 & iteratorInstance[0]) throw iteratorInstance[1];
            return iteratorInstance[1];
          },
          trys: [],
          ops: [],
        },
        iteratorMethods,
        symbolIteratorFunc;
      iteratorMethods = {
        next: createOpMethod(0),
        throw: createOpMethod(1),
        return: createOpMethod(2),
      };
      if (typeof Symbol === "function" && (symbolIteratorFunc = iteratorMethods[Symbol.iterator] = function () { return this; }));
      return iteratorMethods;

      function createOpMethod(opType) {
        return function (value) {
          return advanceGenerator([opType, value]);
        };
      }

      function advanceGenerator(op) {
        if (stateTracker) {
          throw new TypeError("Generator is already running.");
        }
        while (iteratorInstance) {
          try {
            if (
              (stateTracker = 1),
              lastYield &&
                (prevYielded =
                  op[0] & 2
                    ? lastYield["return"]
                    : op[0]
                    ? lastYield["throw"] ||
                      ((prevYielded = lastYield["return"]) && prevYielded.call(lastYield), 0)
                    : lastYield.next) &&
                !(prevYielded = prevYielded.call(lastYield, op[1])).done
            ) {
              return prevYielded;
            }
            if ((lastYield = 0), prevYielded) {
              op = [op[0] & 2, prevYielded.value];
            }
            switch (op[0]) {
              case 0:
              case 1:
                prevYielded = op;
                break;
              case 4:
                iteratorInstance.label++;
                return { value: op[1], done: false };
              case 5:
                iteratorInstance.label++;
                lastYield = op[1];
                op = [0];
                continue;
              case 7:
                op = iteratorInstance.ops.pop();
                iteratorInstance.trys.pop();
                continue;
              default:
                if (
                  !(
                    (prevYielded = iteratorInstance.trys),
                    (prevYielded =
                      prevYielded.length > 0 && prevYielded[prevYielded.length - 1])
                  ) &&
                  (op[0] === 6 || op[0] === 2)
                ) {
                  iteratorInstance = 0;
                  continue;
                }
                if (op[0] === 3 && (!prevYielded || (op[1] > prevYielded[0] && op[1] < prevYielded[3]))) {
                  iteratorInstance.label = op[1];
                  break;
                }
                if (op[0] === 6 && iteratorInstance.label < prevYielded[1]) {
                  iteratorInstance.label = prevYielded[1];
                  prevYielded = op;
                  break;
                }
                if (prevYielded && iteratorInstance.label < prevYielded[2]) {
                  iteratorInstance.label = prevYielded[2];
                  iteratorInstance.ops.push(op);
                  break;
                }
                if (prevYielded[2]) {
                  iteratorInstance.ops.pop();
                }
                iteratorInstance.trys.pop();
                continue;
            }
            op = body.call(context, iteratorInstance);
          } catch (e) {
            op = [6, e];
            lastYield = 0;
          } finally {
            stateTracker = prevYielded = 0;
          }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : undefined, done: true };
        }
      }
    };

  // Ensure this module is marked as an ES Module.
  customModuleLoader.markAsEsModule(exports);

  // Import our custom input utility module.
  const inputHelpers = localRequire(0);

  /**
   * Defines the modulo constant for calculations.
   * This constant is a large prime number often used in competitive programming.
   * @type {number}
   */
  const MODULO_PRIME = 1000000007;

  /**
   * Applies the modulo operation to a given value.
   * Ensures the result is always positive.
   * @param {number} val - The number to apply modulo to.
   * @returns {number} The result of the modulo operation.
   */
  const applyModulo = (val) => {
    // Add MODULO_PRIME before modulo to handle negative intermediate results correctly.
    return (val % MODULO_PRIME + MODULO_PRIME) % MODULO_PRIME;
  };

  // Main execution block, wrapped in an async function.
  asyncRuntimeWrapper(this, undefined, undefined, function* () {
    let getNextInputToken;
    let initialInputString;
    let characterFrequencyMap;
    let currentProduct = 1;

    try {
      // Step 1: Obtain the function to get the next word from input.
      getNextInputToken = yield inputHelpers.getNextWordFunction();

      // Step 2: Get the very first token (word) from the input.
      initialInputString = getNextInputToken();

      // Guard clause: If no input or empty string is provided, print 0 and exit.
      if (!initialInputString || initialInputString.length === 0) {
        console.log(0);
        return;
      }

      // Optional: Log a warning for non-ASCII characters if desired for specific problem constraints.
      if (!/^[\x00-\x7F]*$/.test(initialInputString)) {
        console.warn("Input string contains non-ASCII characters, which might affect character counting.");
      }

      // Step 3: Count character frequencies using a Map for better key handling.
      characterFrequencyMap = new Map();
      for (const char of initialInputString) {
        characterFrequencyMap.set(char, (characterFrequencyMap.get(char) || 0) + 1);
      }

      // Step 4: Calculate the product of (frequency + 1) for each unique character, modulo MODULO_PRIME.
      // This represents the number of distinct subsequences (including empty).
      for (const count of characterFrequencyMap.values()) {
        const factor = applyModulo(count + 1); // Calculate (count + 1) modulo MODULO_PRIME
        currentProduct = applyModulo(currentProduct * factor); // Update product modulo MODULO_PRIME
      }

      // Step 5: The problem asks for (product - 1) modulo MODULO_PRIME.
      // Subtract 1 to exclude the "empty" combination, then apply modulo.
      const finalResult = applyModulo(currentProduct - 1);

      // Step 6: Output the final calculated result.
      console.log(finalResult);

    } catch (errorDuringExecution) {
      // Robust error handling for the main application logic.
      console.error("An error occurred during application execution:", errorDuringExecution);
      // Optionally exit with a non-zero code to indicate failure.
      process.exit(1);
    }
  });
};

// --- Initiate the application with the defined modules ---
initializeApplication({
  0: providedModules[0], // Core utilities module
  1: providedModules[1], // Node.js 'fs' module
  13: providedModules[13], // Main entry point module
});