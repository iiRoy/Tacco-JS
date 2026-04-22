!function(moduleMap){
  // Cache for loaded modules
  var moduleCache = {};

  // Custom module require function
  function requireModule(moduleId) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // Otherwise, create a new module entry in cache
    var moduleEntry = moduleCache[moduleId] = {
      id: moduleId,
      initialized: false, // Flag to track if the module's function has been called
      exports: {}
    };

    // Execute the module function, populating its exports
    moduleMap[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, requireModule);

    // Mark as initialized
    moduleEntry.initialized = true;

    // Return the module's exports
    return moduleEntry.exports;
  }

  // Extend the requireModule function with utility methods
  // Store module definitions
  requireModule.modules = moduleMap;
  // Store module cache
  requireModule.cache = moduleCache;

  // Define property on exports object
  requireModule.defineProperty = function(targetObject, propertyName, getterFn) {
    if (!requireModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFn
      });
    }
  };

  // Mark module as an ES module and define toStringTag
  requireModule.registerESModule = function(targetObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(targetObject, "__esModule", { value: true });
  };

  // Interop for different module types
  requireModule.interopRequire = function(moduleObj, flags) {
    if (flags & 1) return moduleObj; // If already an ES module
    if (flags & 8) return moduleObj; // If already an ES module (webpack specific)
    if (flags & 4 && typeof moduleObj === "object" && moduleObj && moduleObj.__esModule) return moduleObj; // If common JS module with __esModule flag

    var newModule = Object.create(null);
    requireModule.registerESModule(newModule);
    Object.defineProperty(newModule, "default", { enumerable: true, value: moduleObj });

    // Copy named exports if not an ES module and not a string
    if (flags & 2 && typeof moduleObj !== "string") {
      for (var key in moduleObj) {
        requireModule.defineProperty(newModule, key, (function(k) {
          return moduleObj[k];
        }).bind(null, key));
      }
    }
    return newModule;
  };

  // Get default export from module
  requireModule.getDefaultExport = function(moduleObj) {
    var defaultGetter = moduleObj && moduleObj.__esModule ?
      function() { return moduleObj.default; } :
      function() { return moduleObj; };
    requireModule.defineProperty(defaultGetter, "a", defaultGetter); // Add a shortcut
    return defaultGetter;
  };

  // Check if object has own property
  requireModule.hasOwn = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Base path for public assets (empty in this case)
  requireModule.publicPath = "";

  // Start the application by requiring the entry module (module 0)
  requireModule(requireModule.s = 0);
}([
  // Module 0: Main application logic
  function(moduleContext, moduleResult, moduleLoader) {
    "use strict";
    // Helper for importing default exports
    var defaultImportHelper = this && this.__importDefault || function(mod) {
      return (mod && mod.__esModule) ? mod : { default: mod };
    };

    moduleResult.__esModule = true;

    // Load file system utility
    var fileSystemUtility = defaultImportHelper(moduleLoader(1));
    // Load problem solver implementation
    var problemSolverModule = moduleLoader(2);

    // Define the input file path
    const inputFilePath = "/dev/stdin";
    const encodingType = "utf8";

    // Read the input file asynchronously
    fileSystemUtility.default.readFile(inputFilePath, encodingType, (err, fileContent) => {
      // Handle potential errors during file reading
      if (err) {
        console.error("Error reading input file:", err);
        // Optionally, throw an error or exit process
        return;
      }

      // Process the input content
      (function executeProblemSolution(rawDataString) {
        var solverInstance = new problemSolverModule.Solver();
        var parsedInputData = solverInstance.parse(rawDataString);
        var finalComputedAnswer = solverInstance.solve(parsedInputData);
        solverInstance.print(finalComputedAnswer);
      })(fileContent); // Immediately invoke with file content
    });
  },

  // Module 1: File system dependency
  function(moduleExports, moduleContents) {
    moduleExports.exports = require("fs");
  },

  // Module 2: Contest Solver Class
  function(moduleContext, moduleExports, moduleLoader) {
    "use strict";
    // Helper for class inheritance
    var inheritanceUtility = this && this.__extends || (function() {
      var _superFn = function(derived, base) {
        _superFn = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function(derived, base) { derived.__proto__ = base; }) ||
          function(derived, base) {
            for (var p in base)
              if (base.hasOwnProperty(p)) derived[p] = base[p];
          };
        return _superFn(derived, base);
      };
      return function(derived, base) {
        function __() { this.constructor = derived; }
        _superFn(derived, base);
        derived.prototype = base === null ? Object.create(base) : (__.prototype = base.prototype, new __());
      };
    })();

    // Helper for default imports
    var defaultImportResolver = this && this.__importDefault || function(mod) {
      return (mod && mod.__esModule) ? mod : { default: mod };
    };

    moduleExports.__esModule = true;

    // Load base solver class
    var baseSolverClass = moduleLoader(3);
    // Load input parsing utility
    var inputParserUtility = moduleLoader(4);
    // Load BigInt arithmetic library (Long.js)
    var bigIntArithmetic = defaultImportResolver(moduleLoader(5));

    // Define the main ContestSolver class
    var ContestSolver = (function(BaseProblemSolver) {
      inheritanceUtility(ContestSolver, BaseProblemSolver);

      // Constructor for the solver
      function ContestSolver() {
        return BaseProblemSolver !== null && BaseProblemSolver.apply(this, arguments) || this;
      }

      // Main solution method
      ContestSolver.prototype.solve = function(problemData) {
        const totalElements = problemData.N;
        const targetRank = problemData.K;
        const inputArray = problemData.A;

        // Early exit for empty array
        if (totalElements === 0) {
            return { answer: bigIntArithmetic.default.ZERO };
        }

        // Sort the input array in ascending order
        inputArray.sort((a, b) => a - b);

        // Convert all numbers in the input array to BigInt (Long) objects
        const longArray = new Array(totalElements);
        for (let idx = 0; idx < totalElements; idx++) {
          longArray[idx] = bigIntArithmetic.default.fromNumber(inputArray[idx]);
        }

        // Count occurrences of negative, positive, and zero numbers
        let negCount = 0;
        let posCount = 0;
        let zeroCount = 0;
        for (let idx = 0; idx < totalElements; idx++) {
          const currentVal = inputArray[idx];
          if (currentVal < 0) {
            negCount++;
          } else if (currentVal > 0) {
            posCount++;
          } else {
            zeroCount++;
          }
        }

        // Calculate the number of products that are naturally negative or zero
        // Products of (negative * positive) are negative
        const negPosProducts = negCount * posCount;
        // Products involving zero are zero
        const zeroProducts = zeroCount * (posCount + negCount) + (zeroCount * (zeroCount - 1)) / 2;

        // Define constants for binary search (using BigInt for precision)
        const midValDivisor = bigIntArithmetic.default.fromNumber(2);
        const minProductBound = bigIntArithmetic.default.fromString("-1000000000000000005"); // A sufficiently small negative number
        const maxProductBound = bigIntArithmetic.default.fromString("1000000000000000005"); // A sufficiently large positive number

        let lowSearchBound = minProductBound;
        let highSearchBound = maxProductBound;

        // Binary search for the K-th smallest product
        while (highSearchBound.subtract(lowSearchBound).greaterThan(bigIntArithmetic.default.ONE)) {
          const currentMidProduct = highSearchBound.add(lowSearchBound).divide(midValDivisor);
          let productCountBelowMid = 0;

          // Case 1: Mid product is negative
          if (currentMidProduct.lessThan(bigIntArithmetic.default.ZERO)) {
            for (let i = 0; i < totalElements; i++) {
              // Only consider negative numbers for products less than mid (if mid is negative)
              if (inputArray[i] >= 0) {
                break; // Optimization: array is sorted, so subsequent elements will also be non-negative
              }

              // Binary search for 'm' such that longArray[i] * longArray[m] < currentMidProduct
              let leftPtr = negCount + zeroCount - 1; // Start from the right of negatives and zeros
              let rightPtr = totalElements; // End of array
              while (rightPtr - leftPtr > 1) {
                const midPtr = Math.floor((leftPtr + rightPtr) / 2);
                if (longArray[i].multiply(longArray[midPtr]).lessThan(currentMidProduct)) {
                  rightPtr = midPtr;
                } else {
                  leftPtr = midPtr;
                }
              }
              productCountBelowMid += totalElements - rightPtr;
            }
          }
          // Case 2: Mid product is positive
          else if (currentMidProduct.greaterThan(bigIntArithmetic.default.ZERO)) {
            // All negative * positive products are less than 0, so they are less than any positive mid product
            productCountBelowMid += negPosProducts;
            // All zero products are 0, so they are less than any positive mid product
            productCountBelowMid += zeroProducts;

            for (let i = 0; i < totalElements; i++) {
              const currentElement = inputArray[i];
              if (currentElement < 0) { // Negative number * (some number)
                // Search for 'm' such that longArray[i] * longArray[m] < currentMidProduct
                // Since currentElement is negative, we need longArray[m] > currentMidProduct / currentElement (which is negative)
                let leftPtr = i;
                let rightPtr = negCount + zeroCount; // Only search in the positive part of array
                while (rightPtr - leftPtr > 1) {
                  const midPtr = Math.floor((leftPtr + rightPtr) / 2);
                  if (longArray[i].multiply(longArray[midPtr]).lessThan(currentMidProduct)) {
                    leftPtr = midPtr;
                  } else {
                    rightPtr = midPtr;
                  }
                }
                productCountBelowMid += leftPtr - i; // Count elements to the right that satisfy condition
              } else if (currentElement > 0) { // Positive number * (some number)
                // Search for 'm' such that longArray[i] * longArray[m] < currentMidProduct
                let leftPtr = i;
                let rightPtr = totalElements;
                while (rightPtr - leftPtr > 1) {
                  const midPtr = Math.floor((leftPtr + rightPtr) / 2);
                  if (longArray[i].multiply(longArray[midPtr]).lessThan(currentMidProduct)) {
                    leftPtr = midPtr;
                  } else {
                    rightPtr = midPtr;
                  }
                }
                productCountBelowMid += leftPtr - i; // Count elements to the right that satisfy condition
              }
            }
          }
          // Case 3: Mid product is zero
          else { // currentMidProduct.equals(BigInt.ZERO)
            productCountBelowMid = negPosProducts + zeroProducts;
          }

          // Adjust binary search bounds
          if (productCountBelowMid < targetRank) {
            lowSearchBound = currentMidProduct;
          } else {
            highSearchBound = currentMidProduct;
          }
        }

        return { answer: lowSearchBound };
      };

      // Parses input string into structured data
      ContestSolver.prototype.parse = function(rawDataString) {
        // Create an iterator for space-separated integers
        const dataIterator = inputParserUtility.getSpaceIterator(rawDataString, (s) => parseInt(s, 10));

        // Read N and K
        const totalElements = dataIterator.next().value;
        const targetRank = dataIterator.next().value;

        // Basic validation for totalElements
        if (isNaN(totalElements) || totalElements < 0) {
            console.warn("Invalid N value encountered:", totalElements);
            // Default to 0 or throw error
        }

        // Read the array A
        const numberList = [];
        for (let loopIdx = 0; loopIdx < totalElements; loopIdx++) {
          numberList.push(dataIterator.next().value);
        }

        return { N: totalElements, K: targetRank, A: numberList };
      };

      // Prints the solution to the console
      ContestSolver.prototype.print = function(solutionResult) {
        console.log("Final Answer:", solutionResult.answer.toString());
      };

      return ContestSolver;
    })(baseSolverClass.SolverBase); // Inherit from SolverBase

    moduleExports.Solver = ContestSolver;
  },

  // Module 3: Base Solver Class
  function(moduleContext, moduleExports, moduleLoader) {
    "use strict";
    moduleExports.__esModule = true;

    // An empty base class for solvers
    var BaseProblemSolver = function() {
      // Base constructor, can be extended later if common initialization is needed
    };
    moduleExports.SolverBase = BaseProblemSolver;
  },

  // Module 4: Space-separated Input Iterator
  function(moduleContext, moduleExports, moduleLoader) {
    "use strict";
    // Generator helper for transpiling
    var generatorHelper = this && this.__generator || function(thisArg, body) {
      var _ = { label: 0, sent: function() { if (1 & _[0]) throw _[1]; return _[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) },
        typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function(v) { return step([n, v]); }; }
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
              t[2] && _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
    };

    moduleExports.__esModule = true;

    // Generator function to iterate over space-separated values
    moduleExports.getSpaceIterator = function(inputString, transformFn) {
      return generatorHelper(this, function*(_a) {
        let currentIndex = 0;
        // Trim and split the input string by any whitespace
        const trimmedInput = inputString.trim();
        if (trimmedInput.length === 0) {
            // If input is empty, yield nothing and finish
            return [2 /*Return*/, void 0];
        }
        const parsedValues = trimmedInput.split(/\s+/).map((val) => transformFn(val));

        // Yield each parsed value
        while (currentIndex < parsedValues.length) {
          yield [4 /*yield*/, parsedValues[currentIndex]];
          currentIndex++;
        }
        return [2 /*Return*/, void 0];
      });
    };
  },

  // Module 5: BigInt Arithmetic Library (Long.js heavily modified)
  function(moduleExports, moduleContents) {
    moduleExports.exports = BigIntClass; // Renamed from 'e' to 'BigIntClass'
    var wasmInstance = null; // Renamed from 'n'

    try {
      // Attempt to load WebAssembly module for performance
      wasmInstance = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11
      ])), {}).exports;
    } catch (e) {
      console.warn("WebAssembly support for BigInt operations not available or failed to load.", e);
      wasmInstance = null; // Ensure it's null if loading fails
    }

    // BigInt constructor
    function BigIntClass(lowBits, highBits, isUnsigned) {
      this.low = lowBits | 0; // Ensure 32-bit integer
      this.high = highBits | 0; // Ensure 32-bit integer
      this.unsigned = !!isUnsigned; // Force boolean
    }

    // Check if an object is a BigIntClass instance
    function isBigInt(val) {
      return (val && val.__isLong__) === true;
    }
    BigIntClass.prototype.__isLong__ = undefined; // Placeholder
    Object.defineProperty(BigIntClass.prototype, "__isLong__", { value: true });
    BigIntClass.isBigInt = isBigInt;

    // Caches for common integer values
    var signedCache = {};
    var unsignedCache = {};

    // Create BigInt from a 32-bit integer
    function fromInteger(value, isUnsigned) {
      var cachedVal, isSmallInt;
      if (isUnsigned) {
        isSmallInt = (value >>> 0) >= 0 && (value >>> 0) < 256;
        cachedVal = unsignedCache[value];
        if (isSmallInt && cachedVal) return cachedVal;
        var newBigInt = createBigInt(value, (value | 0) < 0 ? -1 : 0, true);
        if (isSmallInt) unsignedCache[value] = newBigInt;
        return newBigInt;
      } else {
        isSmallInt = (value | 0) >= -128 && (value | 0) < 128;
        cachedVal = signedCache[value];
        if (isSmallInt && cachedVal) return cachedVal;
        var newBigInt = createBigInt(value, value < 0 ? -1 : 0, false);
        if (isSmallInt) signedCache[value] = newBigInt;
        return newBigInt;
      }
    }

    // Create BigInt from a JavaScript number
    function fromNumericValue(value, isUnsigned) {
      if (isNaN(value)) {
        return isUnsigned ? BigIntClass.UZERO : BigIntClass.ZERO;
      }
      if (isUnsigned) {
        if (value < 0) return BigIntClass.UZERO;
        if (value >= MAX_UNSIGNED_DOUBLE) return BigIntClass.MAX_UNSIGNED_VALUE;
      } else {
        if (value <= MIN_SIGNED_DOUBLE) return BigIntClass.MIN_VALUE;
        if (value + 1 >= MAX_SIGNED_DOUBLE) return BigIntClass.MAX_VALUE;
      }
      return value < 0 ? fromNumericValue(-value, isUnsigned).negate() : createBigInt(value % MAX_INT_32_PLUS_1 | 0, value / MAX_INT_32_PLUS_1 | 0, isUnsigned);
    }

    // Internal helper to create a BigInt instance
    function createBigInt(low, high, unsigned) {
      return new BigIntClass(low, high, unsigned);
    }

    BigIntClass.fromInt = fromInteger;
    BigIntClass.fromNumber = fromNumericValue;
    BigIntClass.fromBits = createBigInt;

    var powerFunc = Math.pow; // Renamed from 'l'

    // Parse string representation of a number to BigInt
    function parseString(strValue, radix, isUnsigned) {
      if (strValue.length === 0) throw Error("Empty string provided to BigInt.fromString");
      if (strValue === "NaN" || strValue === "Infinity" || strValue === "+Infinity" || strValue === "-Infinity") return BigIntClass.ZERO;

      // Handle radix parameter
      if (typeof radix === "number") {
        isUnsigned = radix; // If radix is a number, assume it's the unsigned flag
        radix = undefined; // Reset radix
      }
      isUnsigned = !!isUnsigned; // Ensure boolean

      radix = radix || 10;
      if (radix < 2 || radix > 36) throw RangeError("Radix must be between 2 and 36.");

      var hyphenIndex;
      if ((hyphenIndex = strValue.indexOf("-")) > 0) throw Error("Hyphen not at start of string.");
      if (hyphenIndex === 0) return parseString(strValue.substring(1), radix, isUnsigned).negate();

      // Optimize for common radices
      var blockRadix = fromNumericValue(powerFunc(radix, 8));
      var currentBigInt = BigIntClass.ZERO;
      for (var i = 0; i < strValue.length; i += 8) {
        var blockLength = Math.min(8, strValue.length - i);
        var blockValue = parseInt(strValue.substring(i, i + blockLength), radix);
        if (blockLength < 8) {
          var partialRadix = fromNumericValue(powerFunc(radix, blockLength));
          currentBigInt = currentBigInt.multiply(partialRadix).add(fromNumericValue(blockValue));
        } else {
          currentBigInt = currentBigInt.multiply(blockRadix).add(fromNumericValue(blockValue));
        }
      }
      currentBigInt.unsigned = isUnsigned;
      return currentBigInt;
    }

    // Convert any value to a BigInt
    function convertValue(val, isUnsigned) {
      if (typeof val === "number") return fromNumericValue(val, isUnsigned);
      if (typeof val === "string") return parseString(val, isUnsigned);
      return createBigInt(val.low, val.high, typeof isUnsigned === "boolean" ? isUnsigned : val.unsigned);
    }

    BigIntClass.fromString = parseString;
    BigIntClass.fromValue = convertValue;

    // Constants
    var MAX_INT_32_PLUS_1 = 4294967296; // 2^32
    var MAX_UNSIGNED_DOUBLE = MAX_INT_32_PLUS_1 * MAX_INT_32_PLUS_1; // 2^64
    var MIN_SIGNED_DOUBLE = -MAX_UNSIGNED_DOUBLE / 2; // -2^63

    var ZERO_SIGNED = fromInteger(0);
    BigIntClass.ZERO = ZERO_SIGNED;
    var ZERO_UNSIGNED = fromInteger(0, true);
    BigIntClass.UZERO = ZERO_UNSIGNED;

    var ONE_SIGNED = fromInteger(1);
    BigIntClass.ONE = ONE_SIGNED;
    var ONE_UNSIGNED = fromInteger(1, true);
    BigIntClass.UONE = ONE_UNSIGNED;

    var NEG_ONE_SIGNED = fromInteger(-1);
    BigIntClass.NEG_ONE = NEG_ONE_SIGNED;

    var MAX_SIGNED_VALUE = createBigInt(-1, 2147483647, false); // 2^63 - 1
    BigIntClass.MAX_VALUE = MAX_SIGNED_VALUE;

    var MAX_UNSIGNED_VALUE = createBigInt(-1, -1, true); // 2^64 - 1
    BigIntClass.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

    var MIN_SIGNED_VALUE = createBigInt(0, -2147483648, false); // -2^63
    BigIntClass.MIN_VALUE = MIN_SIGNED_VALUE;

    // Prototype for BigIntClass
    var proto = BigIntClass.prototype; // Renamed from 'q'

    proto.toInteger = function() {
      return this.unsigned ? this.low >>> 0 : this.low;
    };

    proto.toFloat = function() {
      return this.unsigned ? (this.high >>> 0) * MAX_INT_32_PLUS_1 + (this.low >>> 0) : this.high * MAX_INT_32_PLUS_1 + (this.low >>> 0);
    };

    proto.toRadixString = function(radix) {
      radix = radix || 10;
      if (radix < 2 || radix > 36) throw RangeError("Radix must be between 2 and 36.");
      if (this.isValZero()) return "0";
      if (this.isNegative()) {
        if (this.equals(MIN_SIGNED_VALUE)) {
          // Special case for MIN_SIGNED_VALUE to avoid overflow during negation
          var radixBigInt = fromNumericValue(radix);
          var quotient = this.divide(radixBigInt);
          var remainder = quotient.multiply(radixBigInt).subtract(this);
          return quotient.toRadixString(radix) + remainder.toInteger().toString(radix);
        }
        return "-" + this.negate().toRadixString(radix);
      }
      var str = "";
      var currentVal = this;
      var blockRadix = fromNumericValue(powerFunc(radix, 6), this.unsigned);
      while (!currentVal.isValZero()) {
        var quotient = currentVal.divide(blockRadix);
        var remainder = currentVal.subtract(quotient.multiply(blockRadix)).toInteger() >>> 0;
        var remainderStr = remainder.toString(radix);
        currentVal = quotient;
        if (!currentVal.isValZero()) {
          while (remainderStr.length < 6) remainderStr = "0" + remainderStr;
        }
        str = remainderStr + str;
      }
      return str;
    };

    proto.getHighPart = function() { return this.high; };
    proto.getHighPartUnsigned = function() { return this.high >>> 0; };
    proto.getLowPart = function() { return this.low; };
    proto.getLowPartUnsigned = function() { return this.low >>> 0; };

    proto.getAbsoluteBitLength = function() {
      if (this.isNegative()) return this.equals(MIN_SIGNED_VALUE) ? 64 : this.negate().getAbsoluteBitLength();
      var value = this.high !== 0 ? this.high : this.low;
      if (value === 0) return 0; // Added guard for zero
      for (var i = 31; i > 0 && (value & (1 << i)) === 0; i--);
      return this.high !== 0 ? i + 33 : i + 1;
    };

    proto.isValZero = function() { return this.high === 0 && this.low === 0; };
    proto.isZeroAlias = proto.isValZero; // Alias

    proto.isNegative = function() { return !this.unsigned && this.high < 0; };
    proto.isPositive = function() { return this.unsigned || this.high >= 0; };

    proto.isOdd = function() { return (this.low & 1) === 1; };
    proto.isEven = function() { return (this.low & 1) === 0; };

    proto.equals = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      // Check for signed/unsigned mismatch only if high bits imply different signs
      var signMismatch = this.unsigned !== other.unsigned && (this.high >>> 31 !== 1 || other.high >>> 31 !== 1); // Simplified condition
      if (!signMismatch) {
        return this.high === other.high && this.low === other.low;
      }
      return false; // Definitely not equal if sign interpretation differs and values are not trivial
    };
    proto.eq = proto.equals; // Alias

    proto.notEquals = function(other) { return !this.equals(other); };
    proto.neq = proto.notEquals; // Alias
    proto.ne = proto.notEquals; // Alias

    proto.lessThan = function(other) { return this.compare(other) < 0; };
    proto.lt = proto.lessThan; // Alias

    proto.lessThanOrEqual = function(other) { return this.compare(other) <= 0; };
    proto.lte = proto.lessThanOrEqual; // Alias
    proto.le = proto.lessThanOrEqual; // Alias

    proto.greaterThan = function(other) { return this.compare(other) > 0; };
    proto.gt = proto.greaterThan; // Alias

    proto.greaterThanOrEqual = function(other) { return this.compare(other) >= 0; };
    proto.gte = proto.greaterThanOrEqual; // Alias
    proto.ge = proto.greaterThanOrEqual; // Alias

    proto.compare = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      if (this.equals(other)) return 0;

      var thisIsNegative = this.isNegative();
      var otherIsNegative = other.isNegative();

      if (thisIsNegative && !otherIsNegative) return -1;
      if (!thisIsNegative && otherIsNegative) return 1;

      if (this.unsigned) {
        if (other.high >>> 0 > this.high >>> 0 || (other.high === this.high && other.low >>> 0 > this.low >>> 0)) return -1;
        return 1;
      }
      // For signed numbers, subtract and check sign
      return this.subtract(other).isNegative() ? -1 : 1;
    };
    proto.comp = proto.compare; // Alias

    proto.negate = function() {
      if (!this.unsigned && this.equals(MIN_SIGNED_VALUE)) return MIN_SIGNED_VALUE;
      return this.not().add(BigIntClass.ONE);
    };
    proto.neg = proto.negate; // Alias

    proto.performAddition = function(other) {
      if (!isBigInt(other)) other = convertValue(other);

      var thisHigh16 = this.high >>> 16;
      var thisLow16 = this.high & 0xFFFF;
      var thisLow0 = this.low >>> 16;
      var thisLow16_0 = this.low & 0xFFFF;

      var otherHigh16 = other.high >>> 16;
      var otherLow16 = other.high & 0xFFFF;
      var otherLow0 = other.low >>> 16;
      var otherLow16_0 = other.low & 0xFFFF;

      var c0 = 0, c1 = 0, c2 = 0, c3 = 0;

      c0 += thisLow16_0 + otherLow16_0;
      c1 += c0 >>> 16;
      c0 &= 0xFFFF;

      c1 += thisLow0 + otherLow0;
      c2 += c1 >>> 16;
      c1 &= 0xFFFF;

      c2 += thisLow16 + otherLow16;
      c3 += c2 >>> 16;
      c2 &= 0xFFFF;

      c3 += thisHigh16 + otherHigh16;
      c3 &= 0xFFFF; // Ensure c3 stays within 16 bits for final high part

      return createBigInt((c1 << 16) | c0, (c3 << 16) | c2, this.unsigned);
    };
    proto.add = proto.performAddition; // Alias

    proto.subtract = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      return this.add(other.negate());
    };
    proto.sub = proto.subtract; // Alias

    proto.executeMultiplication = function(other) {
      if (this.isValZero()) return BigIntClass.ZERO;
      if (!isBigInt(other)) other = convertValue(other);
      if (wasmInstance) {
        return createBigInt(wasmInstance.mul(this.low, this.high, other.low, other.high), wasmInstance.get_high(), this.unsigned);
      }
      if (other.isValZero()) return BigIntClass.ZERO;

      // Handle special MIN_VALUE case
      if (this.equals(MIN_SIGNED_VALUE)) {
        if (other.isOdd()) return MIN_SIGNED_VALUE;
        return BigIntClass.ZERO;
      }
      if (other.equals(MIN_SIGNED_VALUE)) {
        if (this.isOdd()) return MIN_SIGNED_VALUE;
        return BigIntClass.ZERO;
      }

      // Handle negative numbers by converting to positive, multiplying, then negating result if necessary
      if (this.isNegative()) {
        return other.isNegative() ? this.negate().executeMultiplication(other.negate()) : this.negate().executeMultiplication(other).negate();
      }
      if (other.isNegative()) {
        return this.executeMultiplication(other.negate()).negate();
      }

      // Optimization for small numbers
      var smallNumberThreshold = fromInteger(1 << 24); // 2^24
      if (this.lessThan(smallNumberThreshold) && other.lessThan(smallNumberThreshold)) {
        return fromNumericValue(this.toFloat() * other.toFloat(), this.unsigned);
      }

      // Full 64-bit multiplication (Karatsuba-like approach)
      var h1 = this.high >>> 16;
      var l1 = this.high & 0xFFFF;
      var h0 = this.low >>> 16;
      var l0 = this.low & 0xFFFF;

      var h3 = other.high >>> 16;
      var l3 = other.high & 0xFFFF;
      var h2 = other.low >>> 16;
      var l2 = other.low & 0xFFFF;

      // Product (l0 * l2)
      var res0 = l0 * l2;
      var carry = res0 >>> 16;

      // Product (h0 * l2 + l0 * h2)
      var res1 = (h0 * l2 + l0 * h2) + carry;
      carry = res1 >>> 16;

      // Product (l1 * l2 + h0 * h2 + l0 * h3)
      var res2 = (l1 * l2 + h0 * h2 + l0 * h3) + carry;
      carry = res2 >>> 16;

      // Product (h1 * l2 + l1 * h2 + h0 * h3 + l0 * h4 (implicitly 0))
      var res3 = (h1 * l2 + l1 * h2 + h0 * h3) + carry;

      return createBigInt(
        ((res1 & 0xFFFF) << 16) | (res0 & 0xFFFF),
        ((res3 & 0xFFFF) << 16) | (res2 & 0xFFFF),
        this.unsigned
      );
    };
    proto.mul = proto.executeMultiplication; // Alias

    proto.divide = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      if (other.isValZero()) throw Error("Division by zero");

      if (wasmInstance) {
        // Special case for MIN_VALUE / -1 as WASM might not handle it directly
        var isMinSignedDivNegOne = !this.unsigned && this.high === -2147483648 && this.low === 0 && other.low === -1 && other.high === -1;
        if (!isMinSignedDivNegOne) {
          return createBigInt(
            (this.unsigned ? wasmInstance.div_u : wasmInstance.div_s)(this.low, this.high, other.low, other.high),
            wasmInstance.get_high(),
            this.unsigned
          );
        }
      }

      if (this.isValZero()) return this.unsigned ? BigIntClass.UZERO : BigIntClass.ZERO;

      var isThisUnsigned = this.unsigned;
      var isOtherUnsigned = other.unsigned;

      // Handle unsigned division
      if (isThisUnsigned) {
        if (!isOtherUnsigned) other = other.toUnsigned();
        if (other.greaterThan(this)) return BigIntClass.UZERO;
        if (other.greaterThan(this.shiftRightUnsigned(1))) return BigIntClass.UONE; // Optimization for N / (N/2 < X <= N)
        return BigIntClass.UZERO; // Fallback
      } else { // Signed division
        if (this.equals(MIN_SIGNED_VALUE)) {
          if (other.equals(BigIntClass.ONE) || other.equals(BigIntClass.NEG_ONE)) return MIN_SIGNED_VALUE;
          if (other.equals(MIN_SIGNED_VALUE)) return BigIntClass.ONE;
          // For MIN_VALUE / X, calculate (MIN_VALUE >> 1) / X * 2 + (remainder) / X
          var halfMin = this.shiftRight(1).divide(other).shiftLeft(1);
          var remainder = this.subtract(other.multiply(halfMin));
          return halfMin.add(remainder.divide(other));
        }
        if (other.equals(MIN_SIGNED_VALUE)) return isThisUnsigned ? BigIntClass.UZERO : BigIntClass.ZERO; // Any number / MIN_VALUE (except MIN_VALUE itself) is 0
        if (this.isNegative()) {
          return other.isNegative() ? this.negate().divide(other.negate()) : this.negate().divide(other).negate();
        }
        if (other.isNegative()) {
          return this.divide(other.negate()).negate();
        }
        // Fall through to generic division for signed positive numbers
        // No specific action needed here, will proceed to the loop.
      }

      var quotient = isThisUnsigned ? BigIntClass.UZERO : BigIntClass.ZERO;
      var currentDividend = this;

      // Generic division loop
      while (currentDividend.greaterThanOrEqual(other)) {
        var estimate = Math.max(1, Math.floor(currentDividend.toFloat() / other.toFloat()));
        var bitLength = Math.ceil(Math.log(estimate) / Math.LN2);
        var shiftAmount = bitLength <= 48 ? 1 : powerFunc(2, bitLength - 48);
        var partialQuotient = fromNumericValue(estimate, isThisUnsigned);
        var partialProduct = partialQuotient.multiply(other);

        // Adjust partialQuotient if partialProduct is too large
        while (partialProduct.isNegative() || partialProduct.greaterThan(currentDividend)) {
          partialQuotient = fromNumericValue(estimate -= shiftAmount, isThisUnsigned);
          partialProduct = partialQuotient.multiply(other);
        }

        if (partialQuotient.isValZero()) partialQuotient = BigIntClass.ONE; // Ensure at least 1 is added

        quotient = quotient.add(partialQuotient);
        currentDividend = currentDividend.subtract(partialProduct);
      }
      return quotient;
    };
    proto.div = proto.divide; // Alias

    proto.modulo = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      if (wasmInstance) {
        return createBigInt(
          (this.unsigned ? wasmInstance.rem_u : wasmInstance.rem_s)(this.low, this.high, other.low, other.high),
          wasmInstance.get_high(),
          this.unsigned
        );
      }
      // Fallback if WASM is not available
      return this.subtract(this.divide(other).multiply(other));
    };
    proto.mod = proto.modulo; // Alias
    proto.rem = proto.modulo; // Alias

    proto.bitwiseNot = function() { return createBigInt(~this.low, ~this.high, this.unsigned); };
    proto.not = proto.bitwiseNot; // Alias

    proto.bitwiseAnd = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      return createBigInt(this.low & other.low, this.high & other.high, this.unsigned);
    };
    proto.and = proto.bitwiseAnd; // Alias

    proto.bitwiseOr = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      return createBigInt(this.low | other.low, this.high | other.high, this.unsigned);
    };
    proto.or = proto.bitwiseOr; // Alias

    proto.bitwiseXor = function(other) {
      if (!isBigInt(other)) other = convertValue(other);
      return createBigInt(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    proto.xor = proto.bitwiseXor; // Alias

    proto.shiftLeft = function(numBits) {
      if (!isBigInt(numBits)) numBits = numBits | 0; // Ensure integer
      numBits &= 63; // Only consider shifts up to 63 bits
      if (numBits === 0) return this;
      if (numBits < 32) {
        return createBigInt(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
      }
      return createBigInt(0, this.low << (numBits - 32), this.unsigned);
    };
    proto.shl = proto.shiftLeft; // Alias

    proto.shiftRight = function(numBits) {
      if (!isBigInt(numBits)) numBits = numBits | 0;
      numBits &= 63;
      if (numBits === 0) return this;
      if (numBits < 32) {
        return createBigInt((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
      }
      return createBigInt(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    proto.shr = proto.shiftRight; // Alias (signed right shift)

    proto.shiftRightUnsigned = function(numBits) {
      if (!isBigInt(numBits)) numBits = numBits | 0;
      numBits &= 63;
      if (numBits === 0) return this;
      var highVal = this.high;
      if (numBits < 32) {
        return createBigInt((this.low >>> numBits) | (highVal << (32 - numBits)), highVal >>> numBits, this.unsigned);
      }
      // Shifting by 32 bits or more
      var newLow = (numBits === 32) ? highVal : (highVal >>> (numBits - 32));
      return createBigInt(newLow, 0, this.unsigned);
    };
    proto.shru = proto.shiftRightUnsigned; // Alias
    proto.shr_u = proto.shiftRightUnsigned; // Alias

    proto.toSigned = function() {
      return this.unsigned ? createBigInt(this.low, this.high, false) : this;
    };

    proto.toUnsigned = function() {
      return this.unsigned ? this : createBigInt(this.low, this.high, true);
    };

    proto.toBytes = function(isLittleEndian) {
      return isLittleEndian ? this.toBytesLE() : this.toBytesBE();
    };

    proto.toBytesLE = function() {
      var h = this.high;
      var l = this.low;
      return [
        l & 0xFF, (l >>> 8) & 0xFF, (l >>> 16) & 0xFF, (l >>> 24) & 0xFF,
        h & 0xFF, (h >>> 8) & 0xFF, (h >>> 16) & 0xFF, (h >>> 24) & 0xFF
      ];
    };

    proto.toBytesBE = function() {
      var h = this.high;
      var l = this.low;
      return [
        (h >>> 24), (h >>> 16) & 0xFF, (h >>> 8) & 0xFF, h & 0xFF,
        (l >>> 24), (l >>> 16) & 0xFF, (l >>> 8) & 0xFF, l & 0xFF
      ];
    };

    BigIntClass.fromBytes = function(byteArray, isUnsigned, isLittleEndian) {
      return isLittleEndian ? BigIntClass.fromBytesLE(byteArray, isUnsigned) : BigIntClass.fromBytesBE(byteArray, isUnsigned);
    };

    BigIntClass.fromBytesLE = function(byteArray, isUnsigned) {
      return new BigIntClass(
        byteArray[0] | (byteArray[1] << 8) | (byteArray[2] << 16) | (byteArray[3] << 24),
        byteArray[4] | (byteArray[5] << 8) | (byteArray[6] << 16) | (byteArray[7] << 24),
        isUnsigned
      );
    };

    BigIntClass.fromBytesBE = function(byteArray, isUnsigned) {
      return new BigIntClass(
        (byteArray[4] << 24) | (byteArray[5] << 16) | (byteArray[6] << 8) | byteArray[7],
        (byteArray[0] << 24) | (byteArray[1] << 16) | (byteArray[2] << 8) | byteArray[3],
        isUnsigned
      );
    };
  }
]);