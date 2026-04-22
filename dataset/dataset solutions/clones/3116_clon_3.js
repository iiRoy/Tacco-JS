const loadedModulesCache = {};

function customModuleLoader(moduleId) {
    if (loadedModulesCache[moduleId] && loadedModulesCache[moduleId].hasBeenLoaded) {
        return loadedModulesCache[moduleId].exportObject;
    }

    const currentModuleEntry = loadedModulesCache[moduleId] = {
        identifier: moduleId,
        hasBeenLoaded: false,
        exportObject: {}
    };

    moduleDefinitionsMap[moduleId].call(currentModuleEntry.exportObject, currentModuleEntry, currentModuleEntry.exportObject, customModuleLoader);

    currentModuleEntry.hasBeenLoaded = true;
    return currentModuleEntry.exportObject;
}

customModuleLoader.setExportDescriptor = function(targetObject, propertyName, getterFunction) {
    if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
        Object.defineProperty(targetObject, propertyName, {
            enumerable: true,
            get: getterFunction
        });
    }
};

customModuleLoader.markAsESModule = function(targetObject) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(targetObject, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(targetObject, '__esModule', { value: true });
};

customModuleLoader.hasOwnProp = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
};

const moduleDefinitionsMap = {};

moduleDefinitionsMap[0] = function(currentModule, moduleExports, customRequire) {
    "use strict";

    const asyncOperationContext = this;

    const asyncTaskWrapper = (targetInstance, callArgs, specificPromiseCtor, generatorFunc) => {
        specificPromiseCtor = specificPromiseCtor || (specificPromiseCtor = Promise);
        return new specificPromiseCtor(function(resolve, reject) {
            function processNextStep(result) {
                try {
                    handleGeneratorResult(generatorFunc.next(result));
                } catch (error) {
                    reject(error);
                }
            }

            function processErrorStep(error) {
                try {
                    handleGeneratorResult(generatorFunc.throw(error));
                } catch (error) {
                    reject(error);
                }
            }

            function handleGeneratorResult(iterationOutcome) {
                if (iterationOutcome.done) {
                    resolve(iterationOutcome.value);
                } else {
                    new specificPromiseCtor(function(innerResolve) {
                        innerResolve(iterationOutcome.value);
                    }).then(processNextStep, processErrorStep);
                }
            }
            handleGeneratorResult((generatorFunc = generatorFunc.apply(targetInstance, callArgs || [])).next());
        });
    };

    const generatorStateEngine = (targetInstance, generatorArgs) => {
        let currentExecutionState,
            previousResult,
            operationDetails,
            generatorStateMachine = {
                label: 0,
                sent: function() {
                    if (1 & operationDetails[0]) throw operationDetails[1];
                    return operationDetails[1];
                },
                trys: [],
                ops: []
            };

        const generatorMethods = {
            next: createStepFunction(0),
            throw: createStepFunction(1),
            return: createStepFunction(2)
        };

        if (typeof Symbol === "function" && Symbol.iterator) {
            generatorMethods[Symbol.iterator] = function() { return this; };
        }

        function createStepFunction(actionIdentifier) {
            return function(dataPayload) {
                return function(stateChangeArray) {
                    if (currentExecutionState) throw new TypeError("Generator is already executing.");
                    while (generatorStateMachine) {
                        try {
                            currentExecutionState = 1;
                            if (previousResult && (operationDetails = 2 & stateChangeArray[0] ? previousResult.return : stateChangeArray[0] ? previousResult.throw || ((operationDetails = previousResult.return) && operationDetails.call(previousResult), 0) : previousResult.next) && !(operationDetails = operationDetails.call(previousResult, stateChangeArray[1])).done) {
                                return operationDetails;
                            }
                            previousResult = 0;
                            if (operationDetails && (stateChangeArray = [2 & stateChangeArray[0], operationDetails.value]), stateChangeArray[0]) {
                                switch (stateChangeArray[0]) {
                                    case 0:
                                    case 1:
                                        operationDetails = stateChangeArray;
                                        break;
                                    case 4:
                                        generatorStateMachine.label++;
                                        return { value: stateChangeArray[1], done: false };
                                    case 5:
                                        generatorStateMachine.label++;
                                        previousResult = stateChangeArray[1];
                                        stateChangeArray = [0];
                                        continue;
                                    case 7:
                                        stateChangeArray = generatorStateMachine.ops.pop();
                                        generatorStateMachine.trys.pop();
                                        continue;
                                    default:
                                        if (!(operationDetails = generatorStateMachine.trys.length > 0 && generatorStateMachine.trys[generatorStateMachine.trys.length - 1]) && (6 === stateChangeArray[0] || 2 === stateChangeArray[0])) {
                                            generatorStateMachine = 0;
                                            continue;
                                        }
                                        if (3 === stateChangeArray[0] && (!operationDetails || stateChangeArray[1] > operationDetails[0] && stateChangeArray[1] < operationDetails[3])) {
                                            generatorStateMachine.label = stateChangeArray[1];
                                            break;
                                        }
                                        if (6 === stateChangeArray[0] && generatorStateMachine.label < operationDetails[1]) {
                                            generatorStateMachine.label = operationDetails[1];
                                            operationDetails = stateChangeArray;
                                            break;
                                        }
                                        if (operationDetails && generatorStateMachine.label < operationDetails[2]) {
                                            generatorStateMachine.label = operationDetails[2];
                                            generatorStateMachine.ops.push(stateChangeArray);
                                            break;
                                        }
                                        operationDetails[2] && generatorStateMachine.ops.pop();
                                        generatorStateMachine.trys.pop();
                                        continue;
                                }
                            }
                            stateChangeArray = generatorArgs.call(targetInstance, generatorStateMachine);
                        } catch (error) {
                            stateChangeArray = [6, error, 0, 0];
                            previousResult = 0;
                        } finally {
                            currentExecutionState = operationDetails = 0;
                        }
                        if (5 & stateChangeArray[0]) throw stateChangeArray[1];
                        return { value: stateChangeArray[0] ? stateChangeArray[1] : undefined, done: true };
                    }
                }([actionIdentifier, dataPayload]);
            };
        }
        return generatorMethods;
    };

    const importDefaultShim = (importedModule) => {
        return importedModule && importedModule.__esModule ? importedModule : { default: importedModule };
    };

    customModuleLoader.markAsESModule(moduleExports);

    // Expose the async helpers for other modules to use.
    moduleExports.__awaiter = asyncTaskWrapper;
    moduleExports.__generator = generatorStateEngine;

    const fileSystemModule = importDefaultShim(customRequire(1));

    const SYSTEM_INPUT_FILE_PATH = "/dev/stdin";
    const DEFAULT_FILE_ENCODING = "utf8";

    moduleExports.fetchStandardInput = function() {
        return new Promise((resolve, reject) => {
            if (!fileSystemModule || !fileSystemModule.default || typeof fileSystemModule.default.readFile !== 'function') {
                return reject(new Error("Required 'fs' module is not available or missing 'readFile' function."));
            }
            fileSystemModule.default.readFile(SYSTEM_INPUT_FILE_PATH, DEFAULT_FILE_ENCODING, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    moduleExports.createInputTokenizer = function(rawInputString) {
        if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
            return () => undefined; // Return a no-op tokenizer for empty/invalid input.
        }
        const parsedTokens = rawInputString.trim().split(/\s+/).filter(token => token.length > 0);
        let currentTokenIndex = 0;

        return function getNextToken() {
            if (currentTokenIndex < parsedTokens.length) {
                return parsedTokens[currentTokenIndex++];
            }
            return undefined;
        };
    };

    moduleExports.getNumericInputReader = function() {
        return asyncTaskWrapper(asyncOperationContext, undefined, undefined, generatorStateEngine(asyncOperationContext, function*() {
            let fullInputContent;
            let tokenExtractorFunction;

            // Retrieve the full input string from standard input.
            // The 'yield 4' syntax is specific to the __generator helper for yielding values.
            yield 4;
            fullInputContent = yield moduleExports.fetchStandardInput();

            // Initialize a tokenizing function based on the fetched content.
            tokenExtractorFunction = moduleExports.createInputTokenizer(fullInputContent);

            // Return a function that, when called, provides the next integer.
            yield 4;
            return function getNextParsedInteger() {
                const nextStringToken = tokenExtractorFunction();
                if (nextStringToken === undefined) {
                    return NaN; // Indicate no more tokens or invalid state.
                }
                const parsedValue = parseInt(nextStringToken, 10);
                if (isNaN(parsedValue)) {
                    console.warn(`Warning: Could not parse "${nextStringToken}" as an integer.`);
                }
                return parsedValue;
            };
        }));
    };
};

moduleDefinitionsMap[1] = function(currentModule, moduleExports) {
    currentModule.exportObject = require("fs");
};

moduleDefinitionsMap[17] = function(currentModule, moduleExports, customRequire) {
    "use strict";

    const mainExecutionContext = this;

    // Re-import the TypeScript async helpers as they are part of module 0.
    const asyncTaskWrapper = customRequire(0).__awaiter;
    const generatorStateEngine = customRequire(0).__generator;

    // Import the input utility functions from module 0.
    const inputHandlingUtilities = customRequire(0);

    /**
     * Prints a pair of numbers to the console, formatted as "numA numB".
     * @param {number} val1 - The first number.
     * @param {number} val2 - The second number.
     */
    const outputNumberPair = (val1, val2) => {
        console.log(`${val1} ${val2}`);
    };

    // Main application entry point, wrapped in an async task.
    asyncTaskWrapper(mainExecutionContext, undefined, undefined, generatorStateEngine(mainExecutionContext, function*() {
        let numericInputGetter; // Function to retrieve the next integer from the input stream.
        let primaryInputNumber; // The main number read from input, which dictates loop bounds.
        let forbiddenSumValue; // The sum value that will cause a pair to be excluded.

        // Step 1: Acquire the function responsible for getting numeric input.
        // This involves an asynchronous read of the entire standard input.
        yield 4;
        numericInputGetter = yield inputHandlingUtilities.getNumericInputReader();

        // Step 2: Fetch the actual numerical input for this execution.
        primaryInputNumber = numericInputGetter();

        // Guard clause: Validate the fetched input.
        if (isNaN(primaryInputNumber) || primaryInputNumber <= 0 || !Number.isInteger(primaryInputNumber)) {
            console.error("Error: Received invalid, non-positive, or non-integer input. Please provide a positive integer.");
            return; // Exit if input is invalid.
        }

        // Step 3: Determine the exclusion rule based on the parity of the input number.
        const isPrimaryInputOdd = (primaryInputNumber % 2) === 1;

        if (isPrimaryInputOdd) {
            // If the input number is odd, exclude pairs that sum up to exactly the input number.
            forbiddenSumValue = primaryInputNumber;
        } else {
            // If the input number is even, exclude pairs that sum up to the input number plus one.
            forbiddenSumValue = primaryInputNumber + 1;
        }

        // Step 4: Iterate through all possible pairs and apply the exclusion rule.
        // The outer loop handles the first element of the pair.
        for (let firstElement = 1; firstElement <= primaryInputNumber; firstElement++) {
            // The inner loop handles the second element, ensuring it's always greater than the first.
            for (let secondElement = firstElement + 1; secondElement <= primaryInputNumber; secondElement++) {
                // Check if the current pair's sum matches the forbidden sum value.
                if ((firstElement + secondElement) !== forbiddenSumValue) {
                    outputNumberPair(firstElement, secondElement);
                }
            }
        }
        // End of main logic execution.
        yield 2;
    }));
};

// Initiate the application by loading the entry point module (Module 17).
customModuleLoader(17);