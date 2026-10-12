!function(modulesMap) {
    var moduleCache = {};

    function __webpack_require__(moduleId) {
        if (moduleCache[moduleId]) return moduleCache[moduleId].exports;
        var currentModuleObj = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modulesMap[moduleId].call(currentModuleObj.exports, currentModuleObj, currentModuleObj.exports, __webpack_require__);
        currentModuleObj.l = true;
        return currentModuleObj.exports;
    }

    __webpack_require__.m = modulesMap;
    __webpack_require__.c = moduleCache;
    __webpack_require__.d = function(exportsObj, name, getter) {
        var defineProperty = Object.defineProperty;
        if (!__webpack_require__.o(exportsObj, name)) {
            defineProperty(exportsObj, name, {
                enumerable: true,
                get: getter
            });
        }
    };
    __webpack_require__.r = function(exportsObj) {
        var symToStringTag = typeof Symbol !== "undefined" && Symbol.toStringTag;
        if (symToStringTag) {
            Object.defineProperty(exportsObj, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObj, "__esModule", {
            value: true
        });
    };
    __webpack_require__.t = function(value, mode) {
        if (1 & mode) value = __webpack_require__(value);
        if (8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var resultObj = Object.create(null);
        __webpack_require__.r(resultObj);
        Object.defineProperty(resultObj, "default", {
            enumerable: true,
            value: value
        });
        if (2 & mode && "string" != typeof value)
            for (var key in value) __webpack_require__.d(resultObj, key, (function(k) {
                return value[k];
            }).bind(null, key));
        return resultObj;
    };
    __webpack_require__.n = function(getter) {
        var moduleGetter = getter && getter.__esModule ? function() {
            return getter.default;
        } : function() {
            return getter;
        };
        __webpack_require__.d(moduleGetter, "a", moduleGetter);
        return moduleGetter;
    };
    __webpack_require__.o = function(obj, prop) {
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        return hasOwnProperty.call(obj, prop);
    };
    __webpack_require__.p = "";
    __webpack_require__(__webpack_require__.s = 17);
}({
    0: function(moduleFunc, moduleExports, __webpack_require__) {
        "use strict";
        var asyncAwaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
            var promiseConstructor = P || (P = Promise);
            return new promiseConstructor(function(resolve, reject) {
                function step(result) {
                    try {
                        processNext(generator.next(result));
                    } catch (e) {
                        reject(e);
                    }
                }

                function error(err) {
                    try {
                        processNext(generator.throw(err));
                    } catch (e) {
                        reject(e);
                    }
                }

                function processNext(genResult) {
                    genResult.done ? resolve(genResult.value) : new promiseConstructor(function(res) {
                        res(genResult.value);
                    }).then(step, error);
                }
                processNext((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };
        var generatorHelper = this && this.__generator || function(thisArg, body) {
            var _state, _sent, _ops, _trys,
                generatorState = {
                    label: 0,
                    sent: function() {
                        if (1 & _state[0]) throw _state[1];
                        return _state[1];
                    },
                    trys: [],
                    ops: []
                };
            return _ops = {
                next: createStepFunc(0),
                "throw": createStepFunc(1),
                "return": createStepFunc(2)
            }, "function" == typeof Symbol && (_ops[Symbol.iterator] = function() {
                return this;
            }), _ops;

            function createStepFunc(stepType) {
                return function(value) {
                    return (function(stepType, value) {
                        var isExecuting = _state;
                        if (isExecuting) throw new TypeError("Generator is already executing.");
                        for (; generatorState;) try {
                            if (_state = 1, _sent && (_ops = 2 & stepType ? _sent["return"] : stepType ? _sent["throw"] || ((_ops = _sent["return"]) && _ops.call(_sent), 0) : _sent.next) && !(_ops = _ops.call(_sent, value)).done) return _ops;
                            switch (_sent = 0, _ops && (value = [2 & stepType, _ops.value]), stepType) {
                                case 0:
                                case 1:
                                    _ops = value;
                                    break;
                                case 4:
                                    return generatorState.label++, {
                                        value: value[1],
                                        done: !1
                                    };
                                case 5:
                                    generatorState.label++, _sent = value[1], value = [0];
                                    continue;
                                case 7:
                                    value = generatorState.ops.pop(), generatorState.trys.pop();
                                    continue;
                                default:
                                    if (!((_ops = generatorState.trys).length > 0 && _ops[_ops.length - 1]) && (6 === stepType || 2 === stepType)) {
                                        generatorState = 0;
                                        continue;
                                    }
                                    if (3 === stepType && (!_ops || value[1] > _ops[0] && value[1] < _ops[3])) {
                                        generatorState.label = value[1];
                                        break;
                                    }
                                    if (6 === stepType && generatorState.label < _ops[1]) {
                                        generatorState.label = _ops[1], _ops = value;
                                        break;
                                    }
                                    if (_ops && generatorState.label < _ops[2]) {
                                        generatorState.label = _ops[2], generatorState.ops.push(value);
                                        break;
                                    }
                                    _ops[2] && generatorState.ops.pop(), generatorState.trys.pop();
                                    continue;
                            }
                            value = body.call(thisArg, generatorState);
                        } catch (e) {
                            value = [6, e], _sent = 0;
                        } finally {
                            _state = _ops = 0;
                        }
                        if (5 & value[0]) throw value[1];
                        return {
                            value: value[0] ? value[1] : void 0,
                            done: !0
                        };
                    })([stepType, value]);
                };
            }
        };
        var __importDefault = this && this.__importDefault || function(mod) {
            return (mod && mod.__esModule) ? mod : {
                default: mod
            };
        };
        var moduleContext = this;

        moduleExports.__esModule = true;
        var fsModule = __importDefault(__webpack_require__(1));

        function createTokenIterator(inputString) {
            var rawTokens = inputString.split(/\s+/);
            var filteredTokens = rawTokens.filter(function(token) {
                return token.length > 0;
            });
            var tokenIndex = 0;
            return generatorHelper(this, function(state) {
                switch (state.label) {
                    case 0:
                        state.label = 1;
                    case 1:
                        var hasMoreTokens = tokenIndex < filteredTokens.length;
                        return hasMoreTokens ? [4, filteredTokens[tokenIndex]] : [3, 4];
                    case 2:
                        state.sent();
                        state.label = 3;
                    case 3:
                        tokenIndex++;
                        return [3, 1];
                    case 4:
                        return [2];
                }
            });
        }

        moduleExports.readInput = function() {
            return new Promise(function(resolve, reject) {
                const stdinPath = "/dev/stdin";
                const encodingFormat = "utf8";
                var readFileCallback = function(err, data) {
                    if (err) reject(err);
                    else resolve(data);
                };
                fsModule.default.readFile(stdinPath, encodingFormat, readFileCallback);
            });
        };
        moduleExports.createTokenIterator = createTokenIterator;
        moduleExports.getNextInteger = function() {
            return asyncAwaiter(moduleContext, void 0, void 0, function*() {
                var rawInputData = yield moduleExports.readInput();
                var tokenIterator = createTokenIterator(rawInputData);
                return function() {
                    return parseInt(tokenIterator.next().value);
                };
            });
        };
        moduleExports.getNextWord = function() {
            return asyncAwaiter(moduleContext, void 0, void 0, function*() {
                var rawInputData = yield moduleExports.readInput();
                var wordIterator = (function() {
                    var wordStartIdx = -1,
                        charIdx = 0;
                    return generatorHelper(this, function(state) {
                        var extractedWord;
                        switch (state.label) {
                            case 0:
                                wordStartIdx = -1;
                                charIdx = 0;
                                state.label = 1;
                            case 1:
                                var isEndOfInput = charIdx > rawInputData.length;
                                var isWhitespaceOrNewline = !isEndOfInput && (rawInputData[charIdx] === " " || rawInputData[charIdx] === "\n");
                                var isWordBoundary = isWhitespaceOrNewline || isEndOfInput;

                                if (isWordBoundary) {
                                    if (wordStartIdx !== -1) {
                                        state.label = 2;
                                        extractedWord = rawInputData.substring(wordStartIdx, charIdx);
                                        wordStartIdx = -1;
                                        return [4, extractedWord];
                                    } else {
                                        state.label = 6;
                                    }
                                } else {
                                    if (wordStartIdx === -1) {
                                        wordStartIdx = charIdx;
                                    }
                                    state.label = 6;
                                }
                                return [3, 7];
                            case 2:
                                state.sent();
                                state.label = 3;
                            case 3:
                                state.label = 4;
                            case 4:
                                return [3, 6];
                            case 5:
                                state.label = 6;
                            case 6:
                                charIdx++;
                                return [3, 1];
                            case 7:
                                return [2];
                        }
                    });
                })();
                return function() {
                    return wordIterator.next().value;
                };
            });
        };
        moduleExports.getNextWordAsInt = function() {
            return asyncAwaiter(moduleContext, void 0, void 0, function*() {
                var wordValueGetter = yield moduleExports.getNextWord();
                return function() {
                    return parseInt(wordValueGetter());
                };
            });
        };
    },
    1: function(moduleFunc, moduleExports) {
        moduleFunc.exports = require("fs");
    },
    17: function(moduleFunc, moduleExports, __webpack_require__) {
        "use strict";
        var asyncAwaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
            var promiseConstructor = P || (P = Promise);
            return new promiseConstructor(function(resolve, reject) {
                function step(result) {
                    try {
                        processNext(generator.next(result));
                    } catch (e) {
                        reject(e);
                    }
                }

                function error(err) {
                    try {
                        processNext(generator.throw(err));
                    } catch (e) {
                        reject(e);
                    }
                }

                function processNext(genResult) {
                    genResult.done ? resolve(genResult.value) : new promiseConstructor(function(res) {
                        res(genResult.value);
                    }).then(step, error);
                }
                processNext((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };
        var generatorHelper = this && this.__generator || function(thisArg, body) {
            var _state, _sent, _ops, _trys,
                generatorState = {
                    label: 0,
                    sent: function() {
                        if (1 & _state[0]) throw _state[1];
                        return _state[1];
                    },
                    trys: [],
                    ops: []
                };
            return _ops = {
                next: createStepFunc(0),
                "throw": createStepFunc(1),
                "return": createStepFunc(2)
            }, "function" == typeof Symbol && (_ops[Symbol.iterator] = function() {
                return this;
            }), _ops;

            function createStepFunc(stepType) {
                return function(value) {
                    return (function(stepType, value) {
                        var isExecuting = _state;
                        if (isExecuting) throw new TypeError("Generator is already executing.");
                        for (; generatorState;) try {
                            if (_state = 1, _sent && (_ops = 2 & stepType ? _sent["return"] : stepType ? _sent["throw"] || ((_ops = _sent["return"]) && _ops.call(_sent), 0) : _sent.next) && !(_ops = _ops.call(_sent, value)).done) return _ops;
                            switch (_sent = 0, _ops && (value = [2 & stepType, _ops.value]), stepType) {
                                case 0:
                                case 1:
                                    _ops = value;
                                    break;
                                case 4:
                                    return generatorState.label++, {
                                        value: value[1],
                                        done: !1
                                    };
                                case 5:
                                    generatorState.label++, _sent = value[1], value = [0];
                                    continue;
                                case 7:
                                    value = generatorState.ops.pop(), generatorState.trys.pop();
                                    continue;
                                default:
                                    if (!((_ops = generatorState.trys).length > 0 && _ops[_ops.length - 1]) && (6 === stepType || 2 === stepType)) {
                                        generatorState = 0;
                                        continue;
                                    }
                                    if (3 === stepType && (!_ops || value[1] > _ops[0] && value[1] < _ops[3])) {
                                        generatorState.label = value[1];
                                        break;
                                    }
                                    if (6 === stepType && generatorState.label < _ops[1]) {
                                        generatorState.label = _ops[1], _ops = value;
                                        break;
                                    }
                                    if (_ops && generatorState.label < _ops[2]) {
                                        generatorState.label = _ops[2], generatorState.ops.push(value);
                                        break;
                                    }
                                    _ops[2] && generatorState.ops.pop(), generatorState.trys.pop();
                                    continue;
                            }
                            value = body.call(thisArg, generatorState);
                        } catch (e) {
                            value = [6, e], _sent = 0;
                        } finally {
                            _state = _ops = 0;
                        }
                        if (5 & value[0]) throw value[1];
                        return {
                            value: value[0] ? value[1] : void 0,
                            done: !0
                        };
                    })([stepType, value]);
                };
            }
        };
        var mainModuleContext = this;

        moduleExports.__esModule = true;
        var inputHelpers = __webpack_require__(0);

        asyncAwaiter(mainModuleContext, void 0, void 0, function*() {
            var getNextIntFunc = yield inputHelpers.getNextWordAsInt();
            var currentNum = getNextIntFunc();

            var isCurrentNumOdd = (currentNum % 2 === 1);

            function processAndPrintPairs(limit, conditionFn) {
                for (let firstLoopVar = 1; firstLoopVar <= limit; firstLoopVar++) {
                    for (let secondLoopVar = firstLoopVar + 1; secondLoopVar <= limit; secondLoopVar++) {
                        if (conditionFn(firstLoopVar, secondLoopVar)) {
                            console.log(`${firstLoopVar} ${secondLoopVar}`);
                        }
                    }
                }
            }

            if (isCurrentNumOdd) {
                processAndPrintPairs(currentNum, (n1, n2) => n1 + n2 !== currentNum);
            } else {
                processAndPrintPairs(currentNum, (n1, n2) => n1 + n2 !== currentNum + 1);
            }
        });
    }
});
