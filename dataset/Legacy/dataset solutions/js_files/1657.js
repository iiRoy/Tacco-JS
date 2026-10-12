/*! path: /home/ts3min/work/tspro/src/contest/atcoder/msol2020/e.ts */
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/msol2020/e.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/contest/atcoder/msol2020/e.ts":
/*!*******************************************!*\
  !*** ./src/contest/atcoder/msol2020/e.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const io_1 = __webpack_require__(/*! ../../common/io */ "./src/contest/common/io.ts");
const INF = 1 << 30;
var Axis;
(function (Axis) {
    Axis["X"] = "X";
    Axis["Y"] = "Y";
    Axis["N"] = "N";
})(Axis || (Axis = {}));
function calc({ N, C, cand }) {
    let finalCost = 0;
    for (let i = 0; i < N; i++) {
        if (cand[i] != Axis.N) {
            continue;
        }
        let cost = Math.min(Math.abs(C[i].x), Math.abs(C[i].y)) * C[i].p;
        for (let j = 0; j < N; j++) {
            if (cand[j] == Axis.Y) {
                cost = Math.min(cost, Math.abs(C[i].x - C[j].x) * C[i].p);
            }
            else if (cand[j] == Axis.X) {
                cost = Math.min(cost, Math.abs(C[i].y - C[j].y) * C[i].p);
            }
        }
        finalCost += cost;
    }
    return finalCost;
}
function rec(i, k, sys) {
    const { cand, N, C, ans } = sys;
    if (i === N) {
        const res = calc({ N, C, cand });
        ans[k] = Math.min(ans[k], res);
        return;
    }
    cand[i] = Axis.N;
    rec(i + 1, k, sys);
    cand[i] = Axis.X;
    rec(i + 1, k + 1, sys);
    cand[i] = Axis.Y;
    rec(i + 1, k + 1, sys);
}
function solve({ N, C }) {
    const ans = Array(N + 1).fill(INF);
    const cand = Array(N);
    const sys = {
        N, C, ans, cand,
    };
    rec(0, 0, sys);
    return ans;
}
function main(line) {
    const nextInt = io_1.getNextInt(line);
    const N = nextInt();
    const C = [];
    for (let i = 0; i < N; i++) {
        const x = nextInt();
        const y = nextInt();
        const p = nextInt();
        C.push({ x, y, p });
    }
    console.log(solve({ N, C }).join('\n'));
}
exports.main = main;
if (__webpack_require__.c[__webpack_require__.s] === module) {
    const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
    main(line);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;
function* getIterator(line) {
    const tokens = line.split(/\s+/);
    for (const token of tokens) {
        yield token;
    }
}
exports.getIterator = getIterator;
function* getIteratorWithParser(line, parser) {
    const tokens = line.split(/\s+/);
    for (const token of tokens) {
        yield parser(token);
    }
}
exports.getIteratorWithParser = getIteratorWithParser;
function getNext(line) {
    const it = getIterator(line);
    return () => it.next().value;
}
exports.getNext = getNext;
function getNextInt(line) {
    const it = getIterator(line);
    return () => parseInt(it.next().value);
}
exports.getNextInt = getNextInt;
function getNextBigInt(line) {
    const it = getIterator(line);
    return () => BigInt(it.next().value);
}
exports.getNextBigInt = getNextBigInt;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })

/******/ });
//# sourceMappingURL=submit.js.map