/*
 * This file is a Type II clone of an existing JavaScript module bundle.
 * All identifiers, whitespace, and comments have been altered while preserving
 * the original logic and control flow.
 */
!function(moduleDefinitions)
{
    let moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        let moduleInstance = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleInstance.exports, moduleInstance, moduleInstance.exports, moduleLoader);
        moduleInstance.loaded = true;
        return moduleInstance.exports;
    }

    moduleLoader.definitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = function(target, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(target, propertyName)) {
            Object.defineProperty(target, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.registerEsModule = function(targetObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetObject, '__esModule', { value: true });
    };

    moduleLoader.resolveExport = function(moduleReference, exportKind) {
        if (exportKind & 1) {
            moduleReference = moduleLoader(moduleReference);
        }
        if (exportKind & 8) {
            return moduleReference;
        }
        if (exportKind & 4 && typeof moduleReference === 'object' && moduleReference && moduleReference.__esModule) {
            return moduleReference;
        }
        let exportObject = Object.create(null);
        moduleLoader.registerEsModule(exportObject);
        Object.defineProperty(exportObject, 'default', { enumerable: true, value: moduleReference });
        if (exportKind & 2 && typeof moduleReference !== 'string') {
            for (let prop in moduleReference) {
                moduleLoader.defineExport(exportObject, prop, (function(propName) {
                    return moduleReference[propName];
                }).bind(null, prop));
            }
        }
        return exportObject;
    };

    moduleLoader.normalizeExport = function(exportValue) {
        let normalizedFunction = exportValue && exportValue.__esModule ?
            function() { return exportValue.default; } :
            function() { return exportValue; };
        moduleLoader.defineExport(normalizedFunction, 'a', normalizedFunction);
        return normalizedFunction;
    };

    moduleLoader.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    moduleLoader.publicPath = '';

    moduleLoader(moduleLoader.startupModule = 4);
}([
    // Module 0: Input Utilities
    function(currentModule, moduleExports, moduleRequester) {
        "use strict";
        let asyncExecutor = this && this.__awaiter || function(scopeRef, argsArray, promiseConstructor, generatorFunction) {
            return new (promiseConstructor || (promiseConstructor = Promise))(function(resolvePromise, rejectPromise) {
                function stepExecutor(value) {
                    try {
                        processStep(generatorFunction.next(value));
                    } catch (error) {
                        rejectPromise(error);
                    }
                }
                function handleError(error) {
                    try {
                        processStep(generatorFunction.throw(error));
                    } catch (error) {
                        rejectPromise(error);
                    }
                }
                function processStep(stepInfo) {
                    stepInfo.done ? resolvePromise(stepInfo.value) : new promiseConstructor(function(nextStep) {
                        nextStep(stepInfo.value);
                    }).then(stepExecutor, handleError);
                }
                processStep((generatorFunction = generatorFunction.apply(scopeRef, argsArray || [])).next());
            });
        };
        let generatorFactory = this && this.__generator || function(genFunction, genArguments) {
            let genState, currentStep, stepInfo, genResult,
            internalState = {
                label: 0,
                sent: function() {
                    if (1 & stepInfo[0]) throw stepInfo[1];
                    return stepInfo[1];
                },
                trys: [],
                ops: []
            };
            let genIterator = {
                next: createMethod(0),
                throw: createMethod(1),
                return: createMethod(2)
            };
            if (typeof Symbol === 'function' && (genIterator[Symbol.iterator] = function() { return this; }), genIterator);

            function createMethod(methodType) {
                return function(paramValue) {
                    return executeGeneratorStep(methodType, paramValue);
                };
            }

            function executeGeneratorStep(methodType, paramValue) {
                return new Promise(function(resolve, reject) {
                    function runStep(stepResult) {
                        if (genState) throw new TypeError("Generator is already executing.");
                        for (; internalState;) {
                            try {
                                if (genState = 1, currentStep && (stepInfo = methodType & 2 ? currentStep.return : methodType ? currentStep.throw || ((stepInfo = currentStep.return) && stepInfo.call(currentStep), 0) : currentStep.next) && !(stepInfo = stepInfo.call(currentStep, paramValue)).done) return resolve(stepInfo);
                                switch (currentStep = 0, stepInfo && (paramValue = [methodType & 2, stepInfo.value]), methodType) {
                                    case 0: case 1: stepInfo = paramValue; break;
                                    case 4: internalState.label++; return resolve({ value: paramValue[1], done: false });
                                    case 5: internalState.label++; currentStep = paramValue[1]; paramValue = [0]; continue;
                                    case 7: internalState.ops.pop(); internalState.trys.pop(); continue;
                                    default:
                                        if (!(stepInfo = internalState.trys.length > 0 && internalState.trys[internalState.trys.length - 1]) && (methodType === 6 || methodType === 2)) { internalState = 0; continue; }
                                        if (methodType === 3 && (!stepInfo || paramValue[1] > stepInfo[0] && paramValue[1] < stepInfo[3])) { internalState.label = paramValue[1]; break; }
                                        if (methodType === 6 && internalState.label < stepInfo[1]) { internalState.label = stepInfo[1]; stepInfo = paramValue; break; }
                                        if (stepInfo && internalState.label < stepInfo[2]) { internalState.label = stepInfo[2]; internalState.ops.push(paramValue); break; }
                                        stepInfo[2] && internalState.ops.pop(); internalState.trys.pop(); continue;
                                }
                                paramValue = genFunction.call(genFunction, internalState);
                            } catch (error) {
                                paramValue = [6, error];
                                currentStep = 0;
                            } finally {
                                genState = stepInfo = 0;
                            }
                            if (5 & paramValue[0]) throw paramValue[1];
                            return resolve({ value: paramValue[0] ? paramValue[1] : undefined, done: true });
                        }
                    }
                    runStep([methodType, paramValue]);
                });
            }
        };
        let importDefaultHelper = this && this.__importDefault || function(moduleObject) {
            return moduleObject && moduleObject.__esModule ? moduleObject : { default: moduleObject };
        };
        let contextRef = this;
        moduleExports.__esModule = true;

        let fileSystemModule = importDefaultHelper(moduleRequester(1));

        function* tokenStreamGenerator(inputText) {
            let tokensArray = inputText.split(/\s+/).filter(function(token) { return token.length > 0; });
            let tokenIndex = 0;
            while (tokenIndex < tokensArray.length) {
                yield tokensArray[tokenIndex];
                tokenIndex++;
            }
        }

        moduleExports.fetchInputContent = function() {
            return new Promise(function(resolveFunc, rejectFunc) {
                fileSystemModule.default.readFile("/dev/stdin", "utf8", function(readError, fileData) {
                    readError ? rejectFunc(readError) : resolveFunc(fileData);
                });
            });
        };

        moduleExports.getTokenStream = tokenStreamGenerator;

        moduleExports.getNextInteger = function() {
            return asyncExecutor(contextRef, undefined, undefined, function* () {
                let textInput, wordIterator;
                textInput = yield moduleExports.fetchInputContent();
                wordIterator = tokenStreamGenerator(textInput);
                return function() {
                    return parseInt(wordIterator.next().value);
                };
            });
        };

        moduleExports.getWordToken = function() {
            return asyncExecutor(contextRef, undefined, undefined, function* () {
                let fullInputText, advancedIterator;
                fullInputText = yield moduleExports.fetchInputContent();
                advancedIterator = (function* () {
                    let startIndex = -1;
                    let charPosition = 0;
                    while (charPosition <= fullInputText.length) {
                        if (fullInputText[charPosition] !== ' ' && fullInputText[charPosition] !== '\n' && charPosition !== fullInputText.length) {
                            if (startIndex === -1) {
                                startIndex = charPosition;
                            }
                        } else {
                            if (startIndex !== -1) {
                                let wordToken = fullInputText.substring(startIndex, charPosition);
                                startIndex = -1;
                                yield wordToken;
                            }
                        }
                        charPosition++;
                    }
                })();
                return function() {
                    return advancedIterator.next().value;
                };
            });
        };

        moduleExports.getNextWordAsInt = function() {
            return asyncExecutor(contextRef, undefined, undefined, function* () {
                let wordFetcher;
                wordFetcher = yield moduleExports.getWordToken();
                return function() {
                    return parseInt(wordFetcher());
                };
            });
        };
    },
    // Module 1: FS dependency
    function(moduleRef, exportObj) {
        moduleRef.exports = require("fs");
    },
    // Module 2 (empty)
    ,
    // Module 3 (empty)
    ,
    // Module 4: Main Application Logic
    function(currentModuleContext, moduleOutput, moduleDemand) {
        "use strict";
        let asyncRunner = this && this.__awaiter || function(scopeReference, argumentsList, promiseConstructorType, generatorFunctionBody) {
            return new (promiseConstructorType || (promiseConstructorType = Promise))(function(resolveCallback, rejectCallback) {
                function executeStep(val) {
                    try {
                        processGeneratorResult(generatorFunctionBody.next(val));
                    } catch (err) {
                        rejectCallback(err);
                    }
                }
                function propagateError(err) {
                    try {
                        processGeneratorResult(generatorFunctionBody.throw(err));
                    } catch (err) {
                        rejectCallback(err);
                    }
                }
                function processGeneratorResult(stepResult) {
                    stepResult.done ? resolveCallback(stepResult.value) : new promiseConstructorType(function(nextValue) {
                        nextValue(stepResult.value);
                    }).then(executeStep, propagateError);
                }
                processGeneratorResult((generatorFunctionBody = generatorFunctionBody.apply(scopeReference, argumentsList || [])).next());
            });
        };
        let generatorBuilder = this && this.__generator || function(genFunc, genParams) {
            let genExec, currentIteration, iterationInfo, genOutput,
            internalGenState = {
                label: 0,
                sent: function() {
                    if (1 & iterationInfo[0]) throw iterationInfo[1];
                    return iterationInfo[1];
                },
                trys: [],
                ops: []
            };
            let genMethods = {
                next: buildMethod(0),
                throw: buildMethod(1),
                return: buildMethod(2)
            };
            if (typeof Symbol === 'function' && (genMethods[Symbol.iterator] = function() { return this; }), genMethods);

            function buildMethod(methodCode) {
                return function(methodArg) {
                    return processGenOperation(methodCode, methodArg);
                };
            }

            function processGenOperation(methodCode, methodArg) {
                return new Promise(function(res, rej) {
                    function advanceGenerator(resultObj) {
                        if (genExec) throw new TypeError("Generator is currently running.");
                        for (; internalGenState;) {
                            try {
                                if (genExec = 1, currentIteration && (iterationInfo = methodCode & 2 ? currentIteration.return : methodCode ? currentIteration.throw || ((iterationInfo = currentIteration.return) && iterationInfo.call(currentIteration), 0) : currentIteration.next) && !(iterationInfo = iterationInfo.call(currentIteration, methodArg)).done) return res(iterationInfo);
                                switch (currentIteration = 0, iterationInfo && (methodArg = [methodCode & 2, iterationInfo.value]), methodCode) {
                                    case 0: case 1: iterationInfo = methodArg; break;
                                    case 4: internalGenState.label++; return res({ value: methodArg[1], done: false });
                                    case 5: internalGenState.label++; currentIteration = methodArg[1]; methodArg = [0]; continue;
                                    case 7: internalGenState.ops.pop(); internalGenState.trys.pop(); continue;
                                    default:
                                        if (!(iterationInfo = internalGenState.trys.length > 0 && internalGenState.trys[internalGenState.trys.length - 1]) && (methodCode === 6 || methodCode === 2)) { internalGenState = 0; continue; }
                                        if (methodCode === 3 && (!iterationInfo || methodArg[1] > iterationInfo[0] && methodArg[1] < iterationInfo[3])) { internalGenState.label = methodArg[1]; break; }
                                        if (methodCode === 6 && internalGenState.label < iterationInfo[1]) { internalGenState.label = iterationInfo[1]; iterationInfo = methodArg; break; }
                                        if (iterationInfo && internalGenState.label < iterationInfo[2]) { internalGenState.label = iterationInfo[2]; internalGenState.ops.push(methodArg); break; }
                                        iterationInfo[2] && internalGenState.ops.pop(); internalGenState.trys.pop(); continue;
                                }
                                methodArg = genFunc.call(genFunc, internalGenState);
                            } catch (err) {
                                methodArg = [6, err];
                                currentIteration = 0;
                            } finally {
                                genExec = iterationInfo = 0;
                            }
                            if (5 & methodArg[0]) throw methodArg[1];
                            return res({ value: methodArg[0] ? methodArg[1] : undefined, done: true });
                        }
                    }
                    advanceGenerator([methodCode, methodArg]);
                });
            }
        };
        let executionScope = this;
        moduleOutput.__esModule = true;

        let bigNumberLogic = moduleDemand(5);
        let inputReaderUtilities = moduleDemand(0);

        asyncRunner(executionScope, undefined, undefined, function* () {
            let nextNumFetcher, initialCountValue, numberCollection, currentIdx;
            nextNumFetcher = yield inputReaderUtilities.getNextWordAsInt();
            initialCountValue = nextNumFetcher();
            new bigNumberLogic.BinaryNumberHandler(nextNumFetcher());
            numberCollection = new Array(initialCountValue);
            for (currentIdx = 0; currentIdx < initialCountValue; currentIdx++) {
                numberCollection[currentIdx] = new bigNumberLogic.BinaryNumberHandler(nextNumFetcher());
            }
            return;
        });
    },
    // Module 5: Binary Number Handler Class
    function(moduleScope, outputExports, dependencyLoader) {
        "use strict";
        outputExports.__esModule = true;
        let BinaryNumberHandler = function() {
            function BinaryNumberHandler(initialValue) {
                let selfRef = this;
                this.logicalOr = function(otherInstance) {
                    return new BinaryNumberHandler(BinaryNumberHandler.performCommonOperation(otherInstance, selfRef, function(bitOne, bitTwo) {
                        return bitOne === '1' || bitTwo === '1' ? '1' : '0';
                    }));
                };
                this.logicalAnd = function(otherInstance) {
                    return new BinaryNumberHandler(BinaryNumberHandler.performCommonOperation(otherInstance, selfRef, function(bitOne, bitTwo) {
                        return bitOne === '1' && bitTwo === '1' ? '1' : '0';
                    }));
                };
                this.logicalXor = function(otherInstance) {
                    return new BinaryNumberHandler(BinaryNumberHandler.performCommonOperation(otherInstance, selfRef, function(bitOne, bitTwo) {
                        return bitOne === '1' && bitTwo === '0' || bitOne === '0' && bitTwo === '1' ? '1' : '0';
                    }));
                };
                this.retrieveBit = function(bitPos) {
                    return selfRef.bit[bitPos];
                };
                this.getLeadingZeroPosition = function() {
                    return selfRef.isZeroValue() ? -1 : selfRef.bit.length - 1;
                };
                this.isZeroValue = function() {
                    return selfRef.bit.length === 1 && selfRef.bit[0] === '0';
                };
                this.toBinaryString = function() {
                    return selfRef.bit.slice(0).reverse().join('');
                };
                this.toDecimalNumber = function() {
                    let decimalAccumulator = 0;
                    for (let bitIndex = 0; bitIndex < selfRef.bit.length; bitIndex++) {
                        if (selfRef.bit[bitIndex] === '1') {
                            decimalAccumulator += Math.pow(2, bitIndex);
                        }
                    }
                    return decimalAccumulator;
                };

                if (typeof initialValue === 'number') {
                    this.bit = BinaryNumberHandler.convertStringToBitArray(initialValue.toString(2));
                } else if (typeof initialValue === 'string') {
                    let cleanedString = initialValue.replace(/^0+/, '');
                    if (cleanedString.length === 0) {
                        cleanedString = '0';
                    }
                    this.bit = BinaryNumberHandler.convertStringToBitArray(cleanedString);
                } else if (Array.isArray(initialValue)) {
                    let lastOneIdx = initialValue.lastIndexOf('1');
                    this.bit = lastOneIdx < 0 ? ['0'] : initialValue.slice(0, lastOneIdx + 1);
                }
            }

            BinaryNumberHandler.isValidBitChar = function(char) {
                return char === '0' || char === '1';
            };

            BinaryNumberHandler.convertStringToBitArray = function(bitString) {
                let bitChars = new Array(bitString.length);
                for (let charIndex = 0; charIndex < bitString.length; charIndex++) {
                    let char = bitString[charIndex];
                    if (!BinaryNumberHandler.isValidBitChar(char)) {
                        throw Error(bitString + " is not a valid bit string");
                    }
                    bitChars[charIndex] = char;
                }
                bitChars.reverse();
                return bitChars;
            };

            BinaryNumberHandler.performCommonOperation = function(operandOne, operandTwo, operationFunction) {
                let maxLength = Math.max(operandOne.bit.length, operandTwo.bit.length);
                let resultArray = new Array(maxLength);
                for (let opIndex = 0; opIndex < maxLength; opIndex++) {
                    let bitOne = opIndex < operandOne.bit.length ? operandOne.bit[opIndex] : '0';
                    let bitTwo = opIndex < operandTwo.bit.length ? operandTwo.bit[opIndex] : '0';
                    let computedBit = operationFunction(bitOne, bitTwo);
                    resultArray[maxLength - opIndex - 1] = computedBit;
                }
                return resultArray;
            };

            return BinaryNumberHandler;
        }();
        outputExports.BinaryNumberHandler = BinaryNumberHandler;
    }
]);
// Input processing performance check