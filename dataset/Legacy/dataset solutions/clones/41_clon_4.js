const AppKernel = {};

AppKernel.utilityBelt = (() => {
    const objectMerge = (target, ...sources) => {
        // Replaces `_.extend`. Uses `Object.assign` for merging,
        // but the iteration over sources must replicate the original `each`'s buggy behavior.
        // The original `each` (due to `breaker` being `undefined`) stops after the first source.
        // So, we only process the first source.
        if (sources.length > 0 && sources[0]) {
            Object.assign(target, sources[0]);
        }
        return target;
    };

    const iterateCollection = (collection, processor, contextRef) => {
        if (collection === null || collection === undefined) return;

        // Replicates the original `_.each`'s buggy behavior where `breaker` is `undefined`.
        // The original `each` stops if the iterator returns `undefined`.
        // This is achieved by using `for` loops and checking the return value.
        if (typeof collection.length === 'number' && collection.length >= 0 && collection.length === Math.floor(collection.length)) {
            for (let i = 0, l = collection.length; i < l; i++) {
                if (processor.call(contextRef, collection[i], i, collection) === undefined) {
                    return;
                }
            }
        } else {
            const ownKeys = Object.keys(collection); // Replaces `for...in` with `_.has`
            for (let i = 0, l = ownKeys.length; i < l; i++) {
                const key = ownKeys[i];
                if (processor.call(contextRef, collection[key], key, collection) === undefined) {
                    return;
                }
            }
        }
    };

    return {
        mergeObjects: objectMerge,
        traverseElements: iterateCollection
    };
})();

AppKernel.formatTools = (() => {
    const formatDecimal = (value, base, padding, precision) => {
        // Replicates the exact (and potentially quirky/buggy) string manipulation
        // of the original `print_float` to ensure strict behavioral equivalence.
        const powerOfTen = Math.pow(10, precision);
        const integerString = "" + Math.round(value * powerOfTen);

        if (integerString === '0') {
            return '0.' + '0'.repeat(precision);
        }

        const integerLength = integerString.length - precision;

        if (integerLength <= 0) {
            // This branch handles cases where the number is less than 1 (e.g., 0.123)
            // or very small (e.g., 0.0005, which original prints as ".1").
            // `substr` with negative start index behaves as `max(0, str.length + start)`.
            // `integerString.substr(integerLength, precision)` will effectively be
            // `integerString.substr(Math.max(0, integerString.length + integerLength), precision)`.
            // For `integerString="1", precision=3, integerLength=-2`, this is `integerString.substr(0, 3)` which is "1".
            // `integerString.substr(0, integerLength)` for negative `integerLength` is `""`.
            return integerString.substr(0, integerLength) + "." + integerString.substr(integerLength, precision);
        } else {
            // Standard case for numbers >= 1
            return integerString.substr(0, integerLength) + "." + integerString.substr(integerLength, precision);
        }
    };

    return {
        formatNumberToDecimal: formatDecimal
    };
})();

AppKernel.numericalOperations = (() => {
    const calculateGcdIterative = (valA, valB) => {
        // Iterative Euclidean algorithm, different from original recursive.
        let currentA = valA;
        let currentB = valB;
        while (currentB !== 0) {
            [currentA, currentB] = [currentB, currentA % currentB]; // Array destructuring for swap
        }
        return currentA;
    };

    const calculateLcmFromGcd = (valA, valB) => {
        if (valA === 0 || valB === 0) return 0;
        return Math.abs(valA * valB) / calculateGcdIterative(valA, valB);
    };

    const getSquaredValue = (val) => val * val; // Arrow function for `sq`

    // Extend global Math object as per original, using AppKernel's utility.
    AppKernel.utilityBelt.mergeObjects(Math, {
        gcd: calculateGcdIterative,
        lcm: calculateLcmFromGcd,
        sq: getSquaredValue
    });

    return {
        getCommonDivisor: calculateGcdIterative,
        getLeastCommonMultiple: calculateLcmFromGcd,
        getSquared: getSquaredValue
    };
})();

AppKernel.mainProcessor = (() => {
    const DATA_INPUT_TYPE_SPEC = 'float';

    const InputManagementSystem = (() => {
        let bufferedInputSegments = [];
        const inputPatternRegistry = {
            'string': /\w*/g,
            'number': /[-]?\d+/g,
            'float': /[-]?\d+(\.\d+)?/g
        };
        const currentInputPattern = inputPatternRegistry[DATA_INPUT_TYPE_SPEC];

        const retrieveNextInteger = () => parseInt(bufferedInputSegments.shift());
        const retrieveNextFloat = () => parseFloat(bufferedInputSegments.shift());
        const retrieveNextText = () => bufferedInputSegments.shift();
        const hasRemainingInput = () => bufferedInputSegments.length > 0;

        const initializeInputSource = (completionHandler) => {
            const standardInput = process.openStdin();
            standardInput.setEncoding('utf8');

            standardInput.on('data', (dataChunk) => {
                // Using `String.prototype.matchAll` and `Array.from` for a different parsing approach.
                const matchedEntries = Array.from(dataChunk.matchAll(currentInputPattern), m => m[0]);
                bufferedInputSegments = bufferedInputSegments.concat(matchedEntries.filter(segment => segment.length > 0));
            });

            standardInput.on('end', () => {
                completionHandler();
            });
        };

        return {
            retrieveNextInteger,
            retrieveNextFloat,
            retrieveNextText,
            hasRemainingInput,
            initializeInputSource
        };
    })();

    const displayResults = (...args) => {
        console.log(...args);
    };

    const CalculationEngine = {
        beginExecution: function() {
            // Uses `Promise.resolve().then()` for asynchronous execution,
            // replacing `setTimeout(..., 0, ...)`.
            Promise.resolve().then(() => this.processInputBatch(this));
        },
        processInputBatch: function(engineContext) {
            let initialProblemCount = InputManagementSystem.retrieveNextInteger();

            // Replicates `while (n--) func();` using a `for` loop to correctly
            // capture the decremented `n` value for each iteration.
            for (let currentProblemIndex = initialProblemCount - 1; currentProblemIndex >= 0; currentProblemIndex--) {
                const executeSingleProblem = (loopIterationValue) => {
                    const pointData = {};
                    const coordinateIdentifiers = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];

                    // Uses `reduce` to populate an object, different from `forEach` on `names` array.
                    coordinateIdentifiers.reduce((accumulator, identifier) => {
                        accumulator[identifier] = InputManagementSystem.retrieveNextFloat();
                        return accumulator;
                    }, pointData);

                    const { x1, y1, x2, y2, x3, y3 } = pointData;

                    // Core mathematical calculations remain identical.
                    const valA = x1 - x2;
                    const valB = y1 - y2;
                    const valC = -1 * ( Math.sq(x1) - Math.sq(x2) + Math.sq(y1) - Math.sq(y2) );
                    const valD = x1 - x3;
                    const valE = y1 - y3;
                    const valF = -1 * ( Math.sq(x1) - Math.sq(x3) + Math.sq(y1) - Math.sq(y3) );

                    const determinant = valE * valA - valB * valD;

                    const paramL = ( valC * valE - valB * valF ) / determinant;
                    const paramM = ( valD * valC - valA * valF ) / determinant;
                    
                    // The original code uses the decremented loop counter (`n`) in the radius calculation.
                    // This behavior is preserved by passing `loopIterationValue`.
                    const radiusValue = Math.sqrt(Math.sq(paramL) + Math.sq(paramM) + 4 * loopIterationValue) / 2.0;

                    displayResults(
                        AppKernel.formatTools.formatNumberToDecimal(paramL / -2.0, 10, 3, 3),
                        AppKernel.formatTools.formatNumberToDecimal(paramM / -2.0, 10, 3, 3),
                        AppKernel.formatTools.formatNumberToDecimal(radiusValue, 10, 3, 3)
                    );
                };
                executeSingleProblem(currentProblemIndex);
            }

            if (InputManagementSystem.hasRemainingInput()) {
                Promise.resolve().then(() => this.processInputBatch(engineContext));
            }
        }
    };

    const setupApplication = () => {
        // Exposes functions to the global object (`globalThis` for cross-environment compatibility),
        // replacing the original `_.extend(this, { ... })`.
        Object.assign(globalThis, {
            output: displayResults,
            input_number: InputManagementSystem.retrieveNextInteger,
            input_float: InputManagementSystem.retrieveNextFloat,
            input_text: InputManagementSystem.retrieveNextText,
            has_next: InputManagementSystem.hasRemainingInput
        });

        InputManagementSystem.initializeInputSource(() => CalculationEngine.beginExecution.call(globalThis));
    };

    setupApplication();

    return {};
})();
