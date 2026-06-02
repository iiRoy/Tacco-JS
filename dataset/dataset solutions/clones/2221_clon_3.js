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
/******/
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
/******/ 		if(mode & 2 && typeof value != 'string') {
/******/ 			for(var key in value) {
/******/ 				__webpack_require__.d(ns, key, function(key) {
/******/ 					return value[key];
/******/ 				}.bind(null, key));
/******/ 			}
/******/ 		}
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
/******/ 	__webpack_require__.o = function(object, property) {
/******/ 		return Object.prototype.hasOwnProperty.call(object, property);
/******/ 	};
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ABC152/D.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/big-integer/BigInteger.js":
/*!************************************************!*\
  !*** ./node_modules/big-integer/BigInteger.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(module) {\nvar bigInt = function(value) {\n  return value;\n};\n\nmodule.exports = bigInt;\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./node_modules/big-integer/BigInteger.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function(module) {\n\tif (!module.webpackPolyfill) {\n\t\tmodule.deprecate = function() {};\n\t\tmodule.paths = [];\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/module.js?");

/***/ }),

/***/ "./src/ABC152/D.js":
/*!*************************!*\
  !*** ./src/ABC152/D.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar bigInt = __webpack_require__(/*! big-integer */ \"./node_modules/big-integer/BigInteger.js\");\n\nfunction readLimitFromInput(rawInput) {\n  // Conserva el split original sin trim para mantener el comportamiento observable del bundle.\n  var lines = rawInput.split('\\n');\n\n  // Conserva la conversión original con i - 0.\n  var firstLineParts = lines[0].split(' ').map(function(value) {\n    return value - 0;\n  });\n\n  return {\n    lines: lines,\n    limit: firstLineParts[0]\n  };\n}\n\nfunction getDigitPairKey(numberValue, reversed) {\n  // Conserva la estrategia original: convertir el número a string y partirlo en caracteres.\n  var characters = String(numberValue).split('');\n\n  var firstDigit = characters[0];\n  var lastDigit = characters[characters.length - 1];\n\n  // Si reversed es true, produce tail + head; si no, produce head + tail.\n  if (reversed) {\n    return lastDigit + firstDigit;\n  }\n\n  return firstDigit + lastDigit;\n}\n\nfunction ensureCounterSlot(counterObject, keyName) {\n  // Conserva el comportamiento de inicializar solo cuando la clave no existe.\n  if (counterObject[keyName] === undefined) {\n    counterObject[keyName] = 0;\n  }\n}\n\nfunction increasePairFrequency(counterObject, keyName) {\n  ensureCounterSlot(counterObject, keyName);\n  counterObject[keyName]++;\n}\n\nfunction buildForwardPairFrequencies(limit) {\n  // Igual que el original, usa un objeto plano como tabla de frecuencias.\n  var frequencyTable = {};\n\n  for (var currentNumber = 1; currentNumber <= limit; currentNumber++) {\n    var forwardKey = getDigitPairKey(currentNumber, false);\n    increasePairFrequency(frequencyTable, forwardKey);\n  }\n\n  return frequencyTable;\n}\n\nfunction countMatchingReversePairs(limit, frequencyTable) {\n  var totalMatches = 0;\n\n  for (var currentNumber = 1; currentNumber <= limit; currentNumber++) {\n    var reverseKey = getDigitPairKey(currentNumber, true);\n\n    if (frequencyTable[reverseKey] !== undefined) {\n      totalMatches += frequencyTable[reverseKey];\n    }\n  }\n\n  return totalMatches;\n}\n\nvar main = function main(input) {\n  var parsedInput = readLimitFromInput(input);\n  var N = parsedInput.limit;\n\n  var freq = buildForwardPairFrequencies(N);\n  var answer = countMatchingReversePairs(N, freq);\n\n  console.log(answer);\n};\n\nmain(fs.readFileSync('/dev/stdin', 'utf8'));\n\n//# sourceURL=webpack:///./src/ABC152/D.js?");

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