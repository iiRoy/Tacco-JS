module.exports = function(moduleDefinitions) {
  // This object serves as a cache for modules that have already been loaded.
  var moduleCache = {};

  // The primary function responsible for loading modules by their ID.
  function loadModule(moduleId) {
    // If the module is already present in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If the module is not cached, create a new entry for it in the cache.
    // Each module entry contains its unique ID, a flag indicating if it's loaded,
    // and an empty exports object to be populated by the module's code.
    var currentModule = moduleCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's definition function.
    // The function receives the module object, its exports object, and the 'loadModule' function itself.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // After execution, mark the module as fully loaded.
    currentModule.isLoaded = true;

    // Return the exports of the newly loaded module.
    return currentModule.exports;
  }

  // Attach the collection of module definitions to the loader function for internal access.
  loadModule.moduleDefinitions = moduleDefinitions;
  // Attach the module cache to the loader function.
  loadModule.cache = moduleCache;

  // A utility function to define a getter property on an object.
  // This is used for lazy loading or exposing properties.
  loadModule.defineGetter = function(targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!loadModule.hasOwnProperty(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable so it appears in iteration.
        get: getterFunction // The function to execute when the property is accessed.
      });
    }
  };

  // A utility function to mark a module as an ECMAScript module.
  loadModule.registerESModule = function(targetModule) {
    // If Symbol and Symbol.toStringTag are supported, set the module's string tag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set the __esModule flag to true, indicating it's an ES module.
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  // A comprehensive interop function for handling various module types during 'require'.
  loadModule.interopRequire = function(moduleRef, flags) {
    // Flag 1: If set, 'moduleRef' is a module ID, so load it.
    if (1 & flags) {
      moduleRef = loadModule(moduleRef);
    }
    // Flag 8: If set, 'moduleRef' is already the desired export, return it directly.
    if (8 & flags) {
      return moduleRef;
    }
    // Flag 4: If set, and 'moduleRef' is an object and an ES module, return it directly.
    if (4 & flags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
      return moduleRef;
    }

    // Create a new plain object to serve as the interop object.
    var interopObject = Object.create(null);
    // Register this new object as an ES module.
    loadModule.registerESModule(interopObject);
    // Define a 'default' property on the interop object, pointing to the original 'moduleRef'.
    Object.defineProperty(interopObject, "default", {
      enumerable: true,
      value: moduleRef
    });

    // Flag 2: If set, and 'moduleRef' is not a string, copy all its properties to the interop object.
    if (2 & flags && typeof moduleRef !== "string") {
      for (var propName in moduleRef) {
        loadModule.defineGetter(interopObject, propName, (function(key) {
          return moduleRef[key];
        }).bind(null, propName));
      }
    }
    return interopObject;
  };

  // A utility function to retrieve the default export of a module.
  loadModule.getDefaultExport = function(moduleRef) {
    // Determine the getter function for the default export.
    // If 'moduleRef' is an ES module, use its 'default' property; otherwise, use 'moduleRef' itself.
    var defaultExportGetter = moduleRef && moduleRef.__esModule ?
      function() {
        return moduleRef.default;
      } :
      function() {
        return moduleRef;
      };
    // Define a property 'a' on the getter function itself, pointing to the default export.
    loadModule.defineGetter(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // A utility function to check if an object has a specific property directly (not inherited).
  loadModule.hasOwnProperty = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // The public path for assets, typically used for dynamic imports or resource loading.
  // It's an empty string in this configuration.
  loadModule.publicPath = "";

  // Set the entry point module ID and immediately load it to start the application.
  return loadModule(loadModule.entryModuleId = 0);
}([
  // Module 0: The main entry point of the application.
  function(modModule, modExports, modRequire) {
    // Load Module 1 (the core logic) and pass it the processed input from stdin.
    // The input is read from /dev/stdin, decoded as UTF-8, and split into an array of lines.
    modRequire(1)(modRequire(3).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },

  // Module 1: Contains the primary business logic for processing the input numbers.
  function(modModule, modExports, modRequire) {
    // A helper function to extract a fixed number of elements from an iterable,
    // mimicking array destructuring behavior.
    function extractArrayElements(inputArray, elementLimit) {
      // If the input is already an array, return it directly.
      if (Array.isArray(inputArray)) {
        return inputArray;
      }

      var collectedElements = []; // Array to store the extracted elements.
      var isDone = true; // Flag to track if iteration is complete.
      var hasError = false; // Flag to track if an error occurred during iteration.
      var errorObject = undefined; // Stores any error that occurs.

      try {
        // Obtain an iterator for the input array.
        for (var iteratorResult, arrayIterator = inputArray[Symbol.iterator](); !(isDone = (iteratorResult = arrayIterator.next()).done) && (collectedElements.push(iteratorResult.value), !elementLimit || collectedElements.length !== elementLimit); isDone = true) {
          // Loop continues until the iterator is done or the element limit is reached.
        }
      } catch (err) {
        hasError = true;
        errorObject = err;
      } finally {
        try {
          // If the iterator has a 'return' method and was not naturally done, call it for cleanup.
          if (!isDone && arrayIterator.return != null) {
            arrayIterator.return();
          }
        } finally {
          // If an error occurred, re-throw it after cleanup.
          if (hasError) {
            throw errorObject;
          }
        }
      }
      return collectedElements;
    }

    // Import the prime factorization utility from Module 2.
    var getPrimeFactors = modRequire(2);

    // The main function exported by this module, which processes the input lines.
    modModule.exports = function(inputLines) {
      // Take the first line of input, split it by space, convert parts to numbers,
      // and extract the first two numbers using the helper function.
      var parsedNumbers = extractArrayElements(inputLines[0].split(" ").map(function(strNum) {
        return Number(strNum);
      }), 2);

      var firstNumber = parsedNumbers[0]; // The first number from the input.
      var secondNumber = parsedNumbers[1]; // The second number from the input.

      // Check if the second number is not perfectly divisible by the first number.
      if (secondNumber % firstNumber !== 0) {
        // If not divisible, find the prime factors of the second number.
        var factorsOfSecond = getPrimeFactors(secondNumber);
        // Initialize 'smallestValidFactor' with 'secondNumber' itself.
        var smallestValidFactor = secondNumber;

        // Iterate through the prime factors found.
        for (var currentFactor in factorsOfSecond) {
          // Convert the factor key (which is a string) to a number for comparison.
          var numericFactor = Number(currentFactor);
          // Find the smallest prime factor that is greater than or equal to 'firstNumber'
          // and also smaller than the current 'smallestValidFactor'.
          if (numericFactor >= firstNumber && numericFactor < smallestValidFactor) {
            smallestValidFactor = numericFactor;
          }
        }
        // Calculate the final result using the determined smallest valid factor.
        var finalResult = secondNumber / smallestValidFactor;
        console.log(finalResult);
      } else {
        // If 'secondNumber' is perfectly divisible by 'firstNumber',
        // the result is simply their quotient.
        console.log(secondNumber / firstNumber);
      }
    };
  },

  // Module 2: Provides a function to compute the prime factorization of a given number.
  function(modModule, modExports) {
    modModule.exports = function(inputNumber) {
      var factorCounts = {}; // An object to store each prime factor and its count.
      var tempNumber = inputNumber; // A temporary variable to perform divisions.
      // Calculate the upper limit for checking divisors, which is the ceiling of the square root of the input number.
      var sqrtLimit = Math.ceil(Math.sqrt(inputNumber));

      // Iterate through potential divisors starting from 2 up to the calculated square root limit.
      for (var divisorCandidate = 2; divisorCandidate < sqrtLimit; divisorCandidate++) {
        var factorCount = 0; // Counter for how many times the current 'divisorCandidate' divides 'tempNumber'.
        // Continuously divide 'tempNumber' by 'divisorCandidate' as long as it's a factor.
        while (tempNumber % divisorCandidate === 0) {
          tempNumber /= divisorCandidate;
          factorCount++;
        }
        // If 'divisorCandidate' was a factor at least once, record its count.
        if (factorCount > 0) {
          factorCounts[divisorCandidate] = factorCount;
        }
        // An optimization: if 'tempNumber' becomes 0 or less (should not happen with positive input), break the loop.
        if (tempNumber <= 0) {
          break;
        }
      }
      // After the loop, if 'tempNumber' is still greater than 1, it means the remaining 'tempNumber'
      // itself is a prime factor (and it's greater than sqrtLimit).
      if (tempNumber > 1) {
        factorCounts[tempNumber] = 1;
      }
      return factorCounts; // Return the object containing all prime factors and their exponents.
    };
  },

  // Module 3: A simple module that exports the Node.js 'fs' (file system) built-in module.
  function(modModule, modExports) {
    modModule.exports = require("fs");
  }
]);
