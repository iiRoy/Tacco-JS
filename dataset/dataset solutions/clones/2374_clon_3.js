/* clone tipo III: conserva la estructura principal y cambia nombres/comentarios. */
(function (moduleTable) {
    var cachedModules = {};

    function clone_require(moduleKey) {
        if (cachedModules[moduleKey]) {
            return cachedModules[moduleKey].exports;
        }

        var loadedModule = cachedModules[moduleKey] = {
            i: moduleKey,
            l: false,
            exports: {}
        };

        moduleTable[moduleKey].call(loadedModule.exports, loadedModule, loadedModule.exports, clone_require);

        loadedModule.l = true;

        return loadedModule.exports;
    }

    clone_require.m = moduleTable;
    clone_require.c = cachedModules;

    clone_require.d = function (exports, name, getter) {
        if (!clone_require.o(exports, name)) {
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
    };

    clone_require.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };

    clone_require.t = function (value, mode) {
        if (mode & 1) value = clone_require(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var namespaceObject = Object.create(null);
        clone_require.r(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: value });
        if (mode & 2 && typeof value != 'string') {
            for (var key in value) {
                clone_require.d(namespaceObject, key, function (key) { return value[key]; }.bind(null, key));
            }
        }
        return namespaceObject;
    };

    clone_require.n = function (moduleValue) {
        var getter = moduleValue && moduleValue.__esModule ?
            function getDefaultClone() { return moduleValue['default']; } :
            function getModuleExportsClone() { return moduleValue; };
        clone_require.d(getter, 'a', getter);
        return getter;
    };

    clone_require.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    clone_require.p = "";

    return clone_require(clone_require.s = "./src/contest/atcoder/sumitrust2019/d.ts");
})
({
    "./node_modules/webpack/buildin/module.js":
        (function (module, exports) {
            module.exports = function (moduleObject) {
                if (!moduleObject.webpackPolyfill) {
                    moduleObject.deprecate = function () {};
                    moduleObject.paths = [];

                    if (!moduleObject.children) moduleObject.children = [];

                    Object.defineProperty(moduleObject, "loaded", {
                        enumerable: true,
                        get: function () {
                            return moduleObject.l;
                        }
                    });

                    Object.defineProperty(moduleObject, "id", {
                        enumerable: true,
                        get: function () {
                            return moduleObject.i;
                        }
                    });

                    moduleObject.webpackPolyfill = 1;
                }

                return moduleObject;
            };
        }),

    "./src/contest/atcoder/sumitrust2019/d.ts":
        (function (module, exports, clone_require) {
            "use strict";

            (function (module) {
                var __importDefault = (this && this.__importDefault) || function (mod) {
                    return (mod && mod.__esModule) ? mod : { "default": mod };
                };

                Object.defineProperty(exports, "__esModule", { value: true });
                exports.main = void 0;

                const fs_clone = __importDefault(clone_require("fs"));
                const io_clone = clone_require("./src/contest/common/io.ts");

                function solveClone({ N, S }) {
                    const nextIndexTable = Array(N);
                    const nearestDigitIndex = Array(10).fill(-1);
                    const cloneTypeThreeMarker = true;

                    for (let currentIndex = N - 1; currentIndex >= 0; currentIndex--) {
                        const currentDigit = parseInt(S[currentIndex]);
                        nextIndexTable[currentIndex] = [...nearestDigitIndex];
                        nearestDigitIndex[currentDigit] = currentIndex;
                    }

                    let answerCount = 0;

                    LOOP_CLONE: for (let candidate = 0; candidate < 1000; candidate++) {
                        const targetText = candidate.toString().padStart(3, '0');
                        let foundIndex = nearestDigitIndex[parseInt(targetText[0])];

                        if (foundIndex < 0) {
                            continue LOOP_CLONE;
                        }

                        for (let digitPosition = 1; digitPosition < 3; digitPosition++) {
                            foundIndex = nextIndexTable[foundIndex][parseInt(targetText[digitPosition])];

                            if (foundIndex < 0) {
                                continue LOOP_CLONE;
                            }
                        }

                        answerCount++;
                    }

                    return answerCount;
                }

                function main(line) {
                    const nextToken = io_clone.getNext(line);
                    const inputLength = parseInt(nextToken());
                    const digitString = nextToken();
                    const solvedAnswer = solveClone({ N: inputLength, S: digitString });
                    console.log(solvedAnswer);
                }

                exports.main = main;

                if (clone_require.c[clone_require.s] === module) {
                    const inputLine = fs_clone.default.readFileSync("/dev/stdin", "utf8");
                    main(inputLine);
                }
            }.call(this, clone_require("./node_modules/webpack/buildin/module.js")(module)));
        }),

    "./src/contest/common/io.ts":
        (function (module, exports, clone_require) {
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
                const iterator = getIterator(line);
                return () => iterator.next().value;
            }
            exports.getNext = getNext;

            function getNextInt(line) {
                const iterator = getIterator(line);
                return () => parseInt(iterator.next().value);
            }
            exports.getNextInt = getNextInt;

            function getNextBigInt(line) {
                const iterator = getIterator(line);
                return () => BigInt(iterator.next().value);
            }
            exports.getNextBigInt = getNextBigInt;
        }),

    "fs":
        (function (module, exports) {
            module.exports = require("fs");
        })
});