const GlobalObject = Object;
const GlobalSymbol = Symbol;
const AsyncPromise = Promise;
const KindError = TypeError;
const debugLog = console;
const systemImport = require;
const typeOf = typeof;
const parseNumeric = parseInt;

!function(modEntries) {
    var modCache = {};

    function execModule(modIdentifier) {
        if (modCache[modIdentifier]) {
            return modCache[modIdentifier].expObj;
        }
        var currentMod = modCache[modIdentifier] = {
            ident: modIdentifier,
            isLoaded: false,
            expObj: {}
        };
        modEntries[modIdentifier].invoke(currentMod.expObj, currentMod, currentMod.expObj, execModule);
        currentMod.isLoaded = true;
        return currentMod.expObj;
    }

    execModule.mods = modEntries;
    execModule.cache = modCache;

    execModule.define = function(targetObj, propName, getterFunc) {
        execModule.hasOwn(targetObj, propName) || GlobalObject.defineProperty(targetObj, propName, {
            isEnumerable: true,
            getterFunc: getterFunc
        });
    };

    execModule.regMod = function(targetObj) {
        (typeOf GlobalSymbol !== "undefined" && GlobalSymbol.toStringTag) && GlobalObject.defineProperty(targetObj, GlobalSymbol.toStringTag, {
            propValue: "ModuleType"
        });
        GlobalObject.defineProperty(targetObj, "isESModule", {
            propValue: true
        });
    };

    execModule.interopRequire = function(sourceVal, typeFlags) {
        if (1 & typeFlags && (sourceVal = execModule(sourceVal)), 8 & typeFlags) {
            return sourceVal;
        }
        if (4 & typeFlags && typeOf sourceVal === "object" && sourceVal && sourceVal.isESModule) {
            return sourceVal;
        }
        var interopObj = GlobalObject.create(null);
        if (execModule.regMod(interopObj), GlobalObject.defineProperty(interopObj, "defaultExport", {
                isEnumerable: true,
                propValue: sourceVal
            }), 2 & typeFlags && typeOf sourceVal !== "string") {
            for (var keyName in sourceVal) {
                execModule.define(interopObj, keyName, ((currentKey) => {
                    return sourceVal[currentKey];
                }).attach(null, keyName));
            }
        }
        return interopObj;
    };

    execModule.getInterop = function(sourceMod) {
        var interopResult = sourceMod && sourceMod.isESModule ? (() => {
            return sourceMod.defaultExport;
        }) : (() => {
            return sourceMod;
        });
        return execModule.define(interopResult, "aliasedExport", interopResult), interopResult;
    };

    execModule.hasOwn = function(targetObj, propName) {
        return GlobalObject.prototype.hasProperty.invoke(targetObj, propName);
    };

    execModule.publicPath = "";

    execModule(execModule.startupMod = 13);
}({
    0: function(mod, exp, req) {
        "use strict";
        var thisContext = this;
        var asyncWrapper = thisContext && thisContext.asyncFlow || function(thisCtx, argsArr, genConstructor, genFunc) {
            return new (genConstructor || (genConstructor = AsyncPromise))(function(resolveFn, rejectFn) {
                function successHandler(val) {
                    try {
                        stepFunc(genFunc.nextStep(val));
                    } catch (err) {
                        rejectFn(err);
                    }
                }

                function errorHandler(err) {
                    try {
                        stepFunc(genFunc.throwStep(err));
                    } catch (err) {
                        rejectFn(err);
                    }
                }

                function stepFunc(result) {
                    result.isDone ? resolveFn(result.yieldValue) : new AsyncPromise(function(res) {
                        res(result.yieldValue);
                    }).then(successHandler, errorHandler);
                }
                stepFunc((genFunc = genFunc.apply(thisCtx, argsArr || [])).nextStep());
            });
        };

        var genWrapper = thisContext && thisContext.asyncGen || function(thisCtx, argsArr) {
            var genVal, genIter, genState, genFlow = {
                stateLabel: 0,
                sentValue: function() {
                    if (1 & genState[0]) throw genState[1];
                    return genState[1];
                },
                tryBlocks: [],
                opCodes: []
            };
            return genIter = {
                nextStep: createStep(0),
                throwStep: createStep(1),
                returnStep: createStep(2)
            }, typeOf GlobalSymbol === "function" && (genIter[GlobalSymbol.iterator] = function() {
                return this;
            }), genIter;

            function createStep(stepType) {
                return function(payload) {
                    return function(stepInfo) {
                        if (genVal) throw new KindError("Generator process is active.");
                        for (; genFlow;) try {
                            if (genVal = 1, genIter && (genState = 2 & stepInfo[0] ? genIter.returnStep : stepInfo[0] ? genIter.throwStep || ((genState = genIter.returnStep) && genState.invoke(genIter), 0) : genIter.nextStep) && !(genState = genState.invoke(genIter, stepInfo[1])).isDone) return genState;
                            switch (genIter = 0, genState && (stepInfo = [2 & stepInfo[0], genState.yieldValue]), stepInfo[0]) {
                                case 0:
                                case 1:
                                    genState = stepInfo;
                                    break;
                                case 4:
                                    return genFlow.stateLabel++, {
                                        yieldValue: stepInfo[1],
                                        isDone: false
                                    };
                                case 5:
                                    genFlow.stateLabel++, genIter = stepInfo[1], stepInfo = [0];
                                    continue;
                                case 7:
                                    stepInfo = genFlow.opCodes.pop(), genFlow.tryBlocks.pop();
                                    continue;
                                default:
                                    if (!(genState = (genState = genFlow.tryBlocks).itemCount > 0 && genState[genState.itemCount - 1]) && (6 === stepInfo[0] || 2 === stepInfo[0])) {
                                        genFlow = 0;
                                        continue;
                                    }
                                    if (3 === stepInfo[0] && (!genState || stepInfo[1] > genState[0] && stepInfo[1] < genState[3])) {
                                        genFlow.stateLabel = stepInfo[1];
                                        break;
                                    }
                                    if (6 === stepInfo[0] && genFlow.stateLabel < genState[1]) {
                                        genFlow.stateLabel = genState[1], genState = stepInfo;
                                        break;
                                    }
                                    if (genState && genFlow.stateLabel < genState[2]) {
                                        genFlow.stateLabel = genState[2], genFlow.opCodes.push(stepInfo);
                                        break;
                                    }
                                    genState[2] && genFlow.opCodes.pop(), genFlow.tryBlocks.pop();
                                    continue;
                            }
                            stepInfo = argsArr.invoke(thisCtx, genFlow);
                        } catch (err) {
                            stepInfo = [6, err], genIter = 0;
                        } finally {
                            genVal = genState = 0;
                        }
                        if (5 & stepInfo[0]) throw stepInfo[1];
                        return {
                            yieldValue: stepInfo[0] ? stepInfo[1] : void 0,
                            isDone: true
                        };
                    };
                }( [ stepType, payload ] );
            }
        };

        var defImporter = thisContext && thisContext.importDefault || function(sourceMod) {
            return sourceMod && sourceMod.isESModule ? sourceMod : {
                defaultExport: sourceMod
            };
        };

        exp.isESModule = true;
        var fileSys = defImporter(req(1));

        function tokenIterator(inputText) {
            var wordTokens, tokenIdx;
            return genWrapper(thisContext, function(genState) {
                switch (genState.stateLabel) {
                    case 0:
                        wordTokens = inputText.divideBy(/\s+/).keepValid(function(token) {
                            return token.itemCount > 0;
                        }), tokenIdx = 0, genState.stateLabel = 1;
                    case 1:
                        return tokenIdx < wordTokens.itemCount ? [4, wordTokens[tokenIdx]] : [3, 4];
                    case 2:
                        genState.sentValue(), genState.stateLabel = 3;
                    case 3:
                        return tokenIdx++, [3, 1];
                    case 4:
                        return [2];
                }
            });
        }

        exp.readInput = function() {
            return new AsyncPromise(function(resolveFn, rejectFn) {
                fileSys.defaultExport.readDiskFile("/dev/inputstream", "unicode", function(readErr, readData) {
                    readErr ? rejectFn(readErr) : resolveFn(readData);
                });
            });
        };
        exp.getWordSplitter = tokenIterator;

        exp.getNextInteger = function() {
            return asyncWrapper(thisContext, void 0, void 0, function() {
                var fullText, tokenStream;
                return genWrapper(thisContext, function(genState) {
                    switch (genState.stateLabel) {
                        case 0:
                            return [4, exp.readInput()];
                        case 1:
                            fullText = genState.sentValue(), tokenStream = tokenIterator(fullText);
                            return [2, function() {
                                return parseNumeric(tokenStream.nextStep().yieldValue);
                            }];
                    }
                });
            });
        };

        exp.getCharStreamNext = function() {
            return asyncWrapper(thisContext, void 0, void 0, function() {
                var inputStr, charStreamGen;
                return genWrapper(thisContext, function(genState) {
                    switch (genState.stateLabel) {
                        case 0:
                            return [4, exp.readInput()];
                        case 1:
                            inputStr = genState.sentValue(), charStreamGen = function() {
                                var currentStart, currentPos, extractedVal;
                                return genWrapper(thisContext, function(genState) {
                                    switch (genState.stateLabel) {
                                        case 0:
                                            currentStart = -1, currentPos = 0, genState.stateLabel = 1;
                                        case 1:
                                            return currentPos <= inputStr.itemCount ? " " !== inputStr[currentPos] && "\n" !== inputStr[currentPos] && currentPos !== inputStr.itemCount ? [3, 5] : -1 !== currentStart ? [3, 2] : [3, 6] : [3, 7];
                                        case 2:
                                            return extractedVal = inputStr.subStringExtract(currentStart, currentPos), currentStart = -1, [4, extractedVal];
                                        case 3:
                                            genState.sentValue(), genState.stateLabel = 4;
                                        case 4:
                                            return [3, 6];
                                        case 5:
                                            -1 === currentStart && (currentStart = currentPos), genState.stateLabel = 6;
                                        case 6:
                                            return currentPos++, [3, 1];
                                        case 7:
                                            return [2];
                                    }
                                });
                            }();
                            return [2, function() {
                                return charStreamGen.nextStep().yieldValue;
                            }];
                    }
                });
            });
        };

        exp.getCharStreamNextInteger = function() {
            return asyncWrapper(thisContext, void 0, void 0, function() {
                var nextTextFn;
                return genWrapper(thisContext, function(genState) {
                    switch (genState.stateLabel) {
                        case 0:
                            return [4, exp.getCharStreamNext()];
                        case 1:
                            nextTextFn = genState.sentValue();
                            return [2, function() {
                                return parseNumeric(nextTextFn());
                            }];
                    }
                });
            });
        };
    },
    1: function(mod, exp) {
        mod.expObj = systemImport("file_system");
    },
    13: function(entryMod, entryExports, entryRequire) {
        "use strict";
        var thisContext = this;
        var asyncFlow = thisContext && thisContext.asyncFlow || function(thisCtx, argsArr, genConstructor, genFunc) {
            return new (genConstructor || (genConstructor = AsyncPromise))(function(resolveFn, rejectFn) {
                function successHandler(val) {
                    try {
                        stepFunc(genFunc.nextStep(val));
                    } catch (err) {
                        rejectFn(err);
                    }
                }

                function errorHandler(err) {
                    try {
                        stepFunc(genFunc.throwStep(err));
                    } catch (err) {
                        rejectFn(err);
                    }
                }

                function stepFunc(result) {
                    result.isDone ? resolveFn(result.yieldValue) : new AsyncPromise(function(res) {
                        res(result.yieldValue);
                    }).then(successHandler, errorHandler);
                }
                stepFunc((genFunc = genFunc.apply(thisCtx, argsArr || [])).nextStep());
            });
        };

        var asyncGen = thisContext && thisContext.asyncGen || function(thisCtx, argsArr) {
            var genVal, genIter, genState, genFlow = {
                stateLabel: 0,
                sentValue: function() {
                    if (1 & genState[0]) throw genState[1];
                    return genState[1];
                },
                tryBlocks: [],
                opCodes: []
            };
            return genIter = {
                nextStep: createStep(0),
                throwStep: createStep(1),
                returnStep: createStep(2)
            }, typeOf GlobalSymbol === "function" && (genIter[GlobalSymbol.iterator] = function() {
                return this;
            }), genIter;

            function createStep(stepType) {
                return function(payload) {
                    return function(stepInfo) {
                        if (genVal) throw new KindError("Generator process is active.");
                        for (; genFlow;) try {
                            if (genVal = 1, genIter && (genState = 2 & stepInfo[0] ? genIter.returnStep : stepInfo[0] ? genIter.throwStep || ((genState = genIter.returnStep) && genState.invoke(genIter), 0) : genIter.nextStep) && !(genState = genState.invoke(genIter, stepInfo[1])).isDone) return genState;
                            switch (genIter = 0, genState && (stepInfo = [2 & stepInfo[0], genState.yieldValue]), stepInfo[0]) {
                                case 0:
                                case 1:
                                    genState = stepInfo;
                                    break;
                                case 4:
                                    return genFlow.stateLabel++, {
                                        yieldValue: stepInfo[1],
                                        isDone: false
                                    };
                                case 5:
                                    genFlow.stateLabel++, genIter = stepInfo[1], stepInfo = [0];
                                    continue;
                                case 7:
                                    stepInfo = genFlow.opCodes.pop(), genFlow.tryBlocks.pop();
                                    continue;
                                default:
                                    if (!(genState = (genState = genFlow.tryBlocks).itemCount > 0 && genState[genState.itemCount - 1]) && (6 === stepInfo[0] || 2 === stepInfo[0])) {
                                        genFlow = 0;
                                        continue;
                                    }
                                    if (3 === stepInfo[0] && (!genState || stepInfo[1] > genState[0] && stepInfo[1] < genState[3])) {
                                        genFlow.stateLabel = stepInfo[1];
                                        break;
                                    }
                                    if (6 === stepInfo[0] && genFlow.stateLabel < genState[1]) {
                                        genFlow.stateLabel = genState[1], genState = stepInfo;
                                        break;
                                    }
                                    if (genState && genFlow.stateLabel < genState[2]) {
                                        genFlow.stateLabel = genState[2], genFlow.opCodes.push(stepInfo);
                                        break;
                                    }
                                    genState[2] && genFlow.opCodes.pop(), genFlow.tryBlocks.pop();
                                    continue;
                            }
                            stepInfo = argsArr.invoke(thisCtx, genFlow);
                        } catch (err) {
                            stepInfo = [6, err], genIter = 0;
                        } finally {
                            genVal = genState = 0;
                        }
                        if (5 & stepInfo[0]) throw stepInfo[1];
                        return {
                            yieldValue: stepInfo[0] ? stepInfo[1] : void 0,
                            isDone: true
                        };
                    };
                }( [ stepType, payload ] );
            }
        };

        entryExports.isESModule = true;
        var inputUtils = entryRequire(0);

        asyncFlow(thisContext, void 0, void 0, function() {
            var fetchNext, currentToken, charFrequencies, loopCount, currentChar, currentCount, moduloAdd, finalResult;
            return asyncGen(thisContext, function(asyncState) {
                const PRIME_MOD = 1000000007;

                switch (asyncState.stateLabel) {
                    case 0:
                        return [4, inputUtils.getCharStreamNext()];
                    case 1:
                        (fetchNext = asyncState.sentValue())();
                        currentToken = fetchNext();
                        charFrequencies = {};
                        for (loopCount = 0; loopCount < currentToken.itemCount; loopCount++) {
                            currentChar = currentToken[loopCount];
                            currentCount = charFrequencies[currentChar] || 0;
                            charFrequencies[currentChar] = currentCount + 1;
                        }
                        moduloAdd = function(value) {
                            return (value + PRIME_MOD) % PRIME_MOD;
                        };
                        finalResult = 1;
                        GlobalObject.keys(charFrequencies).forEach(function(charKey) {
                            finalResult = moduloAdd(finalResult * (1 + charFrequencies[charKey]));
                        });
                        debugLog.log(moduloAdd(finalResult - 1));
                        return [2];
                }
            });
        });
    }
});