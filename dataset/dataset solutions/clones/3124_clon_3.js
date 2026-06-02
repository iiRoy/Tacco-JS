!function(moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var currentModule = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
        currentModule.l = true;
        return currentModule.exports;
    }

    moduleLoader.m = moduleDefinitions;
    moduleLoader.c = moduleCache;

    moduleLoader.d = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.o(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.r = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    moduleLoader.t = function(sourceModule, flag) {
        if (1 & flag) {
            sourceModule = moduleLoader(sourceModule);
        }
        if (8 & flag) {
            return sourceModule;
        }
        if (4 & flag && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
            return sourceModule;
        }
        var tempObj = Object.create(null);
        moduleLoader.r(tempObj);
        Object.defineProperty(tempObj, "default", {
            enumerable: true,
            value: sourceModule
        });
        if (2 & flag && typeof sourceModule !== "string") {
            for (var key in sourceModule) {
                moduleLoader.d(tempObj, key, (function(valueGetter) {
                    return sourceModule[valueGetter];
                }).bind(null, key));
            }
        }
        return tempObj;
    };

    moduleLoader.n = function(targetModule) {
        var defaultExportGetter = targetModule && targetModule.__esModule ?
            function() {
                return targetModule.default;
            } :
            function() {
                return targetModule;
            };
        moduleLoader.d(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    moduleLoader.o = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    moduleLoader.p = "";
    moduleLoader(moduleLoader.s = 13);
}({
    0: function(currentContext, module0Exports, module0Require) {
        "use strict";
        var asyncHelper = (currentContext && currentContext.__awaiter) || function(thisArg, _arguments, P, generator) {
            P = P || Promise;
            return new P(function(resolve, reject) {
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

        var generatorHelper = (currentContext && currentContext.__generator) || function(thisArg, body) {
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
                            if (t[2]) {
                                _.ops.pop();
                            }
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

        var importDefaultHelper = (currentContext && currentContext.__importDefault) || function(mod) {
            return (mod && mod.__esModule) ? mod : {
                default: mod
            };
        };

        var currentModuleContext = currentContext;
        module0Exports.__esModule = true;

        const FS_MODULE_ID = 1;
        const STD_IN_FILE_PATH = "/dev/stdin";
        const FILE_ENCODING_UTF8 = "utf8";

        var fsModule = importDefaultHelper(module0Require(FS_MODULE_ID));

        function isNonEmptyString(str) {
            return str.length > 0;
        }

        function* getFoolIterator(inputString) {
            const wordParts = inputString.split(/\s+/).filter(isNonEmptyString);
            let wordIndex = 0;
            while (wordIndex < wordParts.length) {
                yield wordParts[wordIndex];
                wordIndex++;
            }
        }

        module0Exports.readInput = function() {
            return new Promise(function(resolvePromise, rejectPromise) {
                fsModule.default.readFile(STD_IN_FILE_PATH, FILE_ENCODING_UTF8, function(error, data) {
                    error ? rejectPromise(error) : resolvePromise(data);
                });
            });
        };

        module0Exports.getFoolIterator = getFoolIterator;

        module0Exports.getFoolNextInt = function() {
            return asyncHelper(currentModuleContext, void 0, void 0, function*() {
                let fullInputContent;
                let wordIteratorInstance;
                return generatorHelper(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            return [4, module0Exports.readInput()];
                        case 1:
                            fullInputContent = generatorState.sent();
                            wordIteratorInstance = getFoolIterator(fullInputContent);
                            return [2, function() {
                                return parseInt(wordIteratorInstance.next().value);
                            }];
                    }
                });
            });
        };

        function isWordCharacter(char) {
            return char !== " " && char !== "\n";
        }

        module0Exports.getChottoMashinaNext = function() {
            return asyncHelper(currentModuleContext, void 0, void 0, function*() {
                let fullInputString;
                let charStreamGeneratorInstance;
                return generatorHelper(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            return [4, module0Exports.readInput()];
                        case 1:
                            fullInputString = generatorState.sent();
                            charStreamGeneratorInstance = function*() {
                                let currentWordStartIndex = -1;
                                let currentCharacterIndex = 0;
                                const inputStringLength = fullInputString.length;

                                while (currentCharacterIndex <= inputStringLength) {
                                    const isCurrentCharPartOfWord = currentCharacterIndex < inputStringLength && isWordCharacter(fullInputString[currentCharacterIndex]);
                                    const isEndOfInputReached = currentCharacterIndex === inputStringLength;
                                    const isDelimiterOrEnd = !isCurrentCharPartOfWord || isEndOfInputReached;

                                    if (isDelimiterOrEnd) {
                                        if (currentWordStartIndex !== -1) {
                                            const extractedWord = fullInputString.substring(currentWordStartIndex, currentCharacterIndex);
                                            currentWordStartIndex = -1;
                                            yield extractedWord;
                                        }
                                    } else {
                                        if (currentWordStartIndex === -1) {
                                            currentWordStartIndex = currentCharacterIndex;
                                        }
                                    }
                                    currentCharacterIndex++;
                                }
                            }();
                            return [2, function() {
                                return charStreamGeneratorInstance.next().value;
                            }];
                    }
                });
            });
        };

        module0Exports.getChottoMashinaNextInt = function() {
            return asyncHelper(currentModuleContext, void 0, void 0, function*() {
                let nextWordRetrievalFunction;
                return generatorHelper(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            return [4, module0Exports.getChottoMashinaNext()];
                        case 1:
                            nextWordRetrievalFunction = generatorState.sent();
                            return [2, function() {
                                return parseInt(nextWordRetrievalFunction());
                            }];
                    }
                });
            });
        };
    },
    1: function(module, exports) {
        module.exports = require("fs");
    },
    13: function(currentContext, module13Exports, module13Require) {
        "use strict";
        var asyncWrapper = (currentContext && currentContext.__awaiter) || function(thisArg, _arguments, P, generator) {
            P = P || Promise;
            return new P(function(resolve, reject) {
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

        var genWrapper = (currentContext && currentContext.__generator) || function(thisArg, body) {
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
                            if (t[2]) {
                                _.ops.pop();
                            }
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

        var currentScope = currentContext;
        module13Exports.__esModule = true;
        var inputUtils = module13Require(0);

        const MODULO_PRIME = 1000000007;

        function calculateModulo(value) {
            return (value + MODULO_PRIME) % MODULO_PRIME;
        }

        function incrementCharacterCount(charMap, character) {
            const currentCount = charMap.get(character) || 0;
            charMap.set(character, currentCount + 1);
        }

        asyncWrapper(currentScope, void 0, void 0, function*() {
            let getNextWordFunctionFactory;
            let wordIteratorInstance;
            let firstWordContent;
            let characterFrequencyMap;
            let finalProductAccumulator;

            return genWrapper(this, function(generatorState) {
                switch (generatorState.label) {
                    case 0:
                        return [4, inputUtils.getChottoMashinaNext()];
                    case 1:
                        getNextWordFunctionFactory = generatorState.sent();
                        wordIteratorInstance = getNextWordFunctionFactory();
                        firstWordContent = wordIteratorInstance.next().value;
                        characterFrequencyMap = new Map();

                        if (firstWordContent) {
                            for (const char of firstWordContent) {
                                incrementCharacterCount(characterFrequencyMap, char);
                            }
                        }

                        finalProductAccumulator = 1;
                        for (const charKey of characterFrequencyMap.keys()) {
                            const charCount = characterFrequencyMap.get(charKey);
                            const countPlusOne = 1 + charCount;
                            finalProductAccumulator = calculateModulo(finalProductAccumulator * countPlusOne);
                        }

                        console.log(calculateModulo(finalProductAccumulator - 1));
                        return [2];
                }
            });
        });
    }
});
