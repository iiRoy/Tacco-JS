/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
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

eval("function _extractArrayParts(inputArray, limitCount) { return _checkArrayHoles(inputArray) || _limitIterableToArray(inputArray, limitCount) || _handleNonIterable(); }\n\nfunction _handleNonIterable() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _limitIterableToArray(inputArray, limitCount) { if (!(Symbol.iterator in Object(inputArray) || Object.prototype.toString.call(inputArray) === \"[object Arguments]\")) { return; } var tempArray = []; var notDone = true; var hadError = false; var caughtError = undefined; try { for (var iteratorObj = inputArray[Symbol.iterator](), stepResult; !(notDone = (stepResult = iteratorObj.next()).done); notDone = true) { tempArray.push(stepResult.value); if (limitCount && tempArray.length === limitCount) break; } } catch (err) { hadError = true; caughtError = err; } finally { try { if (!notDone && iteratorObj[\"return\"] != null) iteratorObj[\"return\"](); } finally { if (hadError) throw caughtError; } } return tempArray; }\n\nfunction _checkArrayHoles(inputArray) { if (Array.isArray(inputArray)) return inputArray; }\n\n// Import the file system module for reading input.\nvar fs = __webpack_require__(/*! fs */ \"fs\");\n\n// Define a constant for an invalid result.\nvar INVALID_RESULT = -1;\n\n// Main function to process the input and determine the number.\nvar processInput = function processInput(rawData) {\n  // Split the raw input into individual lines.\n  var inputLines = rawData.split('\\n');\n\n  // Parse the first line to get the number of digits (numDigits) and constraints (numConstraints).\n  var firstLineParsed = inputLines.shift().split(' ').map(function (valStr) {\n    return valStr - 0;\n  });\n  var firstLineValues = _extractArrayParts(firstLineParsed, 2);\n  var numDigits = firstLineValues[0];\n  var numConstraints = firstLineValues[1];\n\n  // Initialize an array to store the digits, with -1 indicating an unassigned digit.\n  var digitPlaceholders = [];\n  for (var idx = 0; idx < numDigits; idx++) {\n    digitPlaceholders.push(INVALID_RESULT);\n  }\n\n  // Process each constraint.\n  for (var constraintIdx = 0; constraintIdx < numConstraints; constraintIdx++) {\n    // Parse the current constraint line.\n    var currentConstraintParsed = inputLines.shift().split(' ').map(function (valStr) {\n      return valStr - 0;\n    });\n    var currentConstraintValues = _extractArrayParts(currentConstraintParsed, 2);\n    var position = currentConstraintValues[0];\n    var digitValue = currentConstraintValues[1];\n\n    // Adjust position to be 0-indexed.\n    var targetPosition = position - 1;\n\n    // Check for conflicting constraints.\n    if (digitPlaceholders[targetPosition] !== INVALID_RESULT && digitPlaceholders[targetPosition] !== digitValue) {\n      console.log(INVALID_RESULT);\n      return;\n    }\n\n    // Apply the constraint.\n    digitPlaceholders[targetPosition] = digitValue;\n  }\n\n  // Handle special conditions for multi-digit numbers.\n  if (numDigits >= 2) {\n    // If the first digit is 0, it's invalid for numbers with 2 or more digits.\n    if (digitPlaceholders[0] === 0) {\n      console.log(INVALID_RESULT);\n      return;\n    }\n\n    // If the first digit is still unassigned, it's also invalid (should be at least 1).\n    // This condition seems to be a specific problem requirement, as it implies a leading zero for unassigned first digit.\n    if (digitPlaceholders[0] === INVALID_RESULT) {\n      console.log(INVALID_RESULT);\n      return;\n    }\n\n    // Fill any remaining unassigned digits with 0.\n    for (var fillIdx = 0; fillIdx < numDigits; fillIdx++) {\n      if (digitPlaceholders[fillIdx] === INVALID_RESULT) {\n        digitPlaceholders[fillIdx] = 0;\n      }\n    }\n  } else { // Case for a single-digit number (numDigits === 1).\n    // If the single digit is unassigned, set it to 0.\n    if (digitPlaceholders[0] === INVALID_RESULT) {\n      digitPlaceholders[0] = 0;\n    }\n  }\n\n  // Output the resulting number by joining the digits.\n  console.log(digitPlaceholders.join(''));\n};\n\n// Read input from stdin and pass it to the main processing function.\nprocessInput(fs.readFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/ABC157/C.js?");

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
