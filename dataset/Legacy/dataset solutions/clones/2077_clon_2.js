/******/ (function(moduleDefinitions) { // This is the primary webpack bootstrap function
/******/ 	// A cache for storing already loaded modules
/******/ 	var loadedModules = {};
/******/
/******/ 	// The internal module require function
/******/ 	function __webpack_require__(moduleIdentifier) {
/******/
/******/ 		// Check if the module is already in the cache
/******/ 		if(loadedModules[moduleIdentifier]) {
/******/ 			return loadedModules[moduleIdentifier].exports;
/******/ 		}
/******/ 		// Create a new module entry (and store it in the cache)
/******/ 		var currentModule = loadedModules[moduleIdentifier] = {
/******/ 			i: moduleIdentifier, // Module ID
/******/ 			l: false, // Load status flag
/******/ 			exports: {} // Exported values
/******/ 		};
/******/
/******/ 		// Execute the module's function with its context
/******/ 		moduleDefinitions[moduleIdentifier].call(currentModule.exports, currentModule, currentModule.exports, __webpack_require__);
/******/
/******/ 		// Mark the module as fully loaded
/******/ 		currentModule.l = true;
/******/
/******/ 		// Return the module's exports
/******/ 		return currentModule.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the collection of module definitions
/******/ 	__webpack_require__.m = moduleDefinitions;
/******/
/******/ 	// Expose the module cache
/******/ 	__webpack_require__.c = loadedModules;
/******/
/******/ 	// Define a getter function for harmony exports
/******/ 	__webpack_require__.d = function(outputObject, exportName, valueGetter) {
/******/ 		if(!__webpack_require__.o(outputObject, exportName)) {
/******/ 			Object.defineProperty(outputObject, exportName, { enumerable: true, get: valueGetter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __esModule on exports for ES module compatibility
/******/ 	__webpack_require__.r = function(outputObject) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(outputObject, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(outputObject, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a fake namespace object for module interoperability
/******/ 	// mode & 1: value is a module ID, require it
/******/ 	// mode & 2: merge all properties of value into the namespace object
/******/ 	// mode & 4: return value when it's already a namespace object
/******/ 	// mode & 8|1: behave like a standard require call
/******/ 	__webpack_require__.t = function(sourceValue, operationMode) {
/******/ 		if(operationMode & 1) sourceValue = __webpack_require__(sourceValue);
/******/ 		if(operationMode & 8) return sourceValue;
/******/ 		if((operationMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) return sourceValue;
/******/ 		var namespaceObject = Object.create(null);
/******/ 		__webpack_require__.r(namespaceObject);
/******/ 		Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: sourceValue });
/******/ 		if(operationMode & 2 && typeof sourceValue != 'string') for(var propertyKey in sourceValue) __webpack_require__.d(namespaceObject, propertyKey, function(key) { return sourceValue[key]; }.bind(null, propertyKey));
/******/ 		return namespaceObject;
/******/ 	};
/******/
/******/ 	// Get default export function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(targetModule) {
/******/ 		var defaultGetter = targetModule && targetModule.__esModule ?
/******/ 			function getDefault() { return targetModule['default']; } :
/******/ 			function getModuleExports() { return targetModule; };
/******/ 		__webpack_require__.d(defaultGetter, 'a', defaultGetter);
/******/ 		return defaultGetter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call shorthand
/******/ 	__webpack_require__.o = function(targetObject, propertyKey) { return Object.prototype.hasOwnProperty.call(targetObject, propertyKey); };
/******/
/******/ 	// Public path for assets
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load the entry module and return its exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/panasonic2020/D.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/panasonic2020/D.js":
/*!********************************!*\
  !*** ./src/panasonic2020/D.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval(`
  // Import the file system module using webpack's internal require
  var fileSystemUtility = __webpack_require__(/*! fs */ "fs");

  // Define the character set for string generation
  var characterPool = "abcdefghijklmnopqrstuvwxyz".split("");
  // Initialize the desired string length, defaults to 0
  var desiredLength = 0;

  // Recursive function to generate and print combinations
  var generateCombinations = function generateCombinations(currentSequence, maxCharacterIndex) {
    // Base case: if the current sequence reaches the desired length, print it to console
    if (currentSequence.length === desiredLength) {
      console.log(currentSequence);
      return;
    }

    // Determine the limiting character based on the maximum character index allowed
    var limitingCharacter = characterPool[maxCharacterIndex];

    // Iterate through characters up to the limiting character's index plus one
    for (var charIterator = 0; charIterator <= characterPool.indexOf(limitingCharacter) + 1; charIterator++) {
      // Create a temporary sequence by copying the current one
      var temporarySequence = currentSequence;
      // Append the next character from the pool based on the iterator
      temporarySequence += characterPool[charIterator];
      // Recursively call with the new sequence and an updated maximum character index
      generateCombinations(temporarySequence, Math.max(characterPool.indexOf(limitingCharacter), charIterator));
    }
  };

  // Main function to process the input data and initiate the generation process
  var processEntry = function processEntry(rawInputData) {
    // Extract the desired length from the first line of the input, converting it to a number
    desiredLength = rawInputData.split("\\n")[0] - 0;
    // Start the combination generation with an empty string and an initial max index of -1
    generateCombinations("", -1);
  };

  // Read input from standard input and pass it to the main processing function
  processEntry(fileSystemUtility.readFileSync("/dev/stdin", "utf8"));

  //# sourceURL=webpack:///./src/panasonic2020/D.js?
`);

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval(`
  module.exports = require("fs"); // Export the Node.js file system module

  //# sourceURL=webpack:///external_%22fs%22?
`);

/***/ })

/******/ });
