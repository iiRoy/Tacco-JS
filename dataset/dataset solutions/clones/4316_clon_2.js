(function(moduleDefinitions) {
  var loadedModulesCache = {};

  function customRequire(moduleIdKey) {
    if (loadedModulesCache[moduleIdKey]) {
      return loadedModulesCache[moduleIdKey].exports;
    }
    var currentModule = loadedModulesCache[moduleIdKey] = {
      i: moduleIdKey,
      l: false,
      exports: {}
    };

    moduleDefinitions[moduleIdKey].call(currentModule.exports, currentModule, currentModule.exports, customRequire);

    currentModule.l = true;

    return currentModule.exports;
  }

  customRequire.m = moduleDefinitions;

  customRequire.c = loadedModulesCache;

  customRequire.d = function(exportObj, exportName, getterFunc) {
    if (!customRequire.o(exportObj, exportName)) {
      Object.defineProperty(exportObj, exportName, { enumerable: true, get: getterFunc });
    }
  };

  customRequire.r = function(exportObj) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exportObj, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exportObj, '__esModule', { value: true });
  };

  customRequire.t = function(val, modeFlags) {
    if (modeFlags & 1) val = customRequire(val);
    if (modeFlags & 8) return val;
    if ((modeFlags & 4) && typeof val === 'object' && val && val.__esModule) return val;
    var namespaceObj = Object.create(null);
    customRequire.r(namespaceObj);
    Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: val });
    if (modeFlags & 2 && typeof val != 'string') {
      for (var propKey in val) {
        customRequire.d(namespaceObj, propKey, (function(key) {
          return val[key];
        }).bind(null, propKey));
      }
    }
    return namespaceObj;
  };

  customRequire.n = function(mod) {
    var defaultGetter = mod && mod.__esModule ?
      function getDef() { return mod['default']; } :
      function getModExports() { return mod; };
    customRequire.d(defaultGetter, 'a', defaultGetter);
    return defaultGetter;
  };

  customRequire.o = function(targetObj, propName) { return Object.prototype.hasOwnProperty.call(targetObj, propName); };

  customRequire.p = "";

  return customRequire(customRequire.s = "./src/contest/atcoder/tenka1-2017/c.ts");
})
/************************************************************************/
({

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

/***/ "./src/contest/atcoder/tenka1-2017/c.ts":
/*!**********************************************!*\
  !*** ./src/contest/atcoder/tenka1-2017/c.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, customRequire) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const fs_1 = __importDefault(customRequire("fs"));
const io_1 = customRequire("./src/contest/common/io.ts");

function computeSolution({ N: inputVal }) {
    for (let iterVar = 1; ; iterVar++) {
        const prodVal = iterVar * inputVal;
        const calcTerm = 3 * iterVar - 1;
        if (prodVal % calcTerm === 0) {
            return [inputVal, prodVal, prodVal / calcTerm];
        }
    }
}

function main(inputLine) {
    const tokenFetcher = io_1.getNext(inputLine);
    const problemInput = io_1.getInt(tokenFetcher);
    const [resultA, resultB, resultC] = computeSolution({ N: problemInput });
    console.log(resultA, resultB, resultC);
}
exports.main = main;
if (customRequire.c[customRequire.s] === module) {
    const inputLine = fs_1.default.readFileSync("/dev/stdin", "utf8");
    main(inputLine);
}

/* WEBPACK VAR INJECTION */}.call(this, customRequire("./../../../../node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contest/common/io.ts":
/*!**********************************!*\
  !*** ./src/contest/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, customRequire) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntArray = exports.getInt = exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;

function* getIterator(textLine) {
    const wordUnits = textLine.split(/\s+/);
    for (const currentUnit of wordUnits) {
        yield currentUnit;
    }
}
exports.getIterator = getIterator;

function* getIteratorWithParser(inputString, valueParser) {
    const stringParts = inputString.split(/\s+/);
    for (const partItem of stringParts) {
        yield valueParser(partItem);
    }
}
exports.getIteratorWithParser = getIteratorWithParser;

function getNext(sourceLine) {
    const iteratorInstance = getIterator(sourceLine);
    return () => iteratorInstance.next().value;
}
exports.getNext = getNext;

function getNextInt(dataLine) {
    const numIterator = getIterator(dataLine);
    return () => parseInt(numIterator.next().value);
}
exports.getNextInt = getNextInt;

function getNextBigInt(bigIntLine) {
    const bigNumIterator = getIterator(bigIntLine);
    return () => BigInt(bigNumIterator.next().value);
}
exports.getNextBigInt = getNextBigInt;

function getInt(fetchNext) {
    return parseInt(fetchNext());
}
exports.getInt = getInt;

function getIntArray(fetchNextItem, count) {
    const resultArray = [];
    for (let idx = 0; idx < count; idx++) {
        resultArray[idx] = parseInt(fetchNextItem());
    }
    return resultArray;
}
exports.getIntArray = getIntArray;


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
