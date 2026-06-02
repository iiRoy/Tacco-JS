module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);
        moduleObject.l = true;
        return moduleObject.exports;
    }

    moduleLoader.m = moduleDefinitions;
    moduleLoader.c = moduleCache;

    moduleLoader.d = function(targetObject, propertyName, getterFunction) {
        var hasExistingProperty = moduleLoader.o(targetObject, propertyName);
        if (!hasExistingProperty) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.r = function(exportsObject) {
        var isSymbolAvailable = typeof Symbol !== "undefined";
        var hasToStringTagSymbol = isSymbolAvailable && Symbol.toStringTag;
        if (hasToStringTagSymbol) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    moduleLoader.t = function(value, mode) {
        var processedValue = value;
        var isModeOne = (1 & mode);
        if (isModeOne) {
            processedValue = moduleLoader(value);
        }
        var isModeEight = (8 & mode);
        if (isModeEight) {
            return processedValue;
        }
        var isObjectAndEsModule = (4 & mode) && typeof processedValue === "object" && processedValue && processedValue.__esModule;
        if (isObjectAndEsModule) {
            return processedValue;
        }
        var defaultExportObject = Object.create(null);
        moduleLoader.r(defaultExportObject);
        Object.defineProperty(defaultExportObject, "default", {
            enumerable: true,
            value: processedValue
        });
        var isModeTwoAndNotString = (2 & mode) && typeof processedValue !== "string";
        if (isModeTwoAndNotString) {
            for (var key in processedValue) {
                moduleLoader.d(defaultExportObject, key, (function(currentKey) {
                    return processedValue[currentKey];
                }).bind(null, key));
            }
        }
        return defaultExportObject;
    };

    moduleLoader.n = function(moduleExports) {
        var getterFunction;
        if (moduleExports && moduleExports.__esModule) {
            getterFunction = function() {
                return moduleExports.default;
            };
        } else {
            getterFunction = function() {
                return moduleExports;
            };
        }
        moduleLoader.d(getterFunction, "a", getterFunction);
        return getterFunction;
    };

    moduleLoader.o = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    moduleLoader.p = "";

    return moduleLoader(moduleLoader.s = 0);
}([
    function(currentModule, currentExports, currentRequire) {
        const fileSystemModule = currentRequire(2);
        const mixtureSolverModule = currentRequire(1);
        const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        mixtureSolverModule(standardInputData);
    },
    function(currentModule, currentExports) {
        function _getArrayFromIterableWithLimit(iterableInput, limitCount) {
            var resultCollection = [];
            var iterationDone = false;
            var encounteredError = false;
            var caughtErrorValue = undefined;
            try {
                for (var _iterator = iterableInput[Symbol.iterator](), _step; !(iterationDone = (_step = _iterator.next()).done) && (resultCollection.push(_step.value), !limitCount || resultCollection.length !== limitCount); iterationDone = true) {}
            } catch (err) {
                encounteredError = true;
                caughtErrorValue = err;
            } finally {
                try {
                    if (!iterationDone && _iterator["return"] != null) {
                        _iterator["return"]();
                    }
                } finally {
                    if (encounteredError) {
                        throw caughtErrorValue;
                    }
                }
            }
            return resultCollection;
        }

        function _ensureIsArray(potentialArray) {
            if (Array.isArray(potentialArray)) {
                return potentialArray;
            }
            return _getArrayFromIterableWithLimit(potentialArray);
        }

        function _destructureInputArray(inputSource, expectedLength) {
            var arrayCheckResult = _ensureIsArray(inputSource);
            if (arrayCheckResult) {
                return arrayCheckResult;
            }
            var iterableCheckResult = _getArrayFromIterableWithLimit(inputSource, expectedLength);
            if (iterableCheckResult) {
                return iterableCheckResult;
            }
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }

        currentExports.solveMixture = function(inputString) {
            const HUNDRED_PERCENT = 100;
            const INITIAL_VALUE_ZERO = 0;

            const firstInputLine = inputString.split("\n")[INITIAL_VALUE_ZERO];
            const stringTokens = firstInputLine.split(" ");
            const numericalTokens = stringTokens.map(function(token) {
                return Number(token);
            });

            const parameters = _destructureInputArray(numericalTokens, 6);

            const waterAdditiveA = parameters[INITIAL_VALUE_ZERO];
            const waterAdditiveB = parameters[1];
            const sugarAdditiveC = parameters[2];
            const sugarAdditiveD = parameters[3];
            const maxSugarRatioE = parameters[4]; // Original 'i'
            const maxTotalWeightF = parameters[5]; // Original 's'

            const sugarConcentrationLimitDenominator = HUNDRED_PERCENT + maxSugarRatioE;
            const maxAllowedSugarConcentration = (HUNDRED_PERCENT * maxSugarRatioE) / sugarConcentrationLimitDenominator; // Original 'f'

            let visitedMixtureStates = {};
            let optimalMixtureResult = {
                water: INITIAL_VALUE_ZERO,
                sugar: INITIAL_VALUE_ZERO,
                p: INITIAL_VALUE_ZERO
            };

            let processingQueue = [{
                water: INITIAL_VALUE_ZERO,
                sugar: INITIAL_VALUE_ZERO
            }];

            while (processingQueue.length > INITIAL_VALUE_ZERO) {
                const currentMixtureState = processingQueue.shift();
                const currentWaterAmount = currentMixtureState.water;
                const currentSugarAmount = currentMixtureState.sugar;
                const currentTotalMixtureWeight = currentWaterAmount + currentSugarAmount;

                if (currentTotalMixtureWeight > maxTotalWeightF) {
                    continue; // Skip if total weight exceeds the maximum allowed
                }

                const stateIdentifier = `${currentWaterAmount}-${currentSugarAmount}`;
                if (visitedMixtureStates[stateIdentifier] === 1) {
                    continue; // Skip if this state has already been processed
                }
                visitedMixtureStates[stateIdentifier] = 1; // Mark state as visited

                let currentSugarConcentration = INITIAL_VALUE_ZERO;
                if (currentTotalMixtureWeight > INITIAL_VALUE_ZERO) {
                    currentSugarConcentration = (HUNDRED_PERCENT * currentSugarAmount) / currentTotalMixtureWeight;
                }

                const isConcentrationHigher = currentSugarConcentration > optimalMixtureResult.p;
                const isConcentrationWithinLimit = currentSugarConcentration <= maxAllowedSugarConcentration;

                if (isConcentrationHigher && isConcentrationWithinLimit) {
                    optimalMixtureResult.p = currentSugarConcentration;
                    optimalMixtureResult.water = currentWaterAmount;
                    optimalMixtureResult.sugar = currentSugarAmount;
                }

                // Add new possible states to the queue
                // Add water A
                processingQueue.push({
                    water: currentWaterAmount + HUNDRED_PERCENT * waterAdditiveA,
                    sugar: currentSugarAmount
                });
                // Add water B
                processingQueue.push({
                    water: currentWaterAmount + HUNDRED_PERCENT * waterAdditiveB,
                    sugar: currentSugarAmount
                });
                // Add sugar C
                processingQueue.push({
                    water: currentWaterAmount,
                    sugar: currentSugarAmount + sugarAdditiveC
                });
                // Add sugar D
                processingQueue.push({
                    water: currentWaterAmount,
                    sugar: currentSugarAmount + sugarAdditiveD
                });
            }

            // Handle the edge case where no sugar was added, ensuring a valid water amount
            const isInitialStateUnchanged = optimalMixtureResult.water === INITIAL_VALUE_ZERO && optimalMixtureResult.sugar === INITIAL_VALUE_ZERO;
            if (isInitialStateUnchanged) {
                optimalMixtureResult.water = HUNDRED_PERCENT * waterAdditiveA;
            }

            console.log(`${optimalMixtureResult.water + optimalMixtureResult.sugar} ${optimalMixtureResult.sugar}`);
        };
    },
    function(currentModule, currentExports) {
        currentModule.exports = require("fs");
    }
]);
