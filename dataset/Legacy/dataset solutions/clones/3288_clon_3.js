/******/ (function(modules) { // webpackBootstrap
/******/ 	var installedModules = {};
/******/
/******/ 	function __webpack_require__(moduleId) {
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		module.l = true;
/******/
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	__webpack_require__.m = modules;
/******/ 	__webpack_require__.c = installedModules;
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
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
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/aising2019/c.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
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

/***/ "./src/contest/atcoder/aising2019/c.ts":
/*!*********************************************!*\
  !*** ./src/contest/atcoder/aising2019/c.ts ***!
  \*********************************************/
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
const uf_1 = __webpack_require__(/*! ../../common/uf */ "./src/contest/common/uf.ts");

const rowOffsets = [1, 0];
const colOffsets = [0, 1];

const BLACK_CELL_CHAR = '#';
const WHITE_CELL_CHAR = '.';

const getFlatIndex = (row, col, width) => row * width + col;

const isValidCoordinate = (row, col, height, width) => {
    return row >= 0 && row < height && col >= 0 && col < width;
};

function solveProblem({ gridHeight, gridWidth, gridData }) {
    const unionFindStructure = new uf_1.UnionFind(gridHeight * gridWidth);

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const currentCellId = getFlatIndex(rowIndex, colIndex, gridWidth);
            const currentCellChar = gridData[rowIndex][colIndex];

            for (let offsetIdx = 0; offsetIdx < rowOffsets.length; offsetIdx++) {
                const neighborRow = rowIndex + rowOffsets[offsetIdx];
                const neighborCol = colIndex + colOffsets[offsetIdx];

                if (!isValidCoordinate(neighborRow, neighborCol, gridHeight, gridWidth)) {
                    continue;
                }

                const neighborCellId = getFlatIndex(neighborRow, neighborCol, gridWidth);
                const neighborCellChar = gridData[neighborRow][neighborCol];

                if (currentCellChar !== neighborCellChar) {
                    unionFindStructure.union(currentCellId, neighborCellId);
                }
            }
        }
    }

    const blackCellCounts = new Map();
    const whiteCellCounts = new Map();

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const currentCellId = getFlatIndex(rowIndex, colIndex, gridWidth);
            const componentRoot = unionFindStructure.root(currentCellId);
            const cellType = gridData[rowIndex][colIndex];

            if (cellType === BLACK_CELL_CHAR) {
                blackCellCounts.set(componentRoot, (blackCellCounts.get(componentRoot) ?? 0) + 1);
            } else {
                whiteCellCounts.set(componentRoot, (whiteCellCounts.get(componentRoot) ?? 0) + 1);
            }
        }
    }

    let totalPairs = 0;

    for (const [componentRoot, darkCount] of blackCellCounts.entries()) {
        const lightCount = whiteCellCounts.get(componentRoot) ?? 0;
        totalPairs += darkCount * lightCount;
    }

    return totalPairs;
}

function readGridInput(inputTokenizer) {
    const height = parseInt(inputTokenizer());
    const width = parseInt(inputTokenizer());
    const gridRows = [];
    for (let i = 0; i < height; i++) {
        gridRows.push(inputTokenizer());
    }
    return { gridHeight: height, gridWidth: width, gridData: gridRows };
}

function main(inputLine) {
    const getNextToken = io_1.getNext(inputLine);
    const parsedInput = readGridInput(getNextToken);
    console.log(solveProblem(parsedInput));
}
exports.main = main;

if (__webpack_require__.c[__webpack_require__.s] === module) {
    const fileContent = fs_1.default.readFileSync("/dev/stdin", "utf8");
    main(fileContent);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
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

/***/ "./src/contest/common/uf.ts":
/*!**********************************!*\
  !*** ./src/contest/common/uf.ts ***!
  \**********************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionFind = void 0;
class UnionFind {
    constructor(n) {
        this.v = new Array(n);
        this.v.fill(-1);
    }
    union(a, b) {
        if (!this.find(a, b)) {
            const ra = this.root(a);
            const rb = this.root(b);
            if (this.size(ra) > this.size(rb)) {
                this.v[ra] += this.v[rb];
                this.v[rb] = ra;
            }
            else {
                this.v[rb] += this.v[ra];
                this.v[ra] = rb;
            }
        }
    }
    find(a, b) {
        return this.root(a) === this.root(b);
    }
    root(a) {
        if (this.v[a] < 0) {
            return a;
        }
        this.v[a] = this.root(this.v[a]);
        return this.v[a];
    }
    size(a) {
        return -this.v[this.root(a)];
    }
}
exports.UnionFind = UnionFind;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })

/******/ });
