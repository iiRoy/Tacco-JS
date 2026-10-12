module.exports = function(__webpack_modules_definitions__) {
    var __webpack_modules_cache__ = {};

    function __webpack_require__(moduleId) {
        if (__webpack_modules_cache__[moduleId]) {
            return __webpack_modules_cache__[moduleId].exports;
        }
        var moduleObject = __webpack_modules_cache__[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        __webpack_modules_definitions__[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, __webpack_require__);
        moduleObject.l = true;
        return moduleObject.exports;
    }

    __webpack_require__.m = __webpack_modules_definitions__;
    __webpack_require__.c = __webpack_modules_cache__;

    __webpack_require__.d = function(exportsObject, exportName, getter) {
        if (!__webpack_require__.o(exportsObject, exportName)) {
            Object.defineProperty(exportsObject, exportName, {
                enumerable: true,
                get: getter
            });
        }
    };

    __webpack_require__.r = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    __webpack_require__.t = function(value, mode) {
        if (1 & mode) value = __webpack_require__(value);
        if (8 & mode) return value;
        if (4 & mode && typeof value === "object" && value && value.__esModule) return value;
        var namespaceObject = Object.create(null);
        __webpack_require__.r(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });
        if (2 & mode && typeof value !== "string") {
            for (var key in value) {
                __webpack_require__.d(namespaceObject, key, (function(k) {
                    return value[k];
                }).bind(null, k));
            }
        }
        return namespaceObject;
    };

    __webpack_require__.n = function(moduleExports) {
        var getter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        __webpack_require__.d(getter, "a", getter);
        return getter;
    };

    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    __webpack_require__.p = "";

    return __webpack_require__(__webpack_require__.s = 0);
}([
    function(module, exports, __webpack_require__) {
        const fsModule = __webpack_require__(2);
        const inputContent = fsModule.readFileSync("/dev/stdin", "UTF-8");
        __webpack_require__(1)(inputContent);
    },
    function(module, exports) {
        function _array_destructure_helper(iterable, count) {
            if (Array.isArray(iterable)) return iterable;
            var tempArray = [];
            var isIterationDone = false;
            var encounteredError = false;
            var caughtErrorValue = undefined;
            try {
                for (var iterableIterator = iterable[Symbol.iterator](); !(isIterationDone = (iterableIterator.next()).done) && (tempArray.push(iterableIterator.value), !count || tempArray.length !== count); isIterationDone = true) {}
            } catch (err) {
                encounteredError = true;
                caughtErrorValue = err;
            } finally {
                try {
                    if (!isIterationDone && iterableIterator.return != null) iterableIterator.return();
                } finally {
                    if (encounteredError) throw caughtErrorValue;
                }
            }
            return tempArray;
        }

        module.exports = function(rawInputString) {
            const LINE_SEPARATOR = "\n";
            const inputLines = rawInputString.split(LINE_SEPARATOR);

            const numEntries = parseInt(inputLines[0], 10);

            const parsedInputData = [];
            const VALUE_SEPARATOR = " ";

            const parseLineToNumbers = (lineStr) => lineStr.split(VALUE_SEPARATOR).map(Number);

            for (let lineIndex = 0; lineIndex < numEntries; lineIndex++) {
                const currentLineValues = parseLineToNumbers(inputLines[lineIndex + 1]);
                const [val1, val2, val3] = _array_destructure_helper(currentLineValues, 3);
                parsedInputData.push([val1, val2, val3]);
            }

            const NUM_COLS = 3;

            const dpTable = Array.from({
                length: numEntries
            }, () => Array(NUM_COLS).fill(0));

            const firstInputRow = parsedInputData[0];
            for (let k = 0; k < NUM_COLS; k++) {
                dpTable[0][k] = firstInputRow[k];
            }

            for (let rowIndex = 0; rowIndex < numEntries - 1; rowIndex++) {
                const currentRowValues = dpTable[rowIndex];
                const nextInputRowValues = parsedInputData[rowIndex + 1];
                const targetDpRow = dpTable[rowIndex + 1];

                for (let prevColIndex = 0; prevColIndex < NUM_COLS; prevColIndex++) {
                    const valueFromPreviousState = currentRowValues[prevColIndex];
                    for (let currColIndex = 0; currColIndex < NUM_COLS; currColIndex++) {
                        if (currColIndex !== prevColIndex) {
                            const potentialNewMax = valueFromPreviousState + nextInputRowValues[currColIndex];
                            targetDpRow[currColIndex] = Math.max(targetDpRow[currColIndex], potentialNewMax);
                        }
                    }
                }
            }

            const lastDpRow = dpTable[numEntries - 1];
            let finalMaxValue = 0;
            for (let k = 0; k < NUM_COLS; k++) {
                if (lastDpRow[k] > finalMaxValue) {
                    finalMaxValue = lastDpRow[k];
                }
            }

            console.log(finalMaxValue);
        };
    },
    function(module, exports) {
        const fileSystem = require("fs");
        module.exports = fileSystem;
    }
]);
