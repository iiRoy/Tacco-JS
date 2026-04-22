/* This file contains a bundled JavaScript application.
 * It processes numerical input to solve a problem involving products of numbers.
 * Original source: atcoder/abc155/d
 * More details: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 */
!function(moduleDefinitions){ // Array of module definitions, each containing a function for a module.
  var moduleCache = {}; // Cache for storing already loaded modules.

  // Custom module loading function, similar to `require`.
  function moduleLoader(moduleId) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not in cache, create a new module entry and store it.
    var moduleEntry = moduleCache[moduleId] = {
      id: moduleId,          // The unique identifier for this module.
      initialized: false,    // Flag to track if the module has been executed.
      exports: {}            // The exports object for this module.
    };

    // Execute the module's definition function.
    // It receives the module entry, its exports object, and the moduleLoader itself.
    moduleDefinitions[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, moduleLoader);

    // Mark the module as initialized after execution.
    moduleEntry.initialized = true;
    return moduleEntry.exports;
  }

  // Attach internal properties to the module loader for Webpack compatibility.
  moduleLoader.definitions = moduleDefinitions;
  moduleLoader.cache = moduleCache;

  // Defines a getter property on an object if it doesn't already exist.
  moduleLoader.defineExport = function(targetObject, propertyKey, getterFunction) {
    if (!moduleLoader.hasOwn(targetObject, propertyKey)) {
      Object.defineProperty(targetObject, propertyKey, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  // Sets up __esModule flag and Symbol.toStringTag for ES module interop.
  moduleLoader.registerEsModule = function(targetObject) {
    if ("undefined" !== typeof Symbol && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(targetObject, "__esModule", { value: true });
  };

  // Retrieves module exports, handling default exports and namespace objects.
  moduleLoader.getModuleExport = function(incomingModule, exportFlags) {
    // If flag 1 is set, it means the module ID was passed, so load it.
    if (1 & exportFlags) incomingModule = moduleLoader(incomingModule);

    // If flag 8 is set, it's already a namespace object.
    if (8 & exportFlags) return incomingModule;

    // If flag 4 is set and it's an object that's already an ES module.
    if (4 & exportFlags && "object" === typeof incomingModule && incomingModule && incomingModule.__esModule) return incomingModule;

    // Create a new object for the default export.
    var defaultExportObject = Object.create(null);
    moduleLoader.registerEsModule(defaultExportObject);
    Object.defineProperty(defaultExportObject, "default", { enumerable: true, value: incomingModule });

    // If flag 2 is set and it's not a string, iterate and define exports.
    if (2 & exportFlags && "string" !== typeof incomingModule) {
      for (var key in incomingModule) {
        moduleLoader.defineExport(defaultExportObject, key, (function(currentKey) {
          return incomingModule[currentKey];
        }).bind(null, key));
      }
    }
    return defaultExportObject;
  };

  // Creates a getter function for the default export of a module.
  moduleLoader.createDefaultGetter = function(moduleContents) {
    var defaultGetter = moduleContents && moduleContents.__esModule ?
      function() { return moduleContents.default; } :
      function() { return moduleContents; };
    moduleLoader.defineExport(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  // Checks if an object has a specified property directly.
  moduleLoader.hasOwn = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  // Public path for assets, typically empty in this setup.
  moduleLoader.publicPath = "";

  // Set the entry point module and execute it.
  moduleLoader(moduleLoader.entryPoint = 0);
}([
  // --- Module 0: Main Application Logic ---
  function(exportsObj, moduleInfo, localRequire) {
    "use strict";
    // Helper function to correctly import default exports from ES modules or commonjs modules.
    var importDefaultHelper = this && this.__importDefault || function(sourceModule) {
      return sourceModule && sourceModule.__esModule ? sourceModule : { default: sourceModule };
    };

    moduleInfo.__esModule = true; // Mark this module as an ES module.

    // Import the Node.js file system module for I/O operations.
    var fileSystemModule = importDefaultHelper(localRequire(1));
    // Import the primary computation engine (Solver class).
    var computationEngine = localRequire(2);

    // Read input from the standard input stream (/dev/stdin) asynchronously.
    fileSystemModule.default.readFile("/dev/stdin", "utf8", (function(readError, inputDataString) {
      // The `readError` parameter is ignored, consistent with the original code's behavior.

      // Define and immediately execute a function to process the input.
      (function(inputContent) {
        var processorInstance = new computationEngine.Solver(); // Create an instance of the solver.
        var parsedInput = processorInstance.parse(inputContent); // Parse the raw string input into structured data.
        var calculatedResult = processorInstance.solve(parsedInput); // Execute the main problem-solving logic.
        processorInstance.print(calculatedResult); // Output the final computed result.
      })(inputDataString); // Pass the raw input string to the processing function.
    }));
  },
  // --- Module 1: Node.js File System Module Export ---
  function(exportsObj, moduleInfo) {
    exportsObj.exports = require("fs"); // Simply exports the built-in 'fs' module.
  },
  // --- Module 2: Solver Implementation ---
  function(exportsObj, moduleInfo, localRequire) {
    "use strict";
    // Helper function for handling class inheritance in JavaScript, compatible with ES5+.
    var baseClassExtender = this && this.__extends || (function() {
      // Internal utility to manage prototype chain for derived classes.
      var inheritanceUtility = function(derived, base) {
        // Use Object.setPrototypeOf if available (ES6+), otherwise fallback to older methods.
        return (inheritanceUtility = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function(derived, base) { derived.__proto__ = base; }) ||
          function(derived, base) {
            for (var prop in base) {
              if (base.hasOwnProperty(prop)) derived[prop] = base[prop];
            }
          })(derived, base);
      };
      return function(derived, base) {
        // Set up a temporary constructor to correctly link prototypes for inheritance.
        function TmpCtor() { this.constructor = derived; }
        inheritanceUtility(derived, base);
        derived.prototype = base === null ? Object.create(base) : (TmpCtor.prototype = base.prototype, new TmpCtor());
      };
    })();

    // Another helper for importing default exports, ensures consistency.
    var importModuleDefault = this && this.__importDefault || function(sourceModule) {
      return sourceModule && sourceModule.__esModule ? sourceModule : { default: sourceModule };
    };

    moduleInfo.__esModule = true; // Mark this module as an ES module.

    // Import the abstract base class that defines common solver interface.
    var abstractProcessor = localRequire(3);
    // Import the utility function for parsing space-separated numeric input.
    var tokenStreamGenerator = localRequire(4);
    // Import the BigNumber library for arbitrary-precision integer arithmetic.
    var bigNumberLibrary = importModuleDefault(localRequire(5));

    // Define the main CalculationProcessor class, inheriting from AbstractProcessor.SolverBase.
    var CalculationProcessor = (function(ancestorProcessor) {
      baseClassExtender(CalculationProcessor, ancestorProcessor); // Establish inheritance.

      function CalculationProcessor() {
        // Call the constructor of the parent class.
        return ancestorProcessor !== null && ancestorProcessor.apply(this, arguments) || this;
      }

      // --- The core problem-solving logic ---
      CalculationProcessor.prototype.solve = function(problemData) {
        var elementCount = problemData.N; // The total number of elements in the array.
        var targetRank = problemData.K; // The K-th smallest product to find.
        var numberArray = problemData.A; // The input array of integers.

        // Sort the input array in ascending numerical order.
        numberArray.sort((function(valA, valB) {
          return valA - valB;
        }));

        // Convert all numbers in the array to BigNumber objects for precise calculations.
        var bigNumberArray = new Array(elementCount);
        for (var idx = 0; idx < elementCount; idx++) {
          bigNumberArray[idx] = bigNumberLibrary.default.fromNumber(numberArray[idx]);
        }

        // Count the number of negative, positive, and zero elements.
        var negativeCount = 0;
        var positiveCount = 0;
        var zeroCount = 0;
        for (idx = 0; idx < elementCount; idx++) {
          if (numberArray[idx] < 0) {
            negativeCount++;
          } else if (numberArray[idx] > 0) {
            positiveCount++;
          } else {
            zeroCount++;
          }
        }

        // Calculate initial counts of products based on number signs.
        // `crossProductPairs`: Number of pairs where one element is negative and one is positive (always results in a negative product).
        var crossProductPairs = negativeCount * positiveCount;
        // `zeroProductPairs`: Number of pairs that include at least one zero (always results in a zero product).
        // This includes (zero * positive), (zero * negative), and (zero * zero).
        var zeroProductPairs = zeroCount * (positiveCount + negativeCount) + zeroCount * (zeroCount - 1) / 2;

        // BigNumber constants used in the binary search.
        var twoVal = bigNumberLibrary.default.fromNumber(2);
        var lowerBound = bigNumberLibrary.default.fromString("-1000000000000000005"); // A sufficiently small lower bound for the product.
        var upperBound = bigNumberLibrary.default.fromString("1000000000000000005"); // A sufficiently large upper bound for the product.

        // Perform binary search on the range of possible product values.
        // The loop continues as long as the search range is greater than 1.
        while (upperBound.subtract(lowerBound).isGreaterThan(bigNumberLibrary.default.ONE_VAL)) {
          var midValue = upperBound.add(lowerBound).divideBy(twoVal); // Calculate the midpoint of the current range.
          var currentPairCount = 0; // This variable will store the count of products less than or equal to `midValue`.

          // Case 1: The midpoint is negative.
          // We are primarily counting negative products.
          if (midValue.isLessThan(bigNumberLibrary.default.ZERO_VAL)) {
            var innerCount = 0;
            // Iterate through the numbers.
            for (idx = 0; idx < elementCount && !(numberArray[idx] >= 0); idx++) {
              if (idx > 0 && numberArray[idx] === numberArray[idx - 1]) {
                // If the current number is a duplicate of the previous, reuse the count from the previous iteration to optimize.
                currentPairCount += innerCount;
              } else {
                // For each `numberArray[idx]`, find how many `numberArray[midIndex]` (from the positive part of the array)
                // satisfy `numberArray[idx] * numberArray[midIndex] < midValue`.
                var leftPointer = negativeCount + zeroCount - 1; // Starting pointer for binary search in the remaining part of array.
                var rightPointer = elementCount; // Ending pointer for binary search.
                while (rightPointer - leftPointer > 1) {
                  var midIndex = (leftPointer + rightPointer) / 2 | 0;
                  if (bigNumberArray[idx].multiplyBy(bigNumberArray[midIndex]).isLessThan(midValue)) {
                    rightPointer = midIndex; // Move right pointer left if product is too small.
                  } else {
                    leftPointer = midIndex; // Move left pointer right if product is too large or equal.
                  }
                }
                innerCount = elementCount - rightPointer; // Count of elements that satisfy the condition for current numberArray[idx].
                currentPairCount += elementCount - rightPointer;
              }
            }
          }
          // Case 2: The midpoint is positive.
          // We must count all negative products, all zero products, and then positive products less than or equal to `midValue`.
          else if (midValue.isGreaterThan(bigNumberLibrary.default.ZERO_VAL)) {
            currentPairCount += crossProductPairs + zeroProductPairs; // Add all negative and zero products first.
            innerCount = 0;
            // Iterate through all numbers to find positive products.
            for (idx = 0; idx < elementCount; idx++) {
              if (0 !== numberArray[idx]) { // Skip zero elements as their products are already counted.
                if (idx > 0 && numberArray[idx] === numberArray[idx - 1]) {
                  // Handle duplicates.
                  currentPairCount += innerCount;
                } else if (numberArray[idx] < 0) {
                  // For a negative number, we need to multiply it by another negative number to get a positive product.
                  // Search among negative numbers to the right of current `idx`.
                  var leftPointer = idx;
                  var rightPointer = negativeCount;
                  while (rightPointer - leftPointer > 1) {
                    var midIndex = (leftPointer + rightPointer) / 2 | 0;
                    if (bigNumberArray[idx].multiplyBy(bigNumberArray[midIndex]).isLessThan(midValue)) {
                      rightPointer = midIndex;
                    } else {
                      leftPointer = midIndex;
                    }
                  }
                  innerCount = negativeCount - rightPointer;
                  currentPairCount += negativeCount - rightPointer;
                } else if (numberArray[idx] > 0) {
                  // For a positive number, we need to multiply it by another positive number to get a positive product.
                  // Search among positive numbers to the right of current `idx`.
                  var leftPointer = idx;
                  var rightPointer = elementCount;
                  while (rightPointer - leftPointer > 1) {
                    var midIndex = (leftPointer + rightPointer) / 2 | 0;
                    if (bigNumberArray[idx].multiplyBy(bigNumberArray[midIndex]).isLessThan(midValue)) {
                      leftPointer = midIndex;
                    } else {
                      rightPointer = midIndex;
                    }
                  }
                  innerCount = leftPointer - idx; // Count of elements that satisfy the condition.
                  currentPairCount += leftPointer - idx;
                }
              }
            }
          }
          // Case 3: The midpoint is zero.
          // All negative products and all zero products are less than or equal to zero.
          else {
            currentPairCount = crossProductPairs + zeroProductPairs;
          }

          // Adjust the binary search bounds based on the `currentPairCount`.
          if (currentPairCount < targetRank) {
            lowerBound = midValue; // If too few products are less than or equal to `midValue`, we need to search for a larger product.
          } else {
            upperBound = midValue; // Otherwise, `midValue` is a possible candidate or we need to search for a smaller product.
          }
        }
        return { answer: lowerBound }; // The K-th smallest product is found.
      };

      // --- Input Parsing Method ---
      CalculationProcessor.prototype.parse = function(rawDataString) {
        // Obtain an iterator that yields space-separated integers from the input string.
        var dataIterator = tokenStreamGenerator.getSpaceIterator(rawDataString, (function(token) {
          return parseInt(token); // Use parseInt to convert each string token to an integer.
        }));

        var totalElements = dataIterator.next().value; // The first value is N (total number of elements).
        var targetOrder = dataIterator.next().value; // The second value is K (the rank of the product to find).

        // Read the array of numbers A.
        var parsedValues = new Array(totalElements);
        for (var idx = 0; idx < totalElements; idx++) {
          parsedValues[idx] = dataIterator.next().value;
        }

        return { N: totalElements, K: targetOrder, A: parsedValues }; // Return parsed data as an object.
      };

      // --- Output Printing Method ---
      CalculationProcessor.prototype.print = function(finalResult) {
        console.log(finalResult.answer.toRadixString()); // Output the final answer to the console.
      };

      return CalculationProcessor;
    })(abstractProcessor.SolverBase); // Inherit from SolverBase.

    exportsObj.Solver = CalculationProcessor; // Export the CalculationProcessor class as Solver.
  },
  // --- Module 3: Abstract Base Solver ---
  function(exportsObj, moduleInfo) {
    moduleInfo.__esModule = true; // Mark this module as an ES module.
    // Defines a simple, empty base class that other specific solver classes can extend.
    var baseHandler = function() {};
    exportsObj.SolverBase = baseHandler; // Export the base class.
  },
  // --- Module 4: Space Separated Input Iterator ---
  function(exportsObj, moduleInfo) {
    "use strict";
    // Helper function for transpiling generator functions to ES5 compatible code.
    var generatorCreator = this && this.__generator || function(thisArg, body) {
      var _ = { label: 0, sent: function() { if (1 & _[0]) throw _[1]; return _[1]; }, trys: [], ops: [] }, f, y, t, g;
      return (g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g);

      function verb(n) { return function(v) { return step([n, v]); }; };

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0: case 1: t = op; break;
            case 4: _.label++; return { value: op[1], done: false };
            case 5: _.label++; y = op[1]; op = [0]; continue;
            case 7: op = _.ops.pop(); _.trys.pop(); continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
              if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
              if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
              if (t[2]) _.ops.pop();
              _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
    };

    moduleInfo.__esModule = true; // Mark this module as an ES module.

    // Function to create a generator that iterates over space-separated tokens from a string.
    exportsObj.getSpaceIterator = function(sourceText, conversionFunc) {
      var currentIndex, processedTokens;
      return generatorCreator(this, (function(_a) {
        switch (_a.label) {
          case 0:
            currentIndex = 0;
            // Split the input string by one or more whitespace characters and map each token using the provided conversion function.
            processedTokens = sourceText.split(/\s+/).map((function(token) {
              return conversionFunc(token);
            }));
            _a.label = 1;
          case 1:
            // Loop through the processed tokens, yielding each one.
            return currentIndex < processedTokens.length ? [4, processedTokens[currentIndex]] : [3, 4];
          case 2:
            _a.sent(); // The yielded value (current token) is consumed.
            _a.label = 3;
          case 3:
            currentIndex++; // Move to the next token.
            return [3, 1];
          case 4:
            return [2, void 0]; // All tokens have been processed, generator is done.
        }
      }));
    };
  },
  // --- Module 5: BigNumber (long.js) Implementation ---
  function(exportsObj, moduleInfo) {
    // Export the BigIntegerType constructor.
    exportsObj.exports = BigIntegerType;
    var wasmInstance = null; // Variable to hold the WebAssembly instance for arithmetic.

    // Attempt to load a WebAssembly optimized version of arithmetic operations.
    try {
      wasmInstance = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
    } catch (e) {
      // If WebAssembly fails (e.g., not supported), fall back to pure JavaScript implementation.
      wasmInstance = null;
    }

    // BigIntegerType constructor: Represents a 64-bit integer using two 32-bit components.
    function BigIntegerType(lowBits, highBits, isUnsigned) {
      this.low = lowBits | 0;    // Low 32 bits (signed).
      this.high = highBits | 0;  // High 32 bits (signed).
      this.unsigned = !!isUnsigned; // True for unsigned, false for signed.
    }

    // Helper function to check if a given value is an instance of BigIntegerType.
    function isBigNumInstance(value) {
      return true === (value && value.__isBigIntegerType__);
    }

    BigIntegerType.prototype.__isBigIntegerType__; // Property to identify BigIntegerType instances.
    Object.defineProperty(BigIntegerType.prototype, "__isBigIntegerType__", { value: true });
    BigIntegerType.isBigNum = isBigNumInstance; // Static method to check instance type.

    // Caches for frequently used small integer BigIntegerType objects to improve performance.
    var smallNumCache = {}; // Cache for signed integers.
    var unsignedCache = {}; // Cache for unsigned integers.

    // Creates a BigIntegerType instance from a native JavaScript integer.
    function fromInteger(intValue, isUnsigned) {
      var num, cached;
      var isSmall = false;

      if (isUnsigned) {
        // For unsigned numbers, cache if within [0, 255].
        isSmall = (0 <= (intValue >>>= 0) && intValue < 256);
        cached = isSmall && unsignedCache[intValue];
        if (cached) return cached;
        num = fromComponents(intValue, (0 | intValue) < 0 ? -1 : 0, true);
        if (isSmall) unsignedCache[intValue] = num;
        return num;
      } else {
        // For signed numbers, cache if within [-128, 127].
        isSmall = (-128 <= (intValue |= 0) && intValue < 128);
        cached = isSmall && smallNumCache[intValue];
        if (cached) return cached;
        num = fromComponents(intValue, intValue < 0 ? -1 : 0, false);
        if (isSmall) smallNumCache[intValue] = num;
        return num;
      }
    }

    // Creates a BigIntegerType instance from a native JavaScript number.
    // Note: JavaScript numbers are 64-bit floats, so precision may be lost for very large integers.
    function fromDecimal(numValue, isUnsigned) {
      if (isNaN(numValue)) return isUnsigned ? UNSIGNED_ZERO_VAL : ZERO_VAL;

      if (isUnsigned) {
        if (numValue < 0) return UNSIGNED_ZERO_VAL; // Unsigned numbers cannot be negative.
        if (numValue >= UINT64_MAX_PLUS_1) return MAX_UNSIGNED_VAL; // Exceeds maximum unsigned 64-bit value.
      } else {
        if (numValue <= -MIN_SIGNED_VAL_NUM) return MIN_SIGNED_VAL; // Below minimum signed 64-bit value.
        if (numValue + 1 >= MIN_SIGNED_VAL_NUM) return MAX_SIGNED_VAL; // Above maximum signed 64-bit value.
      }
      // Handle negative numbers by converting the positive equivalent and then negating.
      return numValue < 0 ? fromDecimal(-numValue, isUnsigned).negate() :
        fromComponents(numValue % UINT32_MAX_PLUS_1 | 0, numValue / UINT32_MAX_PLUS_1 | 0, isUnsigned);
    }

    // Creates a BigIntegerType instance directly from its low and high 32-bit components.
    function fromComponents(lowBits, highBits, isUnsigned) {
      return new BigIntegerType(lowBits, highBits, isUnsigned);
    }

    // Static methods for BigIntegerType.
    BigIntegerType.fromInteger = fromInteger;
    BigIntegerType.fromDecimal = fromDecimal;
    BigIntegerType.fromComponents = fromComponents;

    var powerFunction = Math.pow; // Alias for Math.pow for consistent naming.

    // Creates a BigIntegerType instance from a string representation in a given radix.
    function fromText(textString, isUnsigned, radix) {
      if (textString.length === 0) throw Error("empty string");
      if ("NaN" === textString || "Infinity" === textString || "+Infinity" === textString || "-Infinity" === textString) return ZERO_VAL;

      // Handle optional `radix` parameter being passed as the second argument.
      if (typeof isUnsigned === "number") {
        radix = isUnsigned;
        isUnsigned = false;
      } else {
        isUnsigned = !!isUnsigned;
      }

      radix = radix || 10; // Default radix is 10.
      if (radix < 2 || radix > 36) throw RangeError("radix"); // Radix must be between 2 and 36.

      var hyphenIndex;
      if ((hyphenIndex = textString.indexOf("-")) > 0) throw Error("interior hyphen"); // Hyphen only allowed at the beginning.
      if (hyphenIndex === 0) return fromText(textString.substring(1), isUnsigned, radix).negate(); // Handle negative strings.

      // Process the string in chunks of 8 digits (radix^8) for efficiency.
      var eightDigitPower = fromDecimal(powerFunction(radix, 8));
      var currentBigNum = ZERO_VAL;

      for (var charIndex = 0; charIndex < textString.length; charIndex += 8) {
        var chunkLength = Math.min(8, textString.length - charIndex);
        var chunkValue = parseInt(textString.substring(charIndex, charIndex + chunkLength), radix);

        if (chunkLength < 8) {
          // If the last chunk is smaller than 8 digits, multiply by radix^chunkLength.
          var chunkPower = fromDecimal(powerFunction(radix, chunkLength));
          currentBigNum = currentBigNum.multiplyBy(chunkPower).add(fromDecimal(chunkValue));
        } else {
          // For full 8-digit chunks, multiply by radix^8.
          currentBigNum = (currentBigNum.multiplyBy(eightDigitPower)).add(fromDecimal(chunkValue));
        }
      }
      currentBigNum.unsigned = isUnsigned; // Set the unsigned flag.
      return currentBigNum;
    }

    // Creates a BigIntegerType instance from various input types (number, string, or existing BigIntegerType).
    function fromAnyValue(value, isUnsigned) {
      if (typeof value === "number") return fromDecimal(value, isUnsigned);
      if (typeof value === "string") return fromText(value, isUnsigned);
      // Assume it's already a BigIntegerType-like object.
      return fromComponents(value.low, value.high, typeof isUnsigned === "boolean" ? isUnsigned : value.unsigned);
    }

    BigIntegerType.fromText = fromText;
    BigIntegerType.fromAnyValue = fromAnyValue;

    // Numerical constants for 64-bit arithmetic.
    var UINT32_MAX_PLUS_1 = 4294967296; // 2^32
    var UINT64_MAX_PLUS_1 = UINT32_MAX_PLUS_1 * UINT32_MAX_PLUS_1; // 2^64
    var MIN_SIGNED_VAL_NUM = UINT64_MAX_PLUS_1 / 2; // Absolute value of -2^63.
    var SMALL_INT_THRESHOLD = fromInteger(1 << 24); // Threshold for optimizing small number operations.

    // Pre-defined BigIntegerType constants for common values.
    var ZERO_VAL = fromInteger(0);
    BigIntegerType.ZERO_VAL = ZERO_VAL;
    var UNSIGNED_ZERO_VAL = fromInteger(0, true);
    BigIntegerType.UNSIGNED_ZERO_VAL = UNSIGNED_ZERO_VAL;
    var ONE_VAL = fromInteger(1);
    BigIntegerType.ONE_VAL = ONE_VAL;
    var UNSIGNED_ONE_VAL = fromInteger(1, true);
    BigIntegerType.UNSIGNED_ONE_VAL = UNSIGNED_ONE_VAL;
    var NEGATIVE_ONE_VAL = fromInteger(-1);
    BigIntegerType.NEGATIVE_ONE_VAL = NEGATIVE_ONE_VAL;

    // Max and Min values for signed and unsigned 64-bit integers.
    var MAX_SIGNED_VAL = fromComponents(-1, 2147483647, false); // 2^63 - 1
    BigIntegerType.MAX_SIGNED_VAL = MAX_SIGNED_VAL;
    var MAX_UNSIGNED_VAL = fromComponents(-1, -1, true); // 2^64 - 1
    BigIntegerType.MAX_UNSIGNED_VAL = MAX_UNSIGNED_VAL;
    var MIN_SIGNED_VAL = fromComponents(0, -2147483648, false); // -2^63
    BigIntegerType.MIN_SIGNED_VAL = MIN_SIGNED_VAL;

    // Alias for BigIntegerType.prototype to shorten code.
    var protoMethods = BigIntegerType.prototype;

    // Convert to a native 32-bit JavaScript integer.
    protoMethods.toNativeInt = function() {
      return this.unsigned ? this.low >>> 0 : this.low;
    };
    // Convert to a native JavaScript number (might lose precision for values > 2^53).
    protoMethods.toNativeNumber = function() {
      return this.unsigned ? (this.high >>> 0) * UINT32_MAX_PLUS_1 + (this.low >>> 0) : this.high * UINT32_MAX_PLUS_1 + (this.low >>> 0);
    };
    // Convert to a string representation with an optional radix (base).
    protoMethods.toRadixString = function(radix) {
      radix = radix || 10;
      if (radix < 2 || radix > 36) throw RangeError("radix");
      if (this.isZeroValue()) return "0";
      if (this.isNegativeValue()) {
        // Special handling for MIN_SIGNED_VAL due to its asymmetric nature (-2^63 has no positive equivalent).
        if (this.equalsValue(MIN_SIGNED_VAL)) {
          var radNum = fromDecimal(radix);
          var quotient = this.divideBy(radNum);
          var remainder = quotient.multiplyBy(radNum).subtract(this);
          return quotient.toRadixString(radix) + remainder.toNativeInt().toString(radix);
        }
        return "-" + this.negate().toRadixString(radix);
      }

      // Use a base of radix^6 for efficient string conversion (processes 6 digits at a time).
      var baseSixPower = fromDecimal(powerFunction(radix, 6), this.unsigned);
      var currentVal = this;
      var resultString = "";
      for (;;) {
        var divisionResult = currentVal.divideBy(baseSixPower);
        var chunkDigits = (currentVal.subtract(divisionResult.multiplyBy(baseSixPower)).toNativeInt() >>> 0).toString(radix);
        currentVal = divisionResult;
        if (currentVal.isZeroValue()) {
          return chunkDigits + resultString;
        }
        // Pad chunk with leading zeros if necessary.
        while (chunkDigits.length < 6) chunkDigits = "0" + chunkDigits;
        resultString = "" + chunkDigits + resultString;
      }
    };
    // Get the raw high 32 bits.
    protoMethods.getHighPart = function() { return this.high; };
    // Get the high 32 bits interpreted as unsigned.
    protoMethods.getUnsignedHighPart = function() { return this.high >>> 0; };
    // Get the raw low 32 bits.
    protoMethods.getLowPart = function() { return this.low; };
    // Get the low 32 bits interpreted as unsigned.
    protoMethods.getUnsignedLowPart = function() { return this.low >>> 0; };
    // Get the number of bits required to represent the absolute value of this BigIntegerType.
    protoMethods.getAbsoluteBitLength = function() {
      if (this.isNegativeValue()) {
        return this.equalsValue(MIN_SIGNED_VAL) ? 64 : this.negate().getAbsoluteBitLength();
      }
      var tempVal = this.high !== 0 ? this.high : this.low;
      var bitCount = 31;
      while (bitCount > 0 && (tempVal & (1 << bitCount)) === 0) bitCount--;
      return this.high !== 0 ? bitCount + 33 : bitCount + 1;
    };

    // Predicate methods (boolean checks).
    protoMethods.isZeroValue = function() { return this.high === 0 && this.low === 0; };
    protoMethods.isZero = protoMethods.isZeroValue; // Alias.
    protoMethods.isNegativeValue = function() { return !this.unsigned && this.high < 0; };
    protoMethods.isPositiveValue = function() { return this.unsigned || this.high >= 0; };
    protoMethods.isOddValue = function() { return (1 & this.low) === 1; };
    protoMethods.isEvenValue = function() { return (1 & this.low) === 0; };

    // Equality check.
    protoMethods.equalsValue = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      // Compare unsigned flags and then high/low bits.
      // The (this.high >>> 31) !== 1 check helps to correctly compare signed/unsigned numbers
      // that might have the same bit pattern but different interpretations.
      return (this.unsigned === other.unsigned || (this.high >>> 31) !== 1 || (other.high >>> 31) !== 1) &&
             (this.high === other.high && this.low === other.low);
    };
    protoMethods.eq = protoMethods.equalsValue; // Alias for equalsValue.
    protoMethods.notEqualsValue = function(other) { return !this.equalsValue(other); };
    protoMethods.neq = protoMethods.notEqualsValue; // Alias for notEqualsValue.
    protoMethods.ne = protoMethods.notEqualsValue; // Another alias.

    // Comparison methods.
    protoMethods.isLessThan = function(other) { return this.compareWith(other) < 0; };
    protoMethods.lt = protoMethods.isLessThan; // Alias.
    protoMethods.isLessThanOrEqual = function(other) { return this.compareWith(other) <= 0; };
    protoMethods.lte = protoMethods.isLessThanOrEqual; // Alias.
    protoMethods.le = protoMethods.isLessThanOrEqual; // Another alias.
    protoMethods.isGreaterThan = function(other) { return this.compareWith(other) > 0; };
    protoMethods.gt = protoMethods.isGreaterThan; // Alias.
    protoMethods.isGreaterThanOrEqual = function(other) { return this.compareWith(other) >= 0; };
    protoMethods.gte = protoMethods.isGreaterThanOrEqual; // Alias.
    protoMethods.ge = protoMethods.isGreaterThanOrEqual; // Another alias.

    // Full comparison function: returns -1 if this < other, 0 if this == other, 1 if this > other.
    protoMethods.compareWith = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      if (this.equalsValue(other)) return 0;

      var thisNegative = this.isNegativeValue();
      var otherNegative = other.isNegativeValue();

      if (thisNegative && !otherNegative) return -1; // Negative is always smaller than positive.
      if (!thisNegative && otherNegative) return 1;  // Positive is always larger than negative.

      if (this.unsigned) {
        // Unsigned comparison: compare high bits first, then low bits.
        if ((other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0))) {
          return -1;
        }
        return 1;
      } else {
        // Signed comparison: if signs are the same, subtract and check the sign of the result.
        return this.subtract(other).isNegativeValue() ? -1 : 1;
      }
    };
    protoMethods.comp = protoMethods.compareWith; // Alias.

    // Arithmetic operations.
    protoMethods.negate = function() {
      // Special case for MIN_SIGNED_VAL (-2^63), which has no positive 64-bit equivalent.
      return !this.unsigned && this.equalsValue(MIN_SIGNED_VAL) ? MIN_SIGNED_VAL : this.bitwiseNot().add(ONE_VAL);
    };
    protoMethods.neg = protoMethods.negate; // Alias.

    protoMethods.add = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);

      // Perform 32-bit addition with carry propagation across 16-bit chunks.
      var thisHigh16 = this.high >>> 16;
      var thisLow16 = 65535 & this.high;
      var thisLow32High16 = this.low >>> 16;
      var thisLow32Low16 = 65535 & this.low;

      var otherHigh16 = other.high >>> 16;
      var otherLow16 = 65535 & other.high;
      var otherLow32High16 = other.low >>> 16;
      var otherLow32Low16 = 65535 & other.low;

      var carryLowLow = 0;
      var carryLowHigh = 0;
      var carryHighLow = 0;
      var carryHighHigh = 0;

      carryLowLow += (carryHighHigh += thisLow32Low16 + (65535 & other.low)) >>> 16;
      carryLowHigh += (carryLowLow += thisLow32High16 + otherLow32High16) >>> 16;
      carryHighLow += (carryLowHigh += thisLow16 + otherLow16) >>> 16;
      carryHighHigh += thisHigh16 + otherHigh16;

      return fromComponents(
        (carryLowHigh &= 65535) << 16 | (carryLowLow &= 65535),
        (carryHighHigh &= 65535) << 16 | (carryHighLow &= 65535),
        this.unsigned
      );
    };

    protoMethods.subtract = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      return this.add(other.negate()); // Subtraction is addition with the negated value.
    };
    protoMethods.sub = protoMethods.subtract; // Alias.

    protoMethods.multiplyBy = function(other) {
      if (this.isZeroValue()) return ZERO_VAL;
      if (!isBigNumInstance(other)) other = fromAnyValue(other);

      if (wasmInstance) {
        // Use WebAssembly for multiplication if available for performance.
        return fromComponents(wasmInstance.mul(this.low, this.high, other.low, other.high), wasmInstance.get_high(), this.unsigned);
      }

      if (other.isZeroValue()) return ZERO_VAL;

      // Special cases for MIN_SIGNED_VAL, which needs careful handling.
      if (this.equalsValue(MIN_SIGNED_VAL)) return other.isOddValue() ? MIN_SIGNED_VAL : ZERO_VAL;
      if (other.equalsValue(MIN_SIGNED_VAL)) return this.isOddValue() ? MIN_SIGNED_VAL : ZERO_VAL;

      // Handle signs: convert to positive, multiply, then apply the correct sign.
      if (this.isNegativeValue()) {
        return other.isNegativeValue() ? this.negate().multiplyBy(other.negate()) : this.negate().multiplyBy(other).negate();
      }
      if (other.isNegativeValue()) {
        return this.multiplyBy(other.negate()).negate();
      }

      // Optimization for small numbers to use native JavaScript multiplication.
      if (this.isLessThan(SMALL_INT_THRESHOLD) && other.isLessThan(SMALL_INT_THRESHOLD)) {
        return fromDecimal(this.toNativeNumber() * other.toNativeNumber(), this.unsigned);
      }

      // Perform 32x32 -> 64-bit multiplication using 16-bit chunks.
      var thisHigh16 = this.high >>> 16;
      var thisLow16 = 65535 & this.high;
      var thisLow32High16 = this.low >>> 16;
      var thisLow32Low16 = 65535 & this.low;

      var otherHigh16 = other.high >>> 16;
      var otherLow16 = 65535 & other.high;
      var otherLow32High16 = other.low >>> 16;
      var otherLow32Low16 = 65535 & other.low;

      var resultLowLow = 0, resultLowHigh = 0, resultHighLow = 0, resultHighHigh = 0;

      resultHighLow += (resultLowLow += thisLow32Low16 * otherLow32Low16) >>> 16;
      resultLowHigh += (resultHighLow += thisLow32High16 * otherLow32Low16) >>> 16;
      resultHighLow &= 65535;
      resultLowHigh += (resultHighLow += thisLow32Low16 * otherLow32High16) >>> 16;
      resultHighHigh += (resultLowHigh += thisLow16 * otherLow32Low16) >>> 16;
      resultLowHigh &= 65535;
      resultHighHigh += (resultLowHigh += thisLow32High16 * otherLow32High16) >>> 16;
      resultLowHigh &= 65535;
      resultHighHigh += (resultLowHigh += thisLow32Low16 * otherLow16) >>> 16;
      resultHighHigh += thisHigh16 * otherLow32Low16 + thisLow16 * otherLow32High16 + thisLow32Low16 * otherHigh16;

      return fromComponents(
        (resultLowHigh &= 65535) << 16 | (resultLowLow &= 65535),
        (resultHighHigh &= 65535) << 16 | (resultLowHigh &= 65535),
        this.unsigned
      );
    };
    protoMethods.mul = protoMethods.multiplyBy; // Alias.

    protoMethods.divideBy = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      if (other.isZeroValue()) throw Error("division by zero");

      var quotient, remainder;

      if (wasmInstance) {
        // Use WebAssembly for division if available.
        // Special check for MIN_SIGNED_VAL / -1, which is MIN_SIGNED_VAL itself.
        if (this.unsigned || MIN_SIGNED_VAL.high !== this.high || NEGATIVE_ONE_VAL.low !== other.low || NEGATIVE_ONE_VAL.high !== other.high) {
          return fromComponents((this.unsigned ? wasmInstance.div_u : wasmInstance.div_s)(this.low, this.high, other.low, other.high), wasmInstance.get_high(), this.unsigned);
        }
        return this;
      }

      if (this.isZeroValue()) return this.unsigned ? UNSIGNED_ZERO_VAL : ZERO_VAL;

      if (this.unsigned) {
        if (!other.unsigned) other = other.toUnsigned(); // Ensure divisor is unsigned for unsigned division.
        if (other.isGreaterThan(this)) return UNSIGNED_ZERO_VAL; // Divisor is larger than dividend.
        if (other.isGreaterThan(this.shiftRightUnsigned(1))) return UNSIGNED_ONE_VAL; // Divisor is half or more of dividend.
        quotient = UNSIGNED_ZERO_VAL;
      } else {
        if (this.equalsValue(MIN_SIGNED_VAL)) {
          if (other.equalsValue(ONE_VAL) || other.equalsValue(NEGATIVE_ONE_VAL)) return MIN_SIGNED_VAL;
          if (other.equalsValue(MIN_SIGNED_VAL)) return ONE_VAL;
          // Special handling for -2^63 / X.
          quotient = this.shiftRight(1).divideBy(other).shiftLeft(1);
          if (quotient.equalsValue(ZERO_VAL)) {
            return other.isNegativeValue() ? ONE_VAL : NEGATIVE_ONE_VAL;
          }
          remainder = this.subtract(other.multiplyBy(quotient));
          return quotient.add(remainder.divideBy(other));
        }
        if (other.equalsValue(MIN_SIGNED_VAL)) return this.unsigned ? UNSIGNED_ZERO_VAL : ZERO_VAL;
        // Handle signs for signed division.
        if (this.isNegativeValue()) {
          return other.isNegativeValue() ? this.negate().divideBy(other.negate()) : this.negate().divideBy(other).negate();
        }
        if (other.isNegativeValue()) {
          return this.divideBy(other.negate()).negate();
        }
        quotient = ZERO_VAL;
      }

      // Standard long division algorithm using repeated subtraction and estimation.
      remainder = this;
      while (remainder.isGreaterThanOrEqual(other)) {
        var estimatedQuotient = Math.max(1, Math.floor(remainder.toNativeNumber() / other.toNativeNumber()));
        var bitLength = Math.ceil(Math.log(estimatedQuotient) / Math.LN2);
        var shiftAmount = bitLength <= 48 ? 1 : powerFunction(2, bitLength - 48); // Reduce estimate by power of 2.

        var tempQuotient = fromDecimal(estimatedQuotient);
        var tempProduct = tempQuotient.multiplyBy(other);

        // Adjust estimate if it was too high.
        while (tempProduct.isNegativeValue() || tempProduct.isGreaterThan(remainder)) {
          tempProduct = (tempQuotient = fromDecimal(estimatedQuotient -= shiftAmount, this.unsigned)).multiplyBy(other);
        }
        if (tempQuotient.isZeroValue()) tempQuotient = ONE_VAL; // Ensure at least 1.

        quotient = quotient.add(tempQuotient);
        remainder = remainder.subtract(tempProduct);
      }
      return quotient;
    };
    protoMethods.div = protoMethods.divideBy; // Alias.

    protoMethods.moduloBy = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      if (wasmInstance) {
        // Use WebAssembly for modulo if available.
        return fromComponents((this.unsigned ? wasmInstance.rem_u : wasmInstance.rem_s)(this.low, this.high, other.low, other.high), wasmInstance.get_high(), this.unsigned);
      }
      // Modulo is dividend - (quotient * divisor).
      return this.subtract(this.divideBy(other).multiplyBy(other));
    };
    protoMethods.mod = protoMethods.moduloBy; // Alias.
    protoMethods.rem = protoMethods.moduloBy; // Another alias.

    // Bitwise operations.
    protoMethods.bitwiseNot = function() {
      return fromComponents(~this.low, ~this.high, this.unsigned);
    };
    protoMethods.not = protoMethods.bitwiseNot; // Alias.

    protoMethods.bitwiseAnd = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      return fromComponents(this.low & other.low, this.high & other.high, this.unsigned);
    };
    protoMethods.and = protoMethods.bitwiseAnd; // Alias.

    protoMethods.bitwiseOr = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      return fromComponents(this.low | other.low, this.high | other.high, this.unsigned);
    };
    protoMethods.or = protoMethods.bitwiseOr; // Alias.

    protoMethods.bitwiseXor = function(other) {
      if (!isBigNumInstance(other)) other = fromAnyValue(other);
      return fromComponents(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    protoMethods.xor = protoMethods.bitwiseXor; // Alias.

    // Shift operations.
    protoMethods.shiftLeft = function(shiftAmount) {
      if (!isBigNumInstance(shiftAmount)) shiftAmount = shiftAmount | 0;
      shiftAmount &= 63; // Shift amount should be between 0 and 63 for 64-bit numbers.
      if (shiftAmount === 0) return this;
      if (shiftAmount < 32) {
        // Shift low bits, and carry over to high bits.
        return fromComponents(this.low << shiftAmount, (this.high << shiftAmount) | (this.low >>> (32 - shiftAmount)), this.unsigned);
      }
      // If shift is 32 or more, low bits become 0.
      return fromComponents(0, this.low << (shiftAmount - 32), this.unsigned);
    };
    protoMethods.shl = protoMethods.shiftLeft; // Alias.

    protoMethods.shiftRight = function(shiftAmount) {
      if (!isBigNumInstance(shiftAmount)) shiftAmount = shiftAmount | 0;
      shiftAmount &= 63; // Shift amount should be between 0 and 63.
      if (shiftAmount === 0) return this;
      if (shiftAmount < 32) {
        // Shift high bits, and carry over to low bits.
        return fromComponents((this.low >>> shiftAmount) | (this.high << (32 - shiftAmount)), this.high >> shiftAmount, this.unsigned);
      }
      // If shift is 32 or more, high bits determine sign extension.
      return fromComponents(this.high >> (shiftAmount - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    protoMethods.shr = protoMethods.shiftRight; // Alias.

    protoMethods.shiftRightUnsigned = function(shiftAmount) {
      if (!isBigNumInstance(shiftAmount)) shiftAmount = shiftAmount | 0;
      if ((shiftAmount &= 63) === 0) return this; // Shift amount should be between 0 and 63.
      var currentHigh = this.high;
      if (shiftAmount < 32) {
        // Shift high bits unsigned, and carry over to low bits.
        return fromComponents((this.low >>> shiftAmount) | (currentHigh << (32 - shiftAmount)), currentHigh >>> shiftAmount, this.unsigned);
      }
      // If shift is 32 or more, high bits become low bits (unsigned).
      return fromComponents(shiftAmount === 32 ? currentHigh : (currentHigh >>> (shiftAmount - 32)), 0, this.unsigned);
    };
    protoMethods.shru = protoMethods.shiftRightUnsigned; // Alias.
    protoMethods.shr_u = protoMethods.shiftRightUnsigned; // Another alias.

    // Type conversion methods.
    protoMethods.toSigned = function() {
      return this.unsigned ? fromComponents(this.low, this.high, false) : this;
    };
    protoMethods.toUnsigned = function() {
      return this.unsigned ? this : fromComponents(this.low, this.high, true);
    };

    // Byte array conversion.
    protoMethods.toBytes = function(isLittleEndian) {
      return isLittleEndian ? this.toBytesLittleEndian() : this.toBytesBigEndian();
    };
    protoMethods.toBytesLittleEndian = function() {
      var h = this.high, l = this.low;
      return [
        255 & l, (l >>> 8) & 255, (l >>> 16) & 255, l >>> 24,
        255 & h, (h >>> 8) & 255, (h >>> 16) & 255, h >>> 24
      ];
    };
    protoMethods.toBytesBigEndian = function() {
      var h = this.high, l = this.low;
      return [
        h >>> 24, (h >>> 16) & 255, (h >>> 8) & 255, 255 & h,
        l >>> 24, (l >>> 16) & 255, (l >>> 8) & 255, 255 & l
      ];
    };

    BigIntegerType.fromBytes = function(byteArray, isUnsigned, isLittleEndian) {
      return isLittleEndian ? BigIntegerType.fromBytesLittleEndian(byteArray, isUnsigned) : BigIntegerType.fromBytesBigEndian(byteArray, isUnsigned);
    };
    BigIntegerType.fromBytesLittleEndian = function(byteArray, isUnsigned) {
      return new BigIntegerType(
        byteArray[0] | (byteArray[1] << 8) | (byteArray[2] << 16) | (byteArray[3] << 24),
        byteArray[4] | (byteArray[5] << 8) | (byteArray[6] << 16) | (byteArray[7] << 24),
        isUnsigned
      );
    };
    BigIntegerType.fromBytesBigEndian = function(byteArray, isUnsigned) {
      return new BigIntegerType(
        (byteArray[4] << 24) | (byteArray[5] << 16) | (byteArray[6] << 8) | byteArray[7],
        (byteArray[0] << 24) | (byteArray[1] << 16) | (byteArray[2] << 8) | byteArray[3],
        isUnsigned
      );
    };
  }
]);