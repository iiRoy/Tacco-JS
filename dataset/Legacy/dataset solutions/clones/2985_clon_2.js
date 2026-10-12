!function(moduleList){
  var cacheMap = {};

  function loadModule(moduleId) {
    // Check if the module is already in the cache.
    if (cacheMap[moduleId]) return cacheMap[moduleId].exports;

    // If not, create a new module object and store it.
    var modObj = cacheMap[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };

    // Execute the module's function, populating its exports.
    moduleList[moduleId].call(modObj.exports, modObj, modObj.exports, loadModule);
    modObj.loaded = true;
    return modObj.exports;
  }

  // Webpack-like utility functions attached to the module loader.
  loadModule.moduleDefinitions = moduleList;
  loadModule.moduleCache = cacheMap;

  loadModule.definePropertyGetter = function(targetObject, propertyName, getterFunction) {
    loadModule.hasOwn(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
      enumerable: true,
      get: getterFunction
    });
  };

  loadModule.registerModule = function(targetModule) {
    if ("undefined" != typeof Symbol && Symbol.toStringTag) Object.defineProperty(targetModule, Symbol.toStringTag, {
      value: "Module"
    });
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  loadModule.resolveModule = function(moduleRef, flags) {
    if (1 & flags && (moduleRef = loadModule(moduleRef)), 8 & flags) return moduleRef;
    if (4 & flags && "object" == typeof moduleRef && moduleRef && moduleRef.__esModule) return moduleRef;
    var resultObject = Object.create(null);
    if (loadModule.registerModule(resultObject), Object.defineProperty(resultObject, "default", {
        enumerable: true,
        value: moduleRef
      }), 2 & flags && "string" != typeof moduleRef)
      for (var propKey in moduleRef)
        loadModule.definePropertyGetter(resultObject, propKey, function(key) {
          return moduleRef[key];
        }.bind(null, propKey));
    return resultObject;
  };

  loadModule.namespaceExport = function(moduleRef) {
    var getExport = moduleRef && moduleRef.__esModule ? function() {
      return moduleRef.default;
    } : function() {
      return moduleRef;
    };
    return loadModule.definePropertyGetter(getExport, "a", getExport), getExport;
  };

  loadModule.hasOwn = function(checkObject, property) {
    return Object.prototype.hasOwnProperty.call(checkObject, property);
  };

  loadModule.publicPath = ""; // Empty public path for the bundle.
  loadModule(loadModule.startupModule = 2); // Set the entry module and initiate loading.

}([
  // Module 0: File System (fs)
  function(currentModule, moduleExports) {
    currentModule.exports = require("fs");
  },
  // Module 1: Readline (readline)
  function(currentModule, moduleExports) {
    currentModule.exports = require("readline");
  },
  // Module 2: Main application logic
  function(currentModule, moduleExports, loadModule) {
    "use strict";
    loadModule.registerModule(moduleExports);

    var problemSetOne = {
      NucleotideComplement: function(inputChar) {
        switch (inputChar[0]) {
          case "A":
            return ["T"];
          case "T":
            return ["A"];
          case "C":
            return ["G"];
          case "G":
            return ["C"];
          default:
            throw new Error("invalid sequence char");
        }
      },
      LongestGeneSegment: function(inputData) {
        var dnaString = inputData[0],
          maxSegmentLength = 0,
          currentSegmentLength = 0,
          charIndex = 0;
        for (; charIndex < dnaString.length; charIndex += 1) {
          var charValue = dnaString[charIndex];
          "A" === charValue || "T" === charValue || "C" === charValue || "G" === charValue ? currentSegmentLength += 1 : currentSegmentLength > maxSegmentLength && (maxSegmentLength = currentSegmentLength, currentSegmentLength = 0);
        }
        return currentSegmentLength > maxSegmentLength && (maxSegmentLength = currentSegmentLength), [String(maxSegmentLength)];
      },
      ACSubstringCount: function(inputLines) {
        var params = inputLines[0].split(" ").map(function(val) {
            return Number(val);
          }),
          stringToAnalyze = (params[0], params[1], inputLines[1]),
          queryRanges = inputLines.slice(2).map(function(line) {
            return line.split(" ").map(function(val) {
              return Number(val);
            });
          }),
          acFlags = stringToAnalyze.split("").map(function(char, charIdx, fullString) {
            return "A" === char && fullString.length > charIdx + 1 && "C" === fullString[charIdx + 1];
          });
        return queryRanges.map(function(range) {
          for (var startIdx = range[0], endIdx = range[1], count = 0, currPos = startIdx - 1; currPos < endIdx - 1; currPos += 1) acFlags[currPos] && (count += 1);
          return String(count);
        });
      }
    };

    var problemSetTwo = {
      countPairs: function(inputStrArr) {
        inputStrArr[0].split(" ").map(function(val) {
          return Number(val);
        })[0];
        var dataSegments = inputStrArr.slice(1),
          totalABCount = 0,
          endsBCount = 0,
          startsACount = 0,
          endsBStartsACount = 0;
        return dataSegments.forEach(function(segment, segmentIdx) {
          "B" === segment[0] && (endsBCount += 1);
          "A" === segment[segment.length - 1] && (startsACount += 1);
          "B" === segment[0] && "A" === segment[segment.length - 1] && (endsBStartsACount += 1);
          totalABCount += (segment.match(/AB/g) || []).length;
        }), startsACount - endsBStartsACount == 0 && endsBCount - endsBStartsACount == 0 ? [String(totalABCount + endsBStartsACount - 1)] : [String(startsACount < endsBCount ? startsACount + totalABCount : endsBCount + totalABCount)];
      },
      sumDivisorPairs: function(inputValues) {
        for (var upperLimit = inputValues[0].split(" ").map(function(val) {
              return Number(val);
            })[0],
            pairSum = 0,
            sqrtLimit = Math.sqrt(upperLimit),
            divisorVal = 1; divisorVal < sqrtLimit; divisorVal += 1) {
          var otherDivisor = (upperLimit - divisorVal) / divisorVal;
          Number.isInteger(otherDivisor) && (pairSum += otherDivisor);
        }
        return [String(pairSum)];
      }
    };

    var stateTrue = true,
      stateFalse = false;

    function calcFlipCost(buttonStates) {
      var flipIndices = function(states) {
        for (var indices = [], idx = 0; idx < states.length - 1; idx += 1)
          states[idx] === stateTrue && states[idx + 1] === stateFalse && indices.push(idx);
        return indices;
      }(buttonStates);
      return 0 === flipIndices.length ? 0 : 1 + Math.max.apply(Math, flipIndices.map(function(index) {
        return calcFlipCost(function(currentStates, pos) {
          var tempStates = currentStates.concat();
          return tempStates[pos] = !tempStates[pos], tempStates[pos + 1] = !tempStates[pos + 1], tempStates;
        }(buttonStates, index));
      }));
    }

    function findMaxChain(numberList) {
      return numberList.length < 2 ? 0 : Math.max.apply(Math, numberList.map(function(currVal, currIdx) {
        var remainingList = numberList.filter(function(item, itemIdx) {
          return itemIdx !== currIdx;
        });
        return Math.max.apply(Math, remainingList.map(function(otherVal, otherIdx) {
          return function(valA, valB) {
            var sumVals = valA + valB;
            return 0 == (sumVals & sumVals - 1);
          }(currVal, otherVal) ? findMaxChain(remainingList.filter(function(item, filterIdx) {
            return filterIdx !== otherIdx;
          })) + 1 : 0;
        }));
      }));
    }

    var problemSetThree = {
      ToggleButtons: function(inputData) {
        return [calcFlipCost(inputData[0].split("").map(function(char) {
          return "B" === char;
        }))];
      },
      PowerOfTwoSubsequences: function(inputData) {
        Number(inputData[0]);
        var categorizedNumbers = function(numbers) {
          var oddNumbers = numbers.filter(function(num) {
              return num % 2 == 1;
            }),
            evenNumbers = numbers.filter(function(num) {
              return num % 2 == 0;
            });
          return {
            oddElements: oddNumbers,
            evenElements: evenNumbers
          };
        }(inputData[1].split(" ").map(function(val) {
          return Number(val);
        }));
        var oddsCollection = categorizedNumbers.oddElements,
          evensCollection = categorizedNumbers.evenElements;
        return [findMaxChain(oddsCollection) + findMaxChain(evensCollection)];
      }
    };

    var fileSystem = loadModule(0),
      fileSystemUtil = loadModule.namespaceExport(fileSystem),
      lineReader = loadModule(1);

    function acquireInputData() {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      var inputLines = [],
        inputInterface = lineReader.createInterface({
          input: process.stdin,
          output: process.stdout
        });
      return inputInterface.on("line", function(line) {
        inputLines.push(line);
      }), new Promise(function(resolveFunc) {
        inputInterface.on("close", function() {
          resolveFunc(inputLines);
        });
      });
    }

    var asyncWrapper = function(thisArg, args, P, generator) {
      return new(P || (P = Promise))(function(resolve, reject) {
        function step(result) {
          try {
            asyncAct(generator.next(result));
          } catch (e) {
            reject(e);
          }
        }

        function error(err) {
          try {
            asyncAct(generator.throw(err));
          } catch (e) {
            reject(e);
          }
        }

        function asyncAct(asyncResult) {
          asyncResult.done ? resolve(asyncResult.value) : new P(function(innerResolve) {
            innerResolve(asyncResult.value);
          }).then(step, error);
        }
        asyncAct((generator = generator.apply(thisArg, args || [])).next());
      });
    };

    var genFunction = function(thisArg, body) {
      var genInternalA, genInternalB, genInternalC, genInternalD,
        state = {
          label: 0,
          sent: function() {
            if (1 & genInternalC[0]) throw genInternalC[1];
            return genInternalC[1];
          },
          trys: [],
          ops: []
        };
      return genInternalD = {
        next: generatorStep(0),
        throw: generatorStep(1),
        return: generatorStep(2)
      }, "function" == typeof Symbol && (genInternalD[Symbol.iterator] = function() {
        return this;
      }), genInternalD;

      function generatorStep(actionCode) {
        return function(actionArg) {
          return (function(operation) {
            if (genInternalA) throw new TypeError("Generator is already executing.");
            for (; state;) try {
              if (genInternalA = 1, genInternalB && (genInternalC = 2 & operation[0] ? genInternalB.return : operation[0] ? genInternalB.throw || ((genInternalC = genInternalB.return) && genInternalC.call(genInternalB), 0) : genInternalB.next) && !(genInternalC = genInternalC.call(genInternalB, operation[1])).done) return genInternalC;
              switch (genInternalB = 0, genInternalC && (operation = [2 & operation[0], genInternalC.value]), operation[0]) {
                case 0:
                case 1:
                  genInternalC = operation;
                  break;
                case 4:
                  state.label++;
                  return {
                    value: operation[1],
                    done: false
                  };
                case 5:
                  state.label++;
                  genInternalB = operation[1];
                  operation = [0];
                  continue;
                case 7:
                  operation = state.ops.pop();
                  state.trys.pop();
                  continue;
                default:
                  if (!(genInternalC = (genInternalC = state.trys).length > 0 && genInternalC[genInternalC.length - 1]) && (6 === operation[0] || 2 === operation[0])) {
                    state = 0;
                    continue;
                  }
                  if (3 === operation[0] && (!genInternalC || operation[1] > genInternalC[0] && operation[1] < genInternalC[3])) {
                    state.label = operation[1];
                    break;
                  }
                  if (6 === operation[0] && state.label < genInternalC[1]) {
                    state.label = genInternalC[1];
                    genInternalC = operation;
                    break;
                  }
                  if (genInternalC && state.label < genInternalC[2]) {
                    state.label = genInternalC[2];
                    state.ops.push(operation);
                    break;
                  }
                  genInternalC[2] && state.ops.pop();
                  state.trys.pop();
                  continue;
              }
              operation = body.call(thisArg, state);
            } catch (e) {
              operation = [6, e];
              genInternalB = 0;
            } finally {
              genInternalA = genInternalC = 0;
            }
            if (5 & operation[0]) throw operation[1];
            return {
              value: operation[0] ? operation[1] : void 0,
              done: true
            };
          })([actionCode, actionArg]);
        };
      }
    };

    function recursiveSort(items) {
      return asyncWrapper(this, void 0, void 0, function() {
        var leftPart, rightPart, sortedLeftPart, sortedRightPart, mergedResults, comparisonResult, currentItem;
        return genFunction(this, function(_genState) {
          switch (_genState.label) {
            case 0:
              return 1 === items.length ? [2, items] : (leftPart = items.slice(0, Math.ceil(items.length / 2)), rightPart = items.slice(Math.ceil(items.length / 2)), [4, recursiveSort(leftPart)]);
            case 1:
              sortedLeftPart = _genState.sent();
              return [4, recursiveSort(rightPart)];
            case 2:
              sortedRightPart = _genState.sent();
              mergedResults = [];
              _genState.label = 3;
            case 3:
              return sortedLeftPart.length > 0 && sortedRightPart.length > 0 ? [4, compareElements(sortedLeftPart[0], sortedRightPart[0])] : [3, 5];
            case 4:
              comparisonResult = _genState.sent();
              (currentItem = comparisonResult ? sortedLeftPart.shift() : sortedRightPart.shift()) && mergedResults.push(currentItem);
              return [3, 3];
            case 5:
              mergedResults.push.apply(mergedResults, sortedLeftPart.concat(sortedRightPart));
              return [2, mergedResults];
          }
        });
      });
    }

    function compareElements(elemA, elemB) {
      return asyncWrapper(this, void 0, void 0, function() {
        return genFunction(this, function(_genState) {
          switch (_genState.label) {
            case 0:
              console.log("? " + elemA + " " + elemB);
              return [4, fileSystemUtil.a.readFileSync("/dev/stdin", "utf8")];
            case 1:
              return [2, "<" === _genState.sent()];
          }
        });
      });
    }

    var contestSolutions = {
      BeginnerContestOneTwoTwo: problemSetOne,
      DivertaContestTwoZeroOneNine: problemSetTwo,
      GrandContestZeroTwoNine: problemSetThree,
      InteractiveSorter: function(inputData) {
        return asyncWrapper(this, void 0, void 0, function() {
          var paramsArray, numElements, baseCharCode, sortedChars;
          return genFunction(this, function(_genState) {
            switch (_genState.label) {
              case 0:
                paramsArray = inputData[0].split(" ").map(function(val) {
                  return Number(val);
                });
                numElements = paramsArray[0];
                paramsArray[1];
                baseCharCode = "A".charCodeAt(0);
                return [4, recursiveSort(Array.apply(null, new Array(numElements)).map(function(unused, idx) {
                  return String.fromCharCode(baseCharCode + idx);
                }))];
              case 1:
                sortedChars = _genState.sent();
                return [2, ["! " + sortedChars.join("")]];
            }
          });
        });
      },
      WelcomeChallenge: function(inputData) {
        var firstVal = Number(inputData[0]),
          secondValArray = inputData[1].split(" ").map(function(val) {
            return Number(val);
          });
        return [firstVal + secondValArray[0] + secondValArray[1] + " " + inputData[2]];
      }
    };

    var asyncExecution = function(thisArg, args, P, generator) {
      return new(P || (P = Promise))(function(resolve, reject) {
        function step(result) {
          try {
            performAsyncAction(generator.next(result));
          } catch (e) {
            reject(e);
          }
        }

        function error(err) {
          try {
            performAsyncAction(generator.throw(err));
          } catch (e) {
            reject(e);
          }
        }

        function performAsyncAction(asyncResult) {
          asyncResult.done ? resolve(asyncResult.value) : new P(function(innerResolve) {
            innerResolve(asyncResult.value);
          }).then(step, error);
        }
        performAsyncAction((generator = generator.apply(thisArg, args || [])).next());
      });
    };

    var generatorFactory = function(thisArg, body) {
      var factoryInternalA, factoryInternalB, factoryInternalC, factoryInternalD,
        state = {
          label: 0,
          sent: function() {
            if (1 & factoryInternalC[0]) throw factoryInternalC[1];
            return factoryInternalC[1];
          },
          trys: [],
          ops: []
        };
      return factoryInternalD = {
        next: createStep(0),
        throw: createStep(1),
        return: createStep(2)
      }, "function" == typeof Symbol && (factoryInternalD[Symbol.iterator] = function() {
        return this;
      }), factoryInternalD;

      function createStep(stepCode) {
        return function(stepArg) {
          return (function(stepOperation) {
            if (factoryInternalA) throw new TypeError("Generator is already executing.");
            for (; state;) try {
              if (factoryInternalA = 1, factoryInternalB && (factoryInternalC = 2 & stepOperation[0] ? factoryInternalB.return : stepOperation[0] ? factoryInternalB.throw || ((factoryInternalC = factoryInternalB.return) && factoryInternalC.call(factoryInternalB), 0) : factoryInternalB.next) && !(factoryInternalC = factoryInternalC.call(factoryInternalB, stepOperation[1])).done) return factoryInternalC;
              switch (factoryInternalB = 0, factoryInternalC && (stepOperation = [2 & stepOperation[0], factoryInternalC.value]), stepOperation[0]) {
                case 0:
                case 1:
                  factoryInternalC = stepOperation;
                  break;
                case 4:
                  state.label++;
                  return {
                    value: stepOperation[1],
                    done: false
                  };
                case 5:
                  state.label++;
                  factoryInternalB = stepOperation[1];
                  stepOperation = [0];
                  continue;
                case 7:
                  stepOperation = state.ops.pop();
                  state.trys.pop();
                  continue;
                default:
                  if (!(factoryInternalC = (factoryInternalC = state.trys).length > 0 && factoryInternalC[factoryInternalC.length - 1]) && (6 === stepOperation[0] || 2 === stepOperation[0])) {
                    state = 0;
                    continue;
                  }
                  if (3 === stepOperation[0] && (!factoryInternalC || stepOperation[1] > factoryInternalC[0] && stepOperation[1] < factoryInternalC[3])) {
                    state.label = stepOperation[1];
                    break;
                  }
                  if (6 === stepOperation[0] && state.label < factoryInternalC[1]) {
                    state.label = factoryInternalC[1];
                    factoryInternalC = stepOperation;
                    break;
                  }
                  if (factoryInternalC && state.label < factoryInternalC[2]) {
                    state.label = factoryInternalC[2];
                    state.ops.push(stepOperation);
                    break;
                  }
                  factoryInternalC[2] && state.ops.pop();
                  state.trys.pop();
                  continue;
              }
              stepOperation = body.call(thisArg, state);
            } catch (e) {
              stepOperation = [6, e];
              factoryInternalB = 0;
            } finally {
              factoryInternalA = factoryInternalC = 0;
            }
            if (5 & stepOperation[0]) throw stepOperation[1];
            return {
              value: stepOperation[0] ? stepOperation[1] : void 0,
              done: true
            };
          })([stepCode, stepArg]);
        };
      }
    };

    !function() {
      asyncExecution(this, void 0, void 0, function() {
        var inputDataLines;
        return generatorFactory(this, function(genState) {
          switch (genState.label) {
            case 0:
              return [4, acquireInputData()];
            case 1:
              inputDataLines = genState.sent();
              contestSolutions.DivertaContestTwoZeroOneNine.sumDivisorPairs(inputDataLines).forEach(function(outputLine) {
                return console.log(outputLine);
              });
              return [2];
          }
        });
      })();
    }();
  }
]);