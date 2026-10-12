/******/ (function(moduleList) { // This is the primary module loading function.
/******/ 	// The internal cache for all loaded modules.
/******/ 	var loadedModulesCache = {};
/******/
/******/ 	// The core function to require a module.
/******/ 	function __webpack_require__(moduleIdentifier) {
/******/
/******/ 		// Check if the module is already present in the cache.
/******/ 		if(loadedModulesCache[moduleIdentifier]) {
/******/ 			return loadedModulesCache[moduleIdentifier].exports;
/******/ 		}
/******/ 		// Create a new module entry (and store it in the cache).
/******/ 		var currentModule = loadedModulesCache[moduleIdentifier] = {
/******/ 			i: moduleIdentifier, // The unique ID for this module.
/******/ 			l: false,            // A flag indicating if the module has finished loading.
/******/ 			exports: {}          // The object that will hold the module's exports.
/******/ 		};
/******/
/******/ 		// Execute the module's function, providing context and the require function.
/******/ 		moduleList[moduleIdentifier].call(currentModule.exports, currentModule, currentModule.exports, __webpack_require__);
/******/
/******/ 		// Mark the module as fully loaded.
/******/ 		currentModule.l = true;
/******/
/******/ 		// Return the exports of the module.
/******/ 		return currentModule.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the module definitions object.
/******/ 	__webpack_require__.m = moduleList;
/******/
/******/ 	// Expose the module cache.
/******/ 	__webpack_require__.c = loadedModulesCache;
/******/
/******/ 	// Define a getter function for harmony exports (ESM compatibility).
/******/ 	__webpack_require__.d = function(exportedObject, exportName, valueGetter) {
/******/ 		if(!__webpack_require__.o(exportedObject, exportName)) {
/******/ 			Object.defineProperty(exportedObject, exportName, { enumerable: true, get: valueGetter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __esModule on exports for ESM compatibility.
/******/ 	__webpack_require__.r = function(exportedObject) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exportedObject, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exportedObject, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a simulated namespace object for ESM compatibility.
/******/ 	// mode & 1: value is a module ID, require it.
/******/ 	// mode & 2: merge all properties of value into the namespace.
/******/ 	// mode & 4: return value if it's already a namespace object.
/******/ 	// mode & 8|1: behave like a direct require.
/******/ 	__webpack_require__.t = function(valueToProcess, processingMode) {
/******/ 		if(processingMode & 1) valueToProcess = __webpack_require__(valueToProcess);
/******/ 		if(processingMode & 8) return valueToProcess;
/******/ 		if((processingMode & 4) && typeof valueToProcess === 'object' && valueToProcess && valueToProcess.__esModule) return valueToProcess;
/******/ 		var newNamespace = Object.create(null);
/******/ 		__webpack_require__.r(newNamespace);
/******/ 		Object.defineProperty(newNamespace, 'default', { enumerable: true, value: valueToProcess });
/******/ 		if(processingMode & 2 && typeof valueToProcess != 'string') for(var propKey in valueToProcess) __webpack_require__.d(newNamespace, propKey, function(propKey) { return valueToProcess[propKey]; }.bind(null, propKey));
/******/ 		return newNamespace;
/******/ 	};
/******/
/******/ 	// Get default export function for compatibility with non-harmony modules.
/******/ 	__webpack_require__.n = function(moduleObject) {
/******/ 		var propertyGetter = moduleObject && moduleObject.__esModule ?
/******/ 			function retrieveDefault() { return moduleObject['default']; } :
/******/ 			function retrieveModuleExports() { return moduleObject; };
/******/ 		__webpack_require__.d(propertyGetter, 'a', propertyGetter);
/******/ 		return propertyGetter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call wrapper for convenience.
/******/ 	__webpack_require__.o = function(targetObject, propertyName) { return Object.prototype.hasOwnProperty.call(targetObject, propertyName); };
/******/
/******/ 	// Public path for assets (empty in this case).
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load the entry module and return its exports, initiating the application.
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ABC157/C.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ABC157/C.js":
/*!*************************!*\
  !*** ./src/ABC157/C.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nvar fileSystem = __webpack_require__(/*! fs */ \"fs\");\n\nvar INVALID_RESULT = -1;\n\nvar processInput = function processInput(rawData) {\n  var inputLines = rawData.split('\\n');\n\n  // Extract N (number of digits) and M (number of conditions) from the first line.\n  var _inputLines$shift$split$map = inputLines.shift().split(' ').map(function (numericString) {\n    return numericString - 0;\n  }),\n      _inputLines$shift$split$map2 = _slicedToArray(_inputLines$shift$split$map, 2),\n      numDigits = _inputLines$shift$split$map2[0],\n      numConditions = _inputLines$shift$split$map2[1];\n\n  // Initialize an array to hold the digits, using -1 to denote an unset digit.\n  var digitCandidates = [];\n\n  for (var idx = 0; idx < numDigits; idx++) {\n    digitCandidates.push(-1);\n  }\n\n  // Iterate through each condition provided.\n  for (var _i2 = 0; _i2 < numConditions; _i2++) {\n    var _inputLines$shift$split$map3 = inputLines.shift().split(' ').map(function (numericString) {\n      return numericString - 0;\n    }),\n        _inputLines$shift$split$map4 = _slicedToArray(_inputLines$shift$split$map3, 2),\n        position = _inputLines$shift$split$map4[0],\n        value = _inputLines$shift$split$map4[1];\n\n    var targetIndex = position - 1; // Convert 1-based position to 0-based array index.\n\n    // Check for conflicting conditions for the same digit position.\n    if (digitCandidates[targetIndex] !== -1 && digitCandidates[targetIndex] !== value) {\n      console.log(INVALID_RESULT);\n      return;\n    }\n\n    // Apply the current condition to the digit candidate array.\n    digitCandidates[targetIndex] = value;\n  }\n\n  // Check for specific invalid scenarios related to the first digit.\n  // If the first digit is 0, it's considered invalid by the original logic.\n  if (digitCandidates[0] === 0) {\n    console.log(INVALID_RESULT);\n    return;\n  }\n\n  // If the first digit is still unknown (-1), it's also considered invalid by the original logic.\n  if (digitCandidates[0] === -1) {\n    console.log(INVALID_RESULT);\n    return;\n  }\n\n  // Fill any remaining unset digits with 0.\n  for (var _i3 = 0; _i3 < numDigits; _i3++) {\n    if (digitCandidates[_i3] === -1) {\n      digitCandidates[_i3] = 0;\n    }\n  }\n\n  // Output the final number by concatenating the digits.\n  console.log(digitCandidates.join(''));\n};\n\n// Read the entire input from standard input and pass it to the processing function.\nprocessInput(fileSystem.readFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/ABC157/C.js?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ })

/******/ });
