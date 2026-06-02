/******/ (function(moduleDefinitions) { // This is the webpackBootstrap function, the entry point for the bundled modules.
/******/ 	// The module cache stores already loaded modules to prevent redundant loading.
/******/ 	var loadedModulesCache = {};
/******/
/******/ 	// The custom require function is responsible for loading modules.
/******/ 	function __webpack_require__(moduleIdentifier) {
/******/
/******/ 		// Check if the module is already in the cache.
/******/ 		if(loadedModulesCache[moduleIdentifier]) {
/******/ 			return loadedModulesCache[moduleIdentifier].exports;
/******/ 		}
/******/ 		// If not, create a new module entry in the cache.
/******/ 		var currentModule = loadedModulesCache[moduleIdentifier] = {
/******/ 			i: moduleIdentifier, // Module ID
/******/ 			l: false,            // Loaded flag, initially false
/******/ 			exports: {}          // Module exports object
/******/ 		};
/******/
/******/ 		// Execute the module function with its context (this, exports, require).
/******/ 		moduleDefinitions[moduleIdentifier].call(currentModule.exports, currentModule, currentModule.exports, __webpack_require__);
/******/
/******/ 		// Mark the module as loaded after execution.
/******/ 		currentModule.l = true;
/******/
/******/ 		// Return the exports of the module.
/******/ 		return currentModule.exports;
/******/ 	}
/******/
/******/
/******/ 	// Expose the modules object (__webpack_modules__) on the require function.
/******/ 	__webpack_require__.m = moduleDefinitions;
/******/
/******/ 	// Expose the module cache on the require function.
/******/ 	__webpack_require__.c = loadedModulesCache;
/******/
/******/ 	// Define a getter function for harmony exports (ESM compatibility).
/******/ 	__webpack_require__.d = function(exportsObject, propertyName, getterFunction) {
/******/ 		if(!__webpack_require__.o(exportsObject, propertyName)) {
/******/ 			Object.defineProperty(exportsObject, propertyName, { enumerable: true, get: getterFunction });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __esModule on exports for ES module identification.
/******/ 	__webpack_require__.r = function(exportsObject) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exportsObject, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a fake namespace object for module interoperability.
/******/ 	// mode & 1: value is a module id, require it.
/******/ 	// mode & 2: merge all properties of value into the namespace.
/******/ 	// mode & 4: return value when already a namespace object.
/******/ 	// mode & 8|1: behave like require.
/******/ 	__webpack_require__.t = function(valueToProcess, processingMode) {
/******/ 		if(processingMode & 1) valueToProcess = __webpack_require__(valueToProcess);
/******/ 		if(processingMode & 8) return valueToProcess;
/******/ 		if((processingMode & 4) && typeof valueToProcess === 'object' && valueToProcess && valueToProcess.__esModule) return valueToProcess;
/******/ 		var namespaceObject = Object.create(null);
/******/ 		__webpack_require__.r(namespaceObject);
/******/ 		Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: valueToProcess });
/******/ 		if(processingMode & 2 && typeof valueToProcess != 'string') for(var keyName in valueToProcess) __webpack_require__.d(namespaceObject, keyName, function(keyName) { return valueToProcess[keyName]; }.bind(null, keyName));
/******/ 		return namespaceObject;
/******/ 	};
/******/
/******/ 	// GetDefaultExport function for compatibility with non-harmony modules.
/******/ 	__webpack_require__.n = function(moduleObject) {
/******/ 		var exportGetter = moduleObject && moduleObject.__esModule ?
/******/ 			function retrieveDefaultExport() { return moduleObject['default']; } :
/******/ 			function retrieveModuleExports() { return moduleObject; };
/******/ 		__webpack_require__.d(exportGetter, 'a', exportGetter);
/******/ 		return exportGetter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call check for properties.
/******/ 	__webpack_require__.o = function(targetObject, propertyKey) { return Object.prototype.hasOwnProperty.call(targetObject, propertyKey); };
/******/
/******/ 	// Public path for assets.
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load the entry module and return its exports.
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/panasonic2020/C.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/panasonic2020/C.js":
/*!********************************!*\
  *** ./src/panasonic2020/C.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function _slicedToArray(inputArr, idx) { return _arrayWithHoles(inputArr) || _iterableToArrayLimit(inputArr, idx) || _nonIterableRest(); }\\n\\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\\n\\nfunction _iterableToArrayLimit(inputArr, limit) { if (!(Symbol.iterator in Object(inputArr) || Object.prototype.toString.call(inputArr) === \"[object Arguments]\")) { return; } var tempArray = []; var isDone = true; var hasError = false; var errorVal = undefined; try { for (var iterator = inputArr[Symbol.iterator](), currentItem; !(isDone = (currentItem = iterator.next()).done); isDone = true) { tempArray.push(currentItem.value); if (limit && tempArray.length === limit) break; } } catch (err) { hasError = true; errorVal = err; } finally { try { if (!isDone && iterator[\"return\"] != null) iterator[\"return\"](); } finally { if (hasError) throw errorVal; } } return tempArray; }\\n\\nfunction _arrayWithHoles(inputArr) { if (Array.isArray(inputArr)) return inputArr; }\\n\\nvar fileSystemModule = __webpack_require__(/*! fs */ \"fs\");\\n\\nvar processInputData = function processInputData(rawInputString) {\\n  var numericValuesFromInput = rawInputString.split('\\n')[0].split(' ').map(function (stringValue) {\\n    return Number(stringValue);\\n  });\\n\\n  var destructuredNumericValues = _slicedToArray(numericValuesFromInput, 3);\\n  var firstVal = destructuredNumericValues[0];\\n  var secondVal = destructuredNumericValues[1];\\n  var thirdVal = destructuredNumericValues[2];\\n\\n  firstVal = Math.round(Math.sqrt(firstVal) * 10.0);\\n  firstVal = firstVal / 10.0;\\n  secondVal = Math.round(Math.sqrt(secondVal) * 10.0);\\n  secondVal = secondVal / 10.0;\\n  thirdVal = Math.round(Math.sqrt(thirdVal) * 10.0);\\n  thirdVal = thirdVal / 10.0;\\n\\n  var comparisonResult = firstVal + secondVal < thirdVal;\\n\\n  if (comparisonResult) {\\n    console.log('Yes');\\n  } else {\\n    console.log('No');\\n  }\\n};\\n\\nprocessInputData(fileSystemModule.readFileSync('/dev/stdin', 'utf8'));\\n\\n//# sourceURL=webpack:///./src/panasonic2020/C.js?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  *** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\\n\\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ })

/******/ });
