module.exports = function(moduleDefinitions) {
  // This object serves as a cache for modules that have already been loaded.
  var moduleCache = {};

  // The primary function responsible for loading modules.
  // It takes a module's unique identifier and returns its exported values.
  function loadModule(moduleId) {
    // If the module is already present in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If the module is not cached, create a new module object.
    // This object is then stored in the cache and initialized with its ID,
    // a 'loaded' flag, and an empty exports object.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's definition function. This function is expected to
    // populate the 'exports' property of the 'currentModule' object.
    // The 'call' method ensures the correct 'this' context and passes
    // the module object, its exports, and the 'loadModule' function itself.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // After execution, mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the exports of the newly loaded module.
    return currentModule.exports;
  }

  // Attach the array of module definitions to the loader function for internal access.
  loadModule.moduleDefinitions = moduleDefinitions;

  // Attach the module cache to the loader function.
  loadModule.cache = moduleCache;

  // A utility function to define a getter for a specific property on an object.
  // This is often used for compatibility with ES Modules to expose named exports.
  loadModule.defineGetter = function(targetObject, propertyKey, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!loadModule.hasOwn(targetObject, propertyKey)) {
      Object.defineProperty(targetObject, propertyKey, {
        enumerable: true, // Make the property visible during enumeration (e.g., in for...in loops).
        get: getterFunction // The function to call when the property is accessed.
      });
    }
  };

  // A utility function to mark an object as an ES Module.
  // This involves setting the Symbol.toStringTag and __esModule properties.
  loadModule.markAsEsModule = function(targetObject) {
    // If the Symbol.toStringTag is supported, set its value to "Module".
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set the __esModule property to true, a common convention for ES Modules.
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  // A utility function to create a namespace object from a module reference,
  // handling various ES Module compatibility flags.
  loadModule.createNamespaceObject = function(moduleRef, modeFlags) {
    // If the first bit of modeFlags is set (1 & modeFlags),
    // it means moduleRef is a module ID, so load it.
    if (1 & modeFlags) {
      moduleRef = loadModule(moduleRef);
    }
    // If the eighth bit is set (8 & modeFlags), return moduleRef directly.
    if (8 & modeFlags) {
      return moduleRef;
    }
    // If the fourth bit is set (4 & modeFlags) and moduleRef is an object
    // that is already marked as an ES Module, return it directly.
    if (4 & modeFlags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
      return moduleRef;
    }

    // Otherwise, create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    loadModule.markAsEsModule(namespaceObject); // Mark the new object as an ES Module.
    // Define a 'default' export property pointing to the original moduleRef.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleRef
    });

    // If the second bit is set (2 & modeFlags) and moduleRef is not a string,
    // iterate over its properties and define getters for them on the namespace object.
    if (2 & modeFlags && typeof moduleRef !== "string") {
      for (var propName in moduleRef) {
        loadModule.defineGetter(namespaceObject, propName, (function(key) {
          return moduleRef[key];
        }).bind(null, propName));
      }
    }
    return namespaceObject;
  };

  // A utility function to get the default export of a module.
  // It returns a function that, when called, provides the default export.
  loadModule.getDefaultExport = function(moduleRef) {
    var getterFunction = moduleRef && moduleRef.__esModule ?
      // If it's an ES Module, return its 'default' property.
      function() {
        return moduleRef.default;
      } :
      // Otherwise, return the module reference itself as the default.
      function() {
        return moduleRef;
      };
    // Define a getter 'a' on the returned function, pointing to itself.
    // This is a common pattern for accessing the default export.
    loadModule.defineGetter(getterFunction, "a", getterFunction);
    return getterFunction;
  };

  // A utility function to check if an object has a specific property as its own property.
  loadModule.hasOwn = function(targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // The public path for assets, typically used for dynamic imports or asset loading.
  // It's an empty string in this configuration.
  loadModule.publicPath = "";

  // Set the entry module ID (usually 0) and then load it to start the application.
  return loadModule(loadModule.entryModuleId = 0);
}(
  // The array containing all module definition functions.
  [
    // Module 0: The application's entry point.
    function(moduleObj, exportsObj, requireFunc) {
      // This module reads input from standard input and passes it to the main logic module.
      requireFunc(1)(requireFunc(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module 1: Contains the core algorithm for solving the water and sugar problem.
    function(moduleExports, exportsObject) {
      // A helper function to safely destructure an array or an iterable.
      // It handles both actual arrays and iterables, with an optional limit.
      function destructureArray(inputArray, limitCount) {
        // If the input is already an array, return it directly.
        if (Array.isArray(inputArray)) {
          return inputArray;
        }

        // Initialize variables for iterating and collecting elements.
        var extractedElements = [];
        var isDone = true;
        var hasError = false;
        var errorValue = undefined;
        try {
          // Get the iterator for the input array.
          for (var iteratorResult, arrayIterator = inputArray[Symbol.iterator](); !(isDone = (iteratorResult = arrayIterator.next()).done) && (extractedElements.push(iteratorResult.value), !limitCount || extractedElements.length !== limitCount); isDone = true) {}
        } catch (err) {
          // Catch any errors that occur during iteration.
          hasError = true;
          errorValue = err;
        } finally {
          try {
            // If the iterator has a 'return' method and was not fully consumed, call it to clean up.
            if (!isDone && arrayIterator.return != null) {
              arrayIterator.return();
            }
          } finally {
            // If an error was caught, re-throw it after cleanup.
            if (hasError) {
              throw errorValue;
            }
          }
        }
        return extractedElements;
      }

      // The main function exported by this module. It takes an input string.
      moduleExports.exports = function(inputString) {
        // Parse the input string:
        // 1. Split by newline to get the first line.
        // 2. Split the first line by space.
        // 3. Map each string part to a Number.
        // 4. Destructure the first 6 numbers into 'parsedInputs'.
        var parsedInputs = destructureArray(
          inputString.split("\n")[0].split(" ").map(function(valStr) {
            return Number(valStr);
          }),
          6
        );

        // Assign the parsed input values to more descriptive variables.
        var waterFactorA = parsedInputs[0]; // A: Amount of water for first type of water addition
        var waterFactorB = parsedInputs[1]; // B: Amount of water for second type of water addition
        var sugarFactorA = parsedInputs[2]; // C: Amount of sugar for first type of sugar addition
        var sugarFactorB = parsedInputs[3]; // D: Amount of sugar for second type of sugar addition
        var maxSugarRatio = parsedInputs[4]; // E: Maximum sugar ratio (e.g., 10 for 10%)
        var maxTotalWeight = parsedInputs[5]; // F: Maximum total weight of the solution

        // Calculate the maximum allowed sugar percentage based on maxSugarRatio (E).
        // The formula is E / (100 + E) * 100.
        var maxSugarPercentage = 100 * maxSugarRatio / (100 + maxSugarRatio);

        // An object to store visited states (combinations of water and sugar)
        // to prevent redundant calculations and infinite loops in the BFS.
        var visitedStates = {};

        // An object to keep track of the best solution found so far,
        // initialized with zero water, zero sugar, and zero percentage.
        var bestSolution = {
          water: 0,
          sugar: 0,
          percentage: 0
        };

        // A queue for the Breadth-First Search (BFS) algorithm.
        // It starts with an initial state of no water and no sugar.
        var solutionQueue = [{
          water: 0,
          sugar: 0
        }];

        // Begin the BFS traversal. The loop continues as long as there are states in the queue.
        while (solutionQueue.length > 0) {
          // Dequeue the current state to process.
          var currentState = solutionQueue.shift();

          // Calculate the total weight of the current solution.
          var currentTotalWeight = currentState.water + currentState.sugar;

          // Create a unique string key for the current state (e.g., "water-sugar").
          var stateKey = `${currentState.water}-${currentState.sugar}`;

          // Skip this state if:
          // 1. Its total weight exceeds the maximum allowed total weight (F).
          // 2. This specific state (water-sugar combination) has already been visited.
          if (currentTotalWeight > maxTotalWeight || visitedStates[stateKey] === 1) {
            continue;
          }

          // Mark the current state as visited.
          visitedStates[stateKey] = 1;

          // Calculate the current sugar percentage. Handle the case where water is zero
          // to avoid division by zero, resulting in 0% sugar.
          var currentSugarPercentage = (currentState.water === 0) ? 0 : (100 * currentState.sugar / currentTotalWeight);

          // If the current sugar percentage is greater than the best found so far,
          // AND it does not exceed the maximum allowed sugar percentage,
          // update the best solution.
          if (currentSugarPercentage > bestSolution.percentage && currentSugarPercentage <= maxSugarPercentage) {
            bestSolution.percentage = currentSugarPercentage;
            bestSolution.water = currentState.water;
            bestSolution.sugar = currentState.sugar;
          }

          // Explore new possible states by adding water or sugar according to the given factors.
          // Add water using factor A (100 * A).
          solutionQueue.push({
            water: currentState.water + 100 * waterFactorA,
            sugar: currentState.sugar
          });
          // Add water using factor B (100 * B).
          solutionQueue.push({
            water: currentState.water + 100 * waterFactorB,
            sugar: currentState.sugar
          });
          // Add sugar using factor C.
          solutionQueue.push({
            water: currentState.water,
            sugar: currentState.sugar + sugarFactorA
          });
          // Add sugar using factor D.
          solutionQueue.push({
            water: currentState.water,
            sugar: currentState.sugar + sugarFactorB
          });
        }

        // Handle an edge case: If no valid sugar solution was found (bestSolution remains 0 water, 0 sugar),
        // default to a solution with only water, specifically 100 * A amount of water.
        if (bestSolution.water === 0 && bestSolution.sugar === 0) {
          bestSolution.water = 100 * waterFactorA;
        }

        // Output the total weight (water + sugar) and the amount of sugar
        // in the best found solution, separated by a space.
        console.log(`${bestSolution.water + bestSolution.sugar} ${bestSolution.sugar}`);
      };
    },

    // Module 2: Provides access to Node.js's built-in 'fs' (file system) module.
    function(moduleObj, exportsObj) {
      moduleObj.exports = require("fs");
    }
  ]
);
