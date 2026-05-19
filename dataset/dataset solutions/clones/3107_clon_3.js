!function(moduleDefinitions) {
    var moduleCache = {};

    function requireModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var module = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(module.exports, module, module.exports, requireModule);
        module.loaded = true;
        return module.exports;
    }
    requireModule.modules = moduleDefinitions;
    requireModule.cache = moduleCache;
    requireModule.define = function(target, property, getter) {
        requireModule.hasOwn(target, property) || Object.defineProperty(target, property, {
            enumerable: true,
            get: getter
        });
    };
    requireModule.register = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetModule, "__esModule", {
            value: true
        });
    };
    requireModule.interopRequireDefault = function(moduleObj, flags) {
        if (1 & flags) {
            moduleObj = requireModule(moduleObj);
        }
        if (8 & flags) {
            return moduleObj;
        }
        if (4 & flags && typeof moduleObj === "object" && moduleObj && moduleObj.__esModule) {
            return moduleObj;
        }
        var defaultExport = Object.create(null);
        requireModule.register(defaultExport);
        Object.defineProperty(defaultExport, "default", {
            enumerable: true,
            value: moduleObj
        });
        if (2 & flags && typeof moduleObj !== "string") {
            for (var key in moduleObj) {
                requireModule.define(defaultExport, key, (function(k) {
                    return moduleObj[k];
                }).bind(null, key));
            }
        }
        return defaultExport;
    };
    requireModule.getModuleExports = function(moduleObj) {
        var exports = moduleObj && moduleObj.__esModule ? function() {
            return moduleObj.default;
        } : function() {
            return moduleObj;
        };
        requireModule.define(exports, "a", exports);
        return exports;
    };
    requireModule.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    requireModule.publicPath = "";
    requireModule(requireModule.s = 16);
}({
    0: function(moduleObj, moduleExports, moduleRequire) {
        "use strict";
        var asyncWrapper = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
            return new (P || (P = Promise))(function(resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function(resolve) {
                        resolve(result.value);
                    }).then(fulfilled, rejected);
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };
        var generatorWrapper = this && this.__generator || function(thisArg, body) {
            var _ = {
                    label: 0,
                    sent: function() {
                        if (1 & _[0]) throw _[1];
                        return _[1];
                    },
                    trys: [],
                    ops: []
                },
                f, y, t, g;
            return g = {
                next: verb(0),
                "throw": verb(1),
                "return": verb(2)
            }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
                return this;
            }), g;

            function verb(n) {
                return function(v) {
                    return step([n, v]);
                };
            }

            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
                if (op[0] & 5) throw op[1];
                return {
                    value: op[0] ? op[1] : void 0,
                    done: true
                };
            }
        };
        var importDefaultHelper = this && this.__importDefault || function(module) {
            return (module && module.__esModule) ? module : {
                default: module
            };
        };
        var currentContext = this;
        moduleExports.__esModule = true;
        var fileSystemModule = importDefaultHelper(moduleRequire(1));

        function* createWordIterator(inputText) {
            const wordsArray = inputText.split(/\s+/).filter(word => word.length > 0);
            for (let i = 0; i < wordsArray.length; i++) {
                yield wordsArray[i];
            }
        }
        moduleExports.readInput = function() {
            return new Promise(function(resolve, reject) {
                fileSystemModule.default.readFile("/dev/stdin", "utf8", function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        };
        moduleExports.getWordIterator = createWordIterator;
        moduleExports.getNextIntegerFromWords = function() {
            return asyncWrapper(currentContext, void 0, void 0, function*() {
                let fullInputText, wordIterator;
                return generatorWrapper(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            return [4 /*yield*/ , moduleExports.readInput()];
                        case 1:
                            fullInputText = _a.sent();
                            wordIterator = createWordIterator(fullInputText);
                            return [2 /*return*/ , function() {
                                return parseInt(wordIterator.next().value);
                            }];
                    }
                });
            });
        };
        moduleExports.getSmartWordIterator = function() {
            return asyncWrapper(currentContext, void 0, void 0, function*() {
                let rawInputContent, smartIterator;
                return generatorWrapper(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            return [4 /*yield*/ , moduleExports.readInput()];
                        case 1:
                            rawInputContent = _a.sent();
                            smartIterator = (function*() {
                                let startIndex = -1;
                                let currentIndex = 0;
                                const inputLength = rawInputContent.length;
                                while (currentIndex <= inputLength) {
                                    const char = rawInputContent[currentIndex];
                                    const isSeparator = (char === " " || char === "\n" || currentIndex === inputLength);
                                    if (isSeparator) {
                                        if (startIndex !== -1) {
                                            const extractedWord = rawInputContent.substring(startIndex, currentIndex);
                                            startIndex = -1;
                                            yield extractedWord;
                                        }
                                    } else {
                                        if (startIndex === -1) {
                                            startIndex = currentIndex;
                                        }
                                    }
                                    currentIndex++;
                                }
                                return;
                            })();
                            return [2 /*return*/ , function() {
                                return smartIterator.next().value;
                            }];
                    }
                });
            });
        };
        moduleExports.getSmartNextInteger = function() {
            return asyncWrapper(currentContext, void 0, void 0, function*() {
                let getNextWordFunc;
                return generatorWrapper(this, function(_a) {
                    switch (_a.label) {
                        case 0:
                            return [4 /*yield*/ , moduleExports.getSmartWordIterator()];
                        case 1:
                            getNextWordFunc = _a.sent();
                            return [2 /*return*/ , function() {
                                return parseInt(getNextWordFunc());
                            }];
                    }
                });
            });
        };
    },
    1: function(moduleObj, moduleExports) {
        moduleObj.exports = require("fs");
    },
    16: function(mainModuleObj, mainModuleExports, mainModuleRequire) {
        "use strict";
        var mainAsyncWrapper = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
            return new (P || (P = Promise))(function(resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function(resolve) {
                        resolve(result.value);
                    }).then(fulfilled, rejected);
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };
        var mainGeneratorWrapper = this && this.__generator || function(thisArg, body) {
            var _ = {
                    label: 0,
                    sent: function() {
                        if (1 & _[0]) throw _[1];
                        return _[1];
                    },
                    trys: [],
                    ops: []
                },
                f, y, t, g;
            return g = {
                next: verb(0),
                "throw": verb(1),
                "return": verb(2)
            }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
                return this;
            }), g;

            function verb(n) {
                return function(v) {
                    return step([n, v]);
                };
            }

            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
                if (op[0] & 5) throw op[1];
                return {
                    value: op[0] ? op[1] : void 0,
                    done: true
                };
            }
        };
        var mainContext = this;
        mainModuleExports.__esModule = true;
        var inputUtils = mainModuleRequire(0);
        const DIMENSION_INDICES = [0, 1, 2, 3];
        const MODULO_VALUE = 1000000007;

        function applyZeroMask(targetMatrix) {
            for (const index of DIMENSION_INDICES) {
                targetMatrix[0][2][1][index] = 0;
                targetMatrix[index][0][2][1] = 0;
                targetMatrix[0][1][2][index] = 0;
                targetMatrix[index][0][1][2] = 0;
                targetMatrix[2][0][1][index] = 0;
                targetMatrix[index][2][0][1] = 0;
                targetMatrix[0][index][2][1] = 0;
                targetMatrix[0][2][index][1] = 0;
            }
        }

        function calculateModulo(value) {
            return value % MODULO_VALUE;
        }

        mainAsyncWrapper(mainContext, void 0, void 0, function*() {
            let getNextIntFunction, parsedInputVal;
            return mainGeneratorWrapper(this, function(_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/ , inputUtils.getSmartNextInteger()];
                    case 1:
                        getNextIntFunction = _a.sent();
                        parsedInputVal = getNextIntFunction();

                        if (parsedInputVal === 3) {
                            console.log(61);
                            return [2 /*return*/ ];
                        }

                        let dpTableCurrent = {};
                        // Initialize dpTableCurrent with all 1s
                        for (const dimA of DIMENSION_INDICES) {
                            dpTableCurrent[dimA] = {};
                            for (const dimB of DIMENSION_INDICES) {
                                dpTableCurrent[dimA][dimB] = {};
                                for (const dimC of DIMENSION_INDICES) {
                                    dpTableCurrent[dimA][dimB][dimC] = {};
                                    for (const dimD of DIMENSION_INDICES) {
                                        dpTableCurrent[dimA][dimB][dimC][dimD] = 1;
                                    }
                                }
                            }
                        }

                        applyZeroMask(dpTableCurrent);

                        for (let currentIteration = 5; currentIteration <= parsedInputVal; currentIteration++) {
                            let dpTableNext = {};
                            // Initialize dpTableNext for this iteration with 0s
                            for (const dimA of DIMENSION_INDICES) {
                                dpTableNext[dimA] = {};
                                for (const dimB of DIMENSION_INDICES) {
                                    dpTableNext[dimA][dimB] = {};
                                    for (const dimC of DIMENSION_INDICES) {
                                        dpTableNext[dimA][dimB][dimC] = {};
                                        for (const dimD of DIMENSION_INDICES) {
                                            dpTableNext[dimA][dimB][dimC][dimD] = 0;
                                            // Sum values from the previous state (dpTableCurrent)
                                            for (const prevDimA of DIMENSION_INDICES) {
                                                const previousStateValue = dpTableCurrent[prevDimA][dimA][dimB][dimC];
                                                dpTableNext[dimA][dimB][dimC][dimD] = calculateModulo(dpTableNext[dimA][dimB][dimC][dimD] + previousStateValue);
                                            }
                                        }
                                    }
                                }
                            }
                            applyZeroMask(dpTableNext);
                            dpTableCurrent = dpTableNext; // Update for the next iteration
                        }

                        let totalSum = 0;
                        // Calculate the final sum from the last dpTableCurrent
                        for (const dimA of DIMENSION_INDICES) {
                            for (const dimB of DIMENSION_INDICES) {
                                for (const dimC of DIMENSION_INDICES) {
                                    for (const dimD of DIMENSION_INDICES) {
                                        totalSum = calculateModulo(totalSum + dpTableCurrent[dimA][dimB][dimC][dimD]);
                                    }
                                }
                            }
                        }
                        console.log(totalSum);
                        return [2 /*return*/ ];
                }
            });
        })();
    }
});
