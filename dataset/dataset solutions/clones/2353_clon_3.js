module.exports = function(moduleDefinitionsMap) {
    // Cache for loaded modules
    var moduleCacheStore = {};

    // Custom module loading function
    function moduleLoader(moduleId) {
        // If module is already in cache, return its exports
        if (moduleCacheStore[moduleId]) {
            return moduleCacheStore[moduleId].exports;
        }

        // Create a new module instance and add it to cache
        var currentModuleInstance = moduleCacheStore[moduleId] = {
            id: moduleId, // Unique identifier for the module
            isLoaded: false, // Flag to indicate if module is loaded
            exports: {} // The exports object for this module
        };

        // Execute the module function, populating its exports
        // The 'moduleDefinitionsMap' contains the actual module code
        moduleDefinitionsMap[moduleId].call(
            currentModuleInstance.exports, // 'this' context for the module
            currentModuleInstance,          // module object itself
            currentModuleInstance.exports,  // module.exports
            moduleLoader                    // the require function (moduleLoader)
        );

        // Mark module as loaded
        currentModuleInstance.isLoaded = true;

        // Return the module's exports
        return currentModuleInstance.exports;
    }

    // Attach all module definitions to the loader for debugging/inspection (Type II change)
    moduleLoader.allDefinitions = moduleDefinitionsMap;

    // Store module definitions
    moduleLoader.m = moduleDefinitionsMap;
    // Store module cache
    moduleLoader.c = moduleCacheStore;

    // Helper to define getter functions for module exports
    // This is similar to Object.defineProperty for ES module interop
    moduleLoader.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        // Ensure the property doesn't already exist or isn't enumerable
        // If it doesn't exist, define it with enumerable: true and the provided getter
        if (!moduleLoader.hasOwnProp(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    // Helper to mark a module as an ES module
    moduleLoader.markAsEsModule = function(exportsObject) {
        // Use Symbol.toStringTag for better module identification in console (Type II change)
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Mark with __esModule for compatibility
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    // Helper for ES module compatibility (interop for default exports)
    moduleLoader.esModuleInterop = function(valueToProcess, flags) {
        // Check if valueToProcess is already an ES module or if it should be treated as one
        // Flag 1: valueToProcess is a module ID, load it first
        if (flags & 1) {
            valueToProcess = moduleLoader(valueToProcess);
        }
        // Flag 8: Return valueToProcess directly (already an ES module or raw value)
        if (flags & 8) {
            return valueToProcess;
        }
        // Flag 4: If it's an object and already marked as __esModule, return it
        if (flags & 4 && typeof valueToProcess === 'object' && valueToProcess && valueToProcess.__esModule) {
            return valueToProcess;
        }

        // Otherwise, create a new namespace object
        var namespaceObject = Object.create(null);
        moduleLoader.markAsEsModule(namespaceObject); // Mark as ES module
        // Define 'default' export to the original value
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: valueToProcess });

        // Flag 2: If original value is not a string, copy all its properties to the namespace object
        if (flags & 2 && typeof valueToProcess !== 'string') {
            for (var propKey in valueToProcess) {
                // Ensure it's not a prototype property
                if (Object.prototype.hasOwnProperty.call(valueToProcess, propKey)) {
                    // Define a getter for each property
                    moduleLoader.defineExportGetter(namespaceObject, propKey, (function(key) {
                        return function() { return valueToProcess[key]; };
                    })(propKey)); // Using IIFE to capture propKey
                }
            }
        }
        return namespaceObject;
    };

    // Helper to get default export of a module (Type II change - rephrased ternary)
    moduleLoader.getDefaultExport = function(targetModule) {
        var defaultGetter;
        if (targetModule && targetModule.__esModule) {
            defaultGetter = function() { return targetModule.default; };
        } else {
            defaultGetter = function() { return targetModule; };
        }
        moduleLoader.defineExportGetter(defaultGetter, "a", defaultGetter); // 'a' is a common convention
        return defaultGetter;
    };

    // Object.prototype.hasOwnProperty.call shortcut
    moduleLoader.hasOwnProp = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Public path for assets (empty in original, keeping it)
    moduleLoader.publicPath = "";

    // Start the application by loading the startup module (moduleId 0)
    // Original: return r(r.s = 0);
    // Rewritten to directly call with 0, assuming 0 is the startup module.
    // Added a check to ensure moduleDefinitionsMap is an array.
    if (!Array.isArray(moduleDefinitionsMap)) {
        console.error("Error: Module definitions map is not an array.");
        return null; // Or throw an error
    }
    return moduleLoader(0);
}([
/* Module 0: Main Application Entry Point */
function(currentModule, moduleExports, requireModule) {
    "use strict"; // Enforce strict mode
    // Load the file system utility module
    var fileSystemUtility = requireModule(1);

    // Load the main problem solving logic module
    var mainProblemSolver = requireModule(2);

    // Read input from standard input (stdin)
    // Using a more descriptive variable name for the input path
    const stdinFilePath = "/dev/stdin";
    const inputEncoding = "utf8";

    // Add a guard clause for fileSystemUtility
    if (!fileSystemUtility || !fileSystemUtility.readFileSync) {
        console.error("Error: File system utility not available or missing readFileSync.");
        return;
    }

    try {
        var rawInputData = fileSystemUtility.readFileSync(stdinFilePath, inputEncoding);
        // Additional validation: check if input data is empty
        if (!rawInputData || rawInputData.length === 0) {
            console.warn("Warning: Standard input was empty.");
            return; // Exit if no input
        }
        // Process the input data
        mainProblemSolver(rawInputData);
    } catch (error) {
        console.error("An error occurred while reading or processing input:", error.message);
    }
},

/* Module 1: File System (fs) Module */
function(currentModule, moduleExports) {
    // This module simply exports the built-in 'fs' (file system) Node.js module.
    // Added a try-catch for robustness, though usually not needed for built-ins.
    try {
        currentModule.exports = require("fs");
    } catch (err) {
        console.error("Failed to load 'fs' module:", err.message);
        currentModule.exports = {}; // Provide an empty object to prevent further errors
    }
},

/* Module 2: Problem Processing Orchestrator */
function(currentModule, moduleExports, requireModule) {
    "use strict"; // Enforce strict mode

    // Import the InputParser class and the main SolutionLogic function
    var InputParser = requireModule(3);
    var SolutionLogic = requireModule(5);

    // The module exports a function that takes raw input string
    currentModule.exports = function processInputAndSolve(inputStringData) {
        // Add a guard clause for inputStringData
        if (typeof inputStringData !== 'string' || inputStringData.length === 0) {
            console.error("Error: Invalid or empty input string provided to problem solver.");
            return;
        }

        // Create an instance of the InputParser with the provided data
        var dataProcessorInstance = new InputParser(inputStringData);

        // Execute the main solution logic with the processor instance
        SolutionLogic(dataProcessorInstance);
    };
},

/* Module 3: InputParser Class */
function(currentModule, moduleExports, requireModule) {
    "use strict"; // Enforce strict mode

    // Import the DataQueue class
    var DataQueue = requireModule(4);

    // Define the InputParser class
    currentModule.exports = class InputParser {
        constructor(rawInputString) {
            // Basic validation for the input string
            if (typeof rawInputString !== 'string') {
                throw new Error("InputParser constructor expects a string.");
            }

            // Process the raw input string: trim whitespace, then split by one or more whitespace characters
            // Using a slightly different approach for splitting and filtering (Type III change)
            const cleanedParts = rawInputString.trim().split(/\s+/);
            // Ensure no empty strings if multiple spaces were present, though /\s+/ already handles this well.
            // This filter is slightly redundant but demonstrates a change.
            const filteredParts = cleanedParts.filter(part => part.length > 0);

            // Initialize an internal data queue with the processed parts
            this.dataStore = new DataQueue(filteredParts);
        }

        // Method to dequeue the next string input (renamed from inr)
        getNextString() {
            return this.dataStore.dequeueItem();
        }

        // Method to dequeue the next integer input (renamed from in)
        getNextInteger() {
            // Added an intermediate variable and explicit radix for clarity
            const stringValue = this.dataStore.dequeueItem();
            if (stringValue === undefined) {
                throw new Error("Attempted to read integer from empty input queue.");
            }
            return parseInt(stringValue, 10);
        }

        // Method to clear the internal input queue
        clearInputQueue() {
            this.dataStore.clearAll();
        }
    };
},

/* Module 4: DataQueue Class (renamed from Queue) */
function(currentModule, moduleExports, requireModule) {
    "use strict"; // Enforce strict mode

    currentModule.exports = class DataQueue {
        // Constructor with a default empty array for initial elements (Type II change: default parameter)
        constructor(initialElements = []) {
            // Store the elements
            this.elementList = initialElements;
            // Head index, pointing to the next element to be dequeued
            this.headIndex = 0;
            // The actual count of items currently in the queue (Type III change: removed 'size' property, can be derived)
            // this.itemCount = initialElements.length; // Removed, will derive from elementList and headIndex
        }

        // Helper to get current number of items
        get currentItemCount() {
            return this.elementList.length - this.headIndex;
        }

        // Method to enqueue an item (renamed from enq)
        enqueueItem(item) {
            this.elementList.push(item);
            // this.itemCount++; // Removed
        }

        // Method to dequeue an item (renamed from deq)
        dequeueItem() {
            // Guard clause: check if the queue is empty before dequeuing
            if (this.headIndex >= this.elementList.length) {
                // Return undefined or throw an error based on desired behavior
                return undefined; // Or throw new Error("Queue is empty.");
            }

            // Retrieve the item at the head index
            const dequeuedValue = this.elementList[this.headIndex];
            // Increment the head index
            this.headIndex++;
            // this.itemCount--; // Removed

            // Optional: Periodically clean up the `elementList` if `headIndex` gets too large
            // This prevents memory leaks for very long-lived queues
            if (this.headIndex > 1000 && this.headIndex > this.elementList.length / 2) {
                this.elementList = this.elementList.slice(this.headIndex);
                this.headIndex = 0;
            }
            return dequeuedValue;
        }

        // Method to clear the queue (renamed from clear)
        clearAll() {
            this.elementList = [];
            this.headIndex = 0;
            // this.itemCount = 0; // Removed
        }
    };
},

/* Module 5: Core Problem Solution Logic */
function(currentModule, moduleExports, requireModule) {
    "use strict"; // Enforce strict mode

    // Import the custom BigNumber library
    var BigNumberCalculator = requireModule(6);

    // Define the main solution function
    currentModule.exports = function solveBitwiseXORSumProblem(inputReaderInstance) {
        // Define a constant for the modulo value
        const MODULO_VALUE = 1000000007;

        // Read the number of elements from input
        var numberOfElements = inputReaderInstance.getNextInteger();

        // Guard clause for invalid input
        if (numberOfElements <= 0) {
            console.log(0); // If no elements, sum is 0
            return;
        }

        // Array to store BigNumber instances of input values
        var inputBigNumbers = new Array(numberOfElements);
        for (let i = 0; i < numberOfElements; i++) {
            inputBigNumbers[i] = new BigNumberCalculator(inputReaderInstance.getNextString());
        }

        // Array to store bit counts for each position (up to 61 bits, as per original)
        // Original used fill(0), changed to map for variety.
        var bitPositionFrequency = Array.from({ length: 61 }).map(() => 0);

        // Iterate through each input number to count set bits at each position
        for (let numIdx = 0; numIdx < numberOfElements; numIdx++) {
            let currentBigNum = inputBigNumbers[numIdx];
            let currentBitPos = 0; // Start at bit position 0

            // Loop while the current number is greater than zero
            // Using a `while` loop structure instead of `for` (Type III change)
            while (currentBigNum.gt(0)) {
                // Check if the current bit is set (currentBigNum % 2)
                // Use `currentBigNum.mod(2).toJSNumber()` to get 0 or 1
                if (currentBigNum.mod(2).toJSNumber() === 1) {
                    bitPositionFrequency[currentBitPos]++;
                }
                // Right shift the number by dividing by 2
                currentBigNum = currentBigNum.divide(2);
                currentBitPos++; // Move to the next bit position
            }
        }

        // Initialize the final result BigNumber to zero
        let totalXORSum = new BigNumberCalculator(0);
        // Initialize the current power of two BigNumber to one (2^0)
        let twoToThePower = new BigNumberCalculator(1);

        // Calculate the sum based on bit frequencies
        // The formula is Sum (2^v * count_v * (N - count_v)) mod M
        for (let bitPos = 0; bitPos < bitPositionFrequency.length; bitPos++) {
            const currentBitOneCount = bitPositionFrequency[bitPos];
            const currentBitZeroCount = numberOfElements - currentBitOneCount;

            // Calculate (2^v * count_v) mod M
            let termPart1 = twoToThePower.times(currentBitOneCount).mod(MODULO_VALUE);
            // Calculate ((2^v * count_v) * (N - count_v)) mod M
            let termValue = termPart1.times(currentBitZeroCount).mod(MODULO_VALUE);

            // Add to the total sum
            totalXORSum = totalXORSum.plus(termValue).mod(MODULO_VALUE);

            // Update twoToThePower for the next iteration (multiply by 2)
            twoToThePower = twoToThePower.times(2).mod(MODULO_VALUE);
        }

        // Output the final result as a string
        console.log(totalXORSum.toString());
    };
},

/* Module 6: BigNumber Library (based on big.js) - Extensive renaming and minor structural tweaks */
function(bigIntModule, exportsObject, requireFunction) {
    (function(globalScope) { // Changed 't' to 'globalScope' for clarity
        var BigNumberModule, // Renamed 'o' to 'BigNumberModule'
            // Base for calculations (10^7)
            CALC_BASE = 1e7,
            // Number of digits in CALC_BASE (7)
            BASE_DIGITS = 7,
            // Max safe integer (9007199254740992)
            MAX_SAFE_INT = 9007199254740992,
            // Array representation of MAX_SAFE_INT (h(MAX_SAFE_INT))
            MAX_SAFE_INT_ARRAY = toDigitArray(MAX_SAFE_INT),
            // Alphabet for various bases
            BASE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz",
            // Flag for native BigInt support
            HAS_NATIVE_BIGINT = typeof BigInt === 'function';

        // Main factory function for BigNumber instances
        // Renamed 'a' to 'createBigNumber'
        function createBigNumber(value, base, roundTo, config) {
            if (value === undefined) {
                return createBigNumber[0]; // Return zero if no value provided
            }
            // If base is 10 and no rounding config, use fast path (Q)
            if (base !== undefined && (base !== 10 || roundTo)) { // Original: (10!=+e||r)
                return parseString(value, base, roundTo, config); // F
            }
            return convertToBigNumber(value); // Q
        }

        // Class for standard BigNumber (arbitrary precision)
        // Renamed 's' to 'BigNumber'
        function BigNumber(digitArray, isNegative) {
            this.digitArray = digitArray;
            this.isNegative = isNegative;
            this.isSmall = false; // Not a small number
        }

        // Class for small integer numbers (within JS safe integer limits)
        // Renamed 'l' to 'SmallNumber'
        function SmallNumber(numericValue) {
            this.numericValue = numericValue;
            this.isNegative = numericValue < 0;
            this.isSmall = true;
        }

        // Class for native BigInt numbers (if supported)
        // Renamed 'f' to 'NativeBigIntNumber'
        function NativeBigIntNumber(bigIntValue) {
            this.bigIntValue = bigIntValue;
        }

        // Check if a number is within JavaScript's safe integer range
        // Renamed 'v' to 'isSafeIntegerJs'
        function isSafeIntegerJs(num) {
            return -MAX_SAFE_INT < num && num < MAX_SAFE_INT;
        }

        // Convert a number to its digit array representation in CALC_BASE
        // Renamed 'h' to 'toDigitArray'
        function toDigitArray(num) {
            if (num < CALC_BASE) {
                return [num];
            }
            if (num < CALC_BASE * CALC_BASE) { // 1e14
                return [num % CALC_BASE, Math.floor(num / CALC_BASE)];
            }
            // For numbers up to 1e21 (approx MAX_SAFE_INT)
            return [num % CALC_BASE, Math.floor(num / CALC_BASE) % CALC_BASE, Math.floor(num / (CALC_BASE * CALC_BASE))];
        }

        // Normalize digit array by removing leading zeros
        // Renamed 'c' to 'normalizeDigitArray'
        function normalizeDigitArray(arr) {
            let lastIdx = arr.length;
            // Decrement lastIdx until a non-zero digit is found or array is empty
            while (lastIdx > 0 && arr[--lastIdx] === 0);
            arr.length = lastIdx + 1; // Trim the array
        }

        // Convert a digit array back to a single number if possible
        // Renamed 'y' to 'digitArrayToNumber'
        function digitArrayToNumber(arr) {
            normalizeDigitArray(arr); // Ensure normalized
            const arrLen = arr.length;
            if (arrLen < 4 && compareDigitArrays(arr, MAX_SAFE_INT_ARRAY) < 0) { // Check if it fits small number
                switch (arrLen) {
                    case 0: return 0;
                    case 1: return arr[0];
                    case 2: return arr[0] + arr[1] * CALC_BASE;
                    default: return arr[0] + (arr[1] + arr[2] * CALC_BASE) * CALC_BASE;
                }
            }
            return arr; // Return array if too large
        }

        // Create a new array filled with zeros
        // Renamed 'g' to 'createZeroFilledArray'
        function createZeroFilledArray(length) {
            // Using Array.from for clearer intent (Type II change)
            return Array.from({ length: length }, () => 0);
        }

        // Integer division helper (Math.floor or Math.ceil)
        // Renamed 'd' to 'integerDiv'
        function integerDiv(num) {
            return num > 0 ? Math.floor(num) : Math.ceil(num);
        }

        // Addition of two digit arrays (t + r)
        // Renamed 'm' to 'addDigitArrays'
        function addDigitArrays(arr1, arr2) {
            const len1 = arr1.length,
                len2 = arr2.length;
            const resultArr = new Array(len1); // result will be at least len1
            let carry = 0;
            let currentSum;

            for (let i = 0; i < len2; i++) {
                currentSum = arr1[i] + arr2[i] + carry;
                carry = Math.floor(currentSum / CALC_BASE);
                resultArr[i] = currentSum % CALC_BASE;
            }
            for (let i = len2; i < len1; i++) {
                currentSum = arr1[i] + carry;
                carry = Math.floor(currentSum / CALC_BASE);
                resultArr[i] = currentSum % CALC_BASE;
            }
            if (carry > 0) {
                resultArr.push(carry);
            }
            return resultArr;
        }

        // Addition of two digit arrays, handling differing lengths
        // Renamed 'w' to 'sumDigitArrays'
        function sumDigitArrays(arrA, arrB) {
            // Ensure arrA is the longer one for addDigitArrays
            return arrA.length >= arrB.length ? addDigitArrays(arrA, arrB) : addDigitArrays(arrB, arrA);
        }

        // Addition of a digit array and a small number (t + r)
        // Renamed 'b' to 'addSmallToDigitArray'
        function addSmallToDigitArray(digitArr, smallNum) {
            const arrLen = digitArr.length;
            const resultArr = new Array(arrLen);
            let carry = smallNum; // smallNum is the initial carry
            let currentVal;

            for (let i = 0; i < arrLen; i++) {
                currentVal = digitArr[i] + carry;
                carry = Math.floor(currentVal / CALC_BASE);
                resultArr[i] = currentVal % CALC_BASE;
            }
            // If there's still a carry, add it to the end
            while (carry > 0) {
                resultArr.push(carry % CALC_BASE);
                carry = Math.floor(carry / CALC_BASE);
            }
            return resultArr;
        }

        // Subtraction of two digit arrays (t - r)
        // Renamed 'S' to 'subtractDigitArrays'
        function subtractDigitArrays(arr1, arr2) {
            const len1 = arr1.length;
            const resultArr = new Array(len1);
            let borrow = 0;
            let currentDiff;

            for (let i = 0; i < arr2.length; i++) {
                currentDiff = arr1[i] - borrow - arr2[i];
                if (currentDiff < 0) {
                    currentDiff += CALC_BASE;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                resultArr[i] = currentDiff;
            }
            for (let i = arr2.length; i < len1; i++) {
                if (!((currentDiff = arr1[i] - borrow) < 0)) {
                    resultArr[i++] = currentDiff;
                    borrow = 0; // No more borrow if currentDiff is non-negative
                    break;
                }
                currentDiff += CALC_BASE;
                resultArr[i] = currentDiff;
            }
            // Copy remaining digits if no borrow
            for (; i < len1; i++) {
                resultArr[i] = arr1[i];
            }
            normalizeDigitArray(resultArr);
            return resultArr;
        }

        // Subtraction of a small number from a digit array (t - r)
        // Renamed 'q' to 'subtractSmallFromDigitArray'
        function subtractSmallFromDigitArray(digitArr, smallNum, isNegativeResult) {
            const arrLen = digitArr.length;
            const resultArr = new Array(arrLen);
            let currentBorrow = -smallNum; // Initial borrow
            let currentDigit;

            for (let i = 0; i < arrLen; i++) {
                currentDigit = digitArr[i] + currentBorrow;
                currentBorrow = Math.floor(currentDigit / CALC_BASE);
                currentDigit %= CALC_BASE;
                resultArr[i] = currentDigit < 0 ? currentDigit + CALC_BASE : currentDigit;
            }
            const finalResult = digitArrayToNumber(resultArr);
            return typeof finalResult === 'number' ?
                (isNegativeResult ? new SmallNumber(-finalResult) : new SmallNumber(finalResult)) :
                new BigNumber(finalResult, isNegativeResult);
        }

        // Multiplication of two digit arrays
        // Renamed 'M' to 'multiplyDigitArrays'
        function multiplyDigitArrays(arr1, arr2) {
            const len1 = arr1.length,
                len2 = arr2.length;
            const productArr = createZeroFilledArray(len1 + len2);
            let carry, productPart;

            for (let i = 0; i < len1; ++i) {
                const digit1 = arr1[i];
                carry = 0;
                for (let j = 0; j < len2; ++j) {
                    productPart = digit1 * arr2[j] + productArr[i + j] + carry;
                    carry = Math.floor(productPart / CALC_BASE);
                    productArr[i + j] = productPart % CALC_BASE;
                }
                productArr[i + len2] += carry;
            }
            normalizeDigitArray(productArr);
            return productArr;
        }

        // Multiplication of a digit array by a single number
        // Renamed 'N' to 'multiplyDigitArrayByNumber'
        function multiplyDigitArrayByNumber(digitArr, multiplier) {
            const arrLen = digitArr.length;
            const resultArr = new Array(arrLen);
            let carry = 0;
            let currentProduct;

            for (let i = 0; i < arrLen; i++) {
                currentProduct = digitArr[i] * multiplier + carry;
                carry = Math.floor(currentProduct / CALC_BASE);
                resultArr[i] = currentProduct % CALC_BASE;
            }
            while (carry > 0) {
                resultArr.push(carry % CALC_BASE);
                carry = Math.floor(carry / CALC_BASE);
            }
            return resultArr;
        }

        // Prepend zeros to a digit array
        // Renamed 'E' to 'prependZeros'
        function prependZeros(digitArr, numZeros) {
            const zeroArr = [];
            for (let i = 0; i < numZeros; i++) {
                zeroArr.push(0);
            }
            return zeroArr.concat(digitArr);
        }

        // Create a BigNumber from a multiplier and a digit array
        // Renamed 'O' to 'createFromMultiplierAndDigits'
        function createFromMultiplierAndDigits(multiplier, digitArr, isNegative) {
            return new BigNumber(
                multiplier < CALC_BASE ? multiplyDigitArrayByNumber(digitArr, multiplier) : multiplyDigitArrays(digitArr, toDigitArray(multiplier)),
                isNegative
            );
        }

        // Square a digit array
        // Renamed 'P' to 'squareDigitArray'
        function squareDigitArray(digitArr) {
            const arrLen = digitArr.length;
            const squaredArr = createZeroFilledArray(arrLen + arrLen);
            let carry, product;

            for (let i = 0; i < arrLen; i++) {
                const digit = digitArr[i];
                carry = 0 - digit * digit; // Start with negative square for subtle optimization
                for (let j = i; j < arrLen; j++) {
                    product = digit * digitArr[j] * 2 + squaredArr[i + j] + carry;
                    carry = Math.floor(product / CALC_BASE);
                    squaredArr[i + j] = product % CALC_BASE;
                }
                squaredArr[i + arrLen] += carry;
            }
            normalizeDigitArray(squaredArr);
            return squaredArr;
        }

        // Division of a digit array by a single number (returns [quotient_arr, remainder])
        // Renamed 'x' to 'divideDigitArrayByNumber'
        function divideDigitArrayByNumber(digitArr, divisor) {
            const arrLen = digitArr.length;
            const quotientArr = createZeroFilledArray(arrLen);
            let remainder = 0;
            let currentDividend, currentQuotient;

            for (let i = arrLen - 1; i >= 0; --i) {
                currentDividend = remainder * CALC_BASE + digitArr[i];
                currentQuotient = integerDiv(currentDividend / divisor);
                remainder = currentDividend - currentQuotient * divisor;
                quotientArr[i] = currentQuotient;
            }
            return [quotientArr, remainder];
        }

        // Main division function (returns [quotient, remainder])
        // Renamed 'I' to 'performDivision'
        function performDivision(dividendBN, divisorBN) {
            const divBN = convertToBigNumber(divisorBN); // Ensure divisor is a BigNumber
            // Native BigInt path (Type II change)
            if (HAS_NATIVE_BIGINT) {
                return [
                    new NativeBigIntNumber(dividendBN.bigIntValue / divBN.bigIntValue),
                    new NativeBigIntNumber(dividendBN.bigIntValue % divBN.bigIntValue)
                ];
            }

            const dividendValue = dividendBN.digitArray;
            let divisorValue = divBN.digitArray; // Use let as it might be reassigned

            if (divisorValue.length === 0 || (divisorValue.length === 1 && divisorValue[0] === 0)) {
                throw new Error("Cannot divide by zero");
            }

            // Small number optimizations
            if (dividendBN.isSmall) {
                if (divBN.isSmall) {
                    return [
                        new SmallNumber(integerDiv(dividendBN.numericValue / divBN.numericValue)),
                        new SmallNumber(dividendBN.numericValue % divBN.numericValue)
                    ];
                }
                return [createBigNumber[0], dividendBN]; // Dividend is smaller than divisor
            }
            if (divBN.isSmall) {
                if (divBN.numericValue === 1) return [dividendBN, createBigNumber[0]];
                if (divBN.numericValue === -1) return [dividendBN.negate(), createBigNumber[0]];

                const absDivisor = Math.abs(divBN.numericValue);
                if (absDivisor < CALC_BASE) {
                    const [quotientArr, remainder] = divideDigitArrayByNumber(dividendValue, absDivisor);
                    const finalQuotient = digitArrayToNumber(quotientArr);
                    const finalRemainder = dividendBN.isNegative ? -remainder : remainder;
                    return [
                        typeof finalQuotient === 'number' ? new SmallNumber(dividendBN.isNegative !== divBN.isNegative ? -finalQuotient : finalQuotient) : new BigNumber(finalQuotient, dividendBN.isNegative !== divBN.isNegative),
                        new SmallNumber(finalRemainder)
                    ];
                }
                // Convert small divisor to digit array if it's large enough
                divisorValue = toDigitArray(absDivisor);
            }

            const comparisonResult = compareDigitArrays(dividendValue, divisorValue);
            if (comparisonResult === -1) {
                return [createBigNumber[0], dividendBN];
            }
            if (comparisonResult === 0) {
                return [createBigNumber[dividendBN.isNegative !== divBN.isNegative ? -1 : 1], createBigNumber[0]];
            }

            let quotientResult;
            // Use Karatsuba-like optimization for larger numbers if suitable
            // Original condition: u.length+v.length<=200
            // This is a heuristic, keep it as is for Type III but reformat.
            if (dividendValue.length + divisorValue.length <= 200) {
                quotientResult = longDivisionAlgorithm(dividendValue, divisorValue); // Original `function(t,r)`
            } else {
                quotientResult = iterativeLongDivision(dividendValue, divisorValue); // Original `function(t,r)`
            }

            const finalQuotientArray = quotientResult[0];
            const finalRemainderArray = quotientResult[1];
            const isQuotientNegative = dividendBN.isNegative !== divBN.isNegative;
            const isRemainderNegative = dividendBN.isNegative;

            const finalQuotient = digitArrayToNumber(finalQuotientArray);
            const finalRemainder = digitArrayToNumber(finalRemainderArray);

            return [
                typeof finalQuotient === 'number' ?
                    (isQuotientNegative ? new SmallNumber(-finalQuotient) : new SmallNumber(finalQuotient)) :
                    new BigNumber(finalQuotient, isQuotientNegative),
                typeof finalRemainder === 'number' ?
                    (isRemainderNegative ? new SmallNumber(-finalRemainder) : new SmallNumber(finalRemainder)) :
                    new BigNumber(finalRemainder, isRemainderNegative)
            ];
        }

        // Long division algorithm for digit arrays (t, r)
        // Renamed 'function(t,r)' to 'longDivisionAlgorithm'
        function longDivisionAlgorithm(dividendDigits, divisorDigits) {
            let quotientDigitEstimate, currentDividendPart, remainderDigits, // o, n, i
                digitMultiplier, dividendShiftedPart, divisorShiftedPart; // u, p, a, s, l

            const dividendLen = dividendDigits.length,
                divisorLen = divisorDigits.length;
            const quotientResultArray = createZeroFilledArray(divisorLen); // h
            const divisorHighestDigit = divisorDigits[divisorLen - 1]; // c
            const scaleFactor = Math.ceil(CALC_BASE / (2 * divisorHighestDigit)); // d
            const scaledDividend = multiplyDigitArrayByNumber(dividendDigits, scaleFactor); // m
            const scaledDivisor = multiplyDigitArrayByNumber(divisorDigits, scaleFactor); // w

            // Ensure scaledDividend has enough leading zeros
            if (scaledDividend.length <= dividendLen) scaledDividend.push(0);
            scaledDivisor.push(0); // Pad scaledDivisor

            const newDivisorHighestDigit = scaledDivisor[divisorLen - 1]; // c after scaling

            // Loop from most significant digit downwards
            for (let i = dividendLen - divisorLen; i >= 0; i--) { // n
                // Estimate quotient digit
                quotientDigitEstimate = CALC_BASE - 1; // o
                currentDividendPart = scaledDividend[i + divisorLen];
                if (currentDividendPart !== newDivisorHighestDigit) {
                    quotientDigitEstimate = Math.floor((currentDividendPart * CALC_BASE + scaledDividend[i + divisorLen - 1]) / newDivisorHighestDigit);
                }

                // Perform trial subtraction
                let carry1 = 0,
                    carry2 = 0; // i, u
                let productArrLen = scaledDivisor.length; // a
                let currentPos; // p

                for (currentPos = 0; currentPos < productArrLen; currentPos++) {
                    carry1 += quotientDigitEstimate * scaledDivisor[currentPos];
                    remainderDigits = Math.floor(carry1 / CALC_BASE); // s
                    carry2 += scaledDividend[i + currentPos] - (carry1 - remainderDigits * CALC_BASE);
                    carry1 = remainderDigits;
                    if (carry2 < 0) {
                        scaledDividend[i + currentPos] = carry2 + CALC_BASE;
                        carry2 = -1;
                    } else {
                        scaledDividend[i + currentPos] = carry2;
                        carry2 = 0;
                    }
                }

                // Adjust quotient digit if trial subtraction failed (remainder was negative)
                while (carry2 !== 0) {
                    quotientDigitEstimate--;
                    carry1 = 0;
                    for (currentPos = 0; currentPos < productArrLen; currentPos++) {
                        currentDividendPart = scaledDividend[i + currentPos] - CALC_BASE + scaledDivisor[currentPos];
                        if (currentDividendPart < 0) {
                            scaledDividend[i + currentPos] = currentDividendPart + CALC_BASE;
                            carry1 = 0;
                        } else {
                            scaledDividend[i + currentPos] = currentDividendPart;
                            carry1 = 1;
                        }
                    }
                    carry2 += carry1;
                }
                quotientResultArray[i] = quotientDigitEstimate;
            }

            // Unscale the remainder (Type II change: use divideDigitArrayByNumber)
            remainderDigits = divideDigitArrayByNumber(multiplyDigitArrayByNumber(scaledDividend, 1), scaleFactor)[0];
            normalizeDigitArray(remainderDigits); // Original had y() which calls normalizeDigitArray
            return [digitArrayToNumber(quotientResultArray), digitArrayToNumber(remainderDigits)]; // Original had y()
        }

        // Iterative long division for very large numbers
        // Renamed 'function(t,r)' to 'iterativeLongDivision'
        function iterativeLongDivision(dividendDigits, divisorDigits) {
            let currentQuotientDigits = [],
                currentRemainderDigits = [], // l, f
                currentDividendLength, currentDivisorLength, // o, n
                tempQuotient, tempRemainder; // i, u, p

            let dividendIndex = dividendDigits.length; // a
            const divisorLen = divisorDigits.length; // s
            const BASE = CALC_BASE; // v

            while (dividendIndex > 0) {
                currentRemainderDigits.unshift(dividendDigits[--dividendIndex]); // Add digit to front of remainder
                normalizeDigitArray(currentRemainderDigits); // Ensure no leading zeros

                // If current remainder is smaller than divisor, quotient digit is 0
                if (compareDigitArrays(currentRemainderDigits, divisorDigits) < 0) {
                    currentQuotientDigits.push(0);
                } else {
                    // Estimate quotient digit
                    currentDividendLength = currentRemainderDigits.length;
                    // Prepare dividend part for estimation: highest two digits
                    tempQuotient = currentRemainderDigits[currentDividendLength - 1] * BASE + currentRemainderDigits[currentDividendLength - 2];
                    // Prepare divisor part for estimation: highest two digits
                    tempRemainder = divisorDigits[divisorLen - 1] * BASE + divisorDigits[divisorLen - 2];

                    // If dividend part has more digits than divisor part, adjust
                    if (currentDividendLength > divisorLen) {
                        tempQuotient = (tempQuotient + 1) * BASE;
                    }

                    let estimatedQuotient = Math.ceil(tempQuotient / tempRemainder); // o

                    // Refine estimated quotient
                    let trialProduct;
                    do {
                        if (estimatedQuotient <= 0) break; // Ensure positive quotient
                        trialProduct = multiplyDigitArrayByNumber(divisorDigits, estimatedQuotient); // p
                        if (compareDigitArrays(trialProduct, currentRemainderDigits) <= 0) {
                            break;
                        }
                        estimatedQuotient--;
                    } while (estimatedQuotient > 0);

                    currentQuotientDigits.push(estimatedQuotient);
                    currentRemainderDigits = subtractDigitArrays(currentRemainderDigits, trialProduct);
                }
            }
            currentQuotientDigits.reverse();
            return [digitArrayToNumber(currentQuotientDigits), digitArrayToNumber(currentRemainderDigits)];
        }

        // Compare two digit arrays (t, e)
        // Returns 1 if t > e, -1 if t < e, 0 if t == e
        // Renamed 'B' to 'compareDigitArrays'
        function compareDigitArrays(arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return arr1.length > arr2.length ? 1 : -1;
            }
            // Compare from most significant digit
            for (let i = arr1.length - 1; i >= 0; i--) {
                if (arr1[i] !== arr2[i]) {
                    return arr1[i] > arr2[i] ? 1 : -1;
                }
            }
            return 0; // Arrays are equal
        }

        // Miller-Rabin primality test helper: initial checks for small primes
        // Renamed 'A' to 'isSmallPrime'
        function isSmallPrime(numBig) {
            const absNum = numBig.abs();
            if (!absNum.isUnit()) { // Not 1
                if (absNum.equals(2) || absNum.equals(3) || absNum.equals(5)) {
                    return true;
                }
                if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) {
                    return false;
                }
                if (absNum.lesser(49)) { // Primes under 49 are covered by 2,3,5 checks
                    return true;
                }
            }
            return undefined; // Not determined by small prime checks
        }

        // Miller-Rabin primality test core logic
        // Renamed 'Z' to 'millerRabinTest'
        function millerRabinTest(candidateNum, witnesses) {
            let exponent, basePower, currentWitnessPower; // r, o, i
            let tempCandidate = candidateNum.prev(); // candidateNum - 1
            let reducedCandidate = tempCandidate; // p
            let sCount = 0; // a

            // Find s and d such that n-1 = 2^s * d, where d is odd
            while (reducedCandidate.isEven()) {
                reducedCandidate = reducedCandidate.divide(2);
                sCount++;
            }

            // Loop through each witness
            witnessLoop: for (let wIdx = 0; wIdx < witnesses.length; wIdx++) { // o
                const currentWitness = witnesses[wIdx];
                // Skip if witness is greater than or equal to candidateNum
                if (!candidateNum.lesser(currentWitness)) {
                    // Calculate a^d mod n
                    currentWitnessPower = createBigNumber(currentWitness).modPow(reducedCandidate, candidateNum); // i

                    // If a^d mod n is 1 or n-1, then candidateNum is a probable prime for this witness
                    if (!currentWitnessPower.isUnit() && !currentWitnessPower.equals(tempCandidate)) {
                        // Check a^(d*2^r) mod n for r from 0 to s-1
                        for (exponent = sCount - 1; exponent !== 0; exponent--) { // r
                            currentWitnessPower = currentWitnessPower.square().mod(candidateNum);
                            if (currentWitnessPower.isUnit()) return false; // Composite
                            if (currentWitnessPower.equals(tempCandidate)) continue witnessLoop; // Probable prime
                        }
                        return false; // Composite
                    }
                }
            }
            return true; // Probable prime
        }

        // --- Prototype Definitions for BigNumber, SmallNumber, NativeBigIntNumber ---
        BigNumber.prototype = Object.create(createBigNumber.prototype);
        SmallNumber.prototype = Object.create(createBigNumber.prototype);
        NativeBigIntNumber.prototype = Object.create(createBigNumber.prototype);

        // --- Arithmetic Operations ---

        BigNumber.prototype.add = function(other) {
            const otherBN = convertToBigNumber(other);
            if (this.isNegative !== otherBN.isNegative) {
                return this.subtract(otherBN.negate());
            }
            const thisValue = this.digitArray;
            const otherValue = otherBN.digitArray;
            return otherBN.isSmall ? new BigNumber(addSmallToDigitArray(thisValue, Math.abs(otherBN.numericValue)), this.isNegative) :
                new BigNumber(sumDigitArrays(thisValue, otherValue), this.isNegative);
        };
        BigNumber.prototype.plus = BigNumber.prototype.add;

        SmallNumber.prototype.add = function(other) {
            const otherBN = convertToBigNumber(other);
            const thisValue = this.numericValue;
            if (thisValue < 0 !== otherBN.isNegative) {
                return this.subtract(otherBN.negate());
            }
            const otherValue = otherBN.numericValue;
            if (otherBN.isSmall) {
                if (isSafeIntegerJs(thisValue + otherValue)) {
                    return new SmallNumber(thisValue + otherValue);
                }
                // If sum exceeds safe integer, convert to BigNumber
                return new BigNumber(addSmallToDigitArray(toDigitArray(Math.abs(otherValue)), Math.abs(thisValue)), thisValue < 0);
            }
            // otherBN is a BigNumber, so convert this SmallNumber to digit array for addition
            return new BigNumber(addSmallToDigitArray(otherBN.digitArray, Math.abs(thisValue)), thisValue < 0);
        };
        SmallNumber.prototype.plus = SmallNumber.prototype.add;

        NativeBigIntNumber.prototype.add = function(other) {
            return new NativeBigIntNumber(this.bigIntValue + convertToBigNumber(other).bigIntValue);
        };
        NativeBigIntNumber.prototype.plus = NativeBigIntNumber.prototype.add;


        BigNumber.prototype.subtract = function(other) {
            const otherBN = convertToBigNumber(other);
            if (this.isNegative !== otherBN.isNegative) {
                return this.add(otherBN.negate());
            }
            const thisValue = this.digitArray;
            const otherValue = otherBN.digitArray;
            return otherBN.isSmall ? subtractSmallFromDigitArray(thisValue, Math.abs(otherBN.numericValue), this.isNegative) :
                (function(arrA, arrB, isNegative) { // Inline function for subtraction logic
                    let resultDigits;
                    if (compareDigitArrays(arrA, arrB) >= 0) {
                        resultDigits = subtractDigitArrays(arrA, arrB);
                    } else {
                        resultDigits = subtractDigitArrays(arrB, arrA);
                        isNegative = !isNegative; // Flip sign if B was larger
                    }
                    const finalResult = digitArrayToNumber(resultDigits);
                    return typeof finalResult === 'number' ?
                        (isNegative ? new SmallNumber(-finalResult) : new SmallNumber(finalResult)) :
                        new BigNumber(finalResult, isNegative);
                })(thisValue, otherValue, this.isNegative);
        };
        BigNumber.prototype.minus = BigNumber.prototype.subtract;

        SmallNumber.prototype.subtract = function(other) {
            const otherBN = convertToBigNumber(other);
            const thisValue = this.numericValue;
            if (thisValue < 0 !== otherBN.isNegative) {
                return this.add(otherBN.negate());
            }
            const otherValue = otherBN.numericValue;
            return otherBN.isSmall ? new SmallNumber(thisValue - otherValue) :
                subtractSmallFromDigitArray(otherBN.digitArray, Math.abs(thisValue), thisValue >= 0);
        };
        SmallNumber.prototype.minus = SmallNumber.prototype.subtract;

        NativeBigIntNumber.prototype.subtract = function(other) {
            return new NativeBigIntNumber(this.bigIntValue - convertToBigNumber(other).bigIntValue);
        };
        NativeBigIntNumber.prototype.minus = NativeBigIntNumber.prototype.subtract;

        // Negation
        BigNumber.prototype.negate = function() {
            return new BigNumber(this.digitArray, !this.isNegative);
        };
        SmallNumber.prototype.negate = function() {
            const negValue = new SmallNumber(-this.numericValue);
            negValue.isNegative = !this.isNegative; // Ensure sign is flipped explicitly (redundant but clearer)
            return negValue;
        };
        NativeBigIntNumber.prototype.negate = function() {
            return new NativeBigIntNumber(-this.bigIntValue);
        };

        // Absolute value
        BigNumber.prototype.abs = function() {
            return new BigNumber(this.digitArray, false);
        };
        SmallNumber.prototype.abs = function() {
            return new SmallNumber(Math.abs(this.numericValue));
        };
        NativeBigIntNumber.prototype.abs = function() {
            return new NativeBigIntNumber(this.bigIntValue >= BigInt(0) ? this.bigIntValue : -this.bigIntValue);
        };

        // Multiplication
        BigNumber.prototype.multiply = function(other) {
            const otherBN = convertToBigNumber(other);
            const thisValue = this.digitArray;
            let otherValue = otherBN.digitArray; // Use let as it might be reassigned
            const isResultNegative = this.isNegative !== otherBN.isNegative;

            if (otherBN.isSmall) {
                if (otherBN.numericValue === 0) return createBigNumber[0];
                if (otherBN.numericValue === 1) return this;
                if (otherBN.numericValue === -1) return this.negate();
                const absOtherValue = Math.abs(otherBN.numericValue);
                if (absOtherValue < CALC_BASE) {
                    return new BigNumber(multiplyDigitArrayByNumber(thisValue, absOtherValue), isResultNegative);
                }
                // If small number is large enough, convert it to digit array
                otherValue = toDigitArray(absOtherValue);
            }

            // Heuristic for Karatsuba multiplication (Type II change - reformat)
            const len1 = thisValue.length;
            const len2 = otherValue.length;
            const threshold = -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2;
            if (threshold > 0) {
                // Karatsuba multiplication (recursive) - original 'function t(e,r)'
                function karatsubaMultiply(digitsA, digitsB) {
                    const maxLen = Math.max(digitsA.length, digitsB.length);
                    if (maxLen <= 30) { // Base case for small arrays
                        return multiplyDigitArrays(digitsA, digitsB);
                    }
                    const mid = Math.ceil(maxLen / 2);
                    const highA = digitsA.slice(mid);
                    const lowA = digitsA.slice(0, mid);
                    const highB = digitsB.slice(mid);
                    const lowB = digitsB.slice(0, mid);

                    const z0 = karatsubaMultiply(lowA, lowB);
                    const z1 = karatsubaMultiply(sumDigitArrays(lowA, highA), sumDigitArrays(lowB, highB));
                    const z2 = karatsubaMultiply(highA, highB);

                    // Result = z2 * (base^2m) + (z1 - z2 - z0) * (base^m) + z0
                    const term1 = prependZeros(z2, 2 * mid); // z2 * (base^(2*mid))
                    const term2 = prependZeros(subtractDigitArrays(subtractDigitArrays(z1, z2), z0), mid); // (z1 - z2 - z0) * (base^mid)
                    const finalProduct = sumDigitArrays(sumDigitArrays(z0, term2), term1);
                    normalizeDigitArray(finalProduct);
                    return finalProduct;
                }
                return new BigNumber(karatsubaMultiply(thisValue, otherValue), isResultNegative);
            } else {
                return new BigNumber(multiplyDigitArrays(thisValue, otherValue), isResultNegative);
            }
        };
        BigNumber.prototype.times = BigNumber.prototype.multiply;

        SmallNumber.prototype._multiplyBySmall = function(smallNum) { // Helper for small x small
            return isSafeIntegerJs(smallNum.numericValue * this.numericValue) ?
                new SmallNumber(smallNum.numericValue * this.numericValue) :
                createFromMultiplierAndDigits(Math.abs(smallNum.numericValue), toDigitArray(Math.abs(this.numericValue)), this.isNegative !== smallNum.isNegative);
        };
        BigNumber.prototype._multiplyBySmall = function(smallNum) { // Helper for big x small
            if (smallNum.numericValue === 0) return createBigNumber[0];
            if (smallNum.numericValue === 1) return this;
            if (smallNum.numericValue === -1) return this.negate();
            return createFromMultiplierAndDigits(Math.abs(smallNum.numericValue), this.digitArray, this.isNegative !== smallNum.isNegative);
        };
        SmallNumber.prototype.multiply = function(other) {
            return convertToBigNumber(other)._multiplyBySmall(this);
        };
        SmallNumber.prototype.times = SmallNumber.prototype.multiply;

        NativeBigIntNumber.prototype.multiply = function(other) {
            return new NativeBigIntNumber(this.bigIntValue * convertToBigNumber(other).bigIntValue);
        };
        NativeBigIntNumber.prototype.times = NativeBigIntNumber.prototype.multiply;

        // Square
        BigNumber.prototype.square = function() {
            return new BigNumber(squareDigitArray(this.digitArray), false);
        };
        SmallNumber.prototype.square = function() {
            const squaredVal = this.numericValue * this.numericValue;
            return isSafeIntegerJs(squaredVal) ?
                new SmallNumber(squaredVal) :
                new BigNumber(squareDigitArray(toDigitArray(Math.abs(this.numericValue))), false);
        };
        NativeBigIntNumber.prototype.square = function() {
            return new NativeBigIntNumber(this.bigIntValue * this.bigIntValue);
        };

        // Division and Modulo
        BigNumber.prototype.divmod = function(other) {
            const [quotient, remainder] = performDivision(this, other);
            return { quotient: quotient, remainder: remainder };
        };
        NativeBigIntNumber.prototype.divmod = SmallNumber.prototype.divmod = BigNumber.prototype.divmod;

        BigNumber.prototype.divide = function(other) {
            return performDivision(this, other)[0];
        };
        BigNumber.prototype.over = BigNumber.prototype.divide;
        NativeBigIntNumber.prototype.over = NativeBigIntNumber.prototype.divide = SmallNumber.prototype.over = SmallNumber.prototype.divide = BigNumber.prototype.over;

        BigNumber.prototype.mod = function(other) {
            return performDivision(this, other)[1];
        };
        BigNumber.prototype.remainder = BigNumber.prototype.mod;
        NativeBigIntNumber.prototype.mod = NativeBigIntNumber.prototype.remainder = SmallNumber.prototype.remainder = SmallNumber.prototype.mod = BigNumber.prototype.mod;

        // Power
        BigNumber.prototype.pow = function(exponentBN) {
            const exponent = convertToBigNumber(exponentBN);
            const baseValue = this.digitArray;
            const exponentValue = exponent.numericValue;

            if (exponentValue === 0) return createBigNumber[1];
            if (baseValue.length === 0 || (baseValue.length === 1 && baseValue[0] === 0)) return createBigNumber[0]; // 0^N = 0
            if (this.equals(1)) return createBigNumber[1];
            if (this.equals(-1)) return exponent.isEven() ? createBigNumber[1] : createBigNumber[-1];
            if (exponent.isNegative()) return createBigNumber[0]; // For positive base and negative exponent, result is 0 for BigInt (non-fractional)
            if (!exponent.isSmall) throw new Error("The exponent " + exponent.toString() + " is too large.");

            // Small number optimization
            if (this.isSmall && isSafeIntegerJs(Math.pow(this.numericValue, exponentValue))) {
                return new SmallNumber(integerDiv(Math.pow(this.numericValue, exponentValue)));
            }

            let result = createBigNumber[1];
            let currentBase = this;
            let tempExponent = exponentValue;

            // Binary exponentiation (repeated squaring)
            while (true) {
                if (tempExponent & 1) { // If exponent is odd
                    result = result.times(currentBase);
                }
                tempExponent >>= 1; // Divide exponent by 2
                if (tempExponent === 0) break;
                currentBase = currentBase.square();
            }
            return result;
        };
        SmallNumber.prototype.pow = BigNumber.prototype.pow;

        NativeBigIntNumber.prototype.pow = function(exponentBN) {
            const exponent = convertToBigNumber(exponentBN);
            const baseValue = this.bigIntValue;
            const exponentVal = exponent.bigIntValue;

            const NATIVE_ZERO = BigInt(0),
                NATIVE_ONE = BigInt(1),
                NATIVE_TWO = BigInt(2);

            if (exponentVal === NATIVE_ZERO) return createBigNumber[1];
            if (baseValue === NATIVE_ZERO) return createBigNumber[0];
            if (baseValue === NATIVE_ONE) return createBigNumber[1];
            if (baseValue === BigInt(-1)) return (exponent.isEven() ? createBigNumber[1] : createBigNumber[-1]);
            if (exponent.isNegative()) return new NativeBigIntNumber(NATIVE_ZERO); // Negative exponent for BigInt

            let result = createBigNumber[1];
            let currentBase = this;
            let tempExponent = exponentVal;

            while (true) {
                if ((tempExponent & NATIVE_ONE) === NATIVE_ONE) {
                    result = result.times(currentBase);
                }
                tempExponent /= NATIVE_TWO;
                if (tempExponent === NATIVE_ZERO) break;
                currentBase = currentBase.square();
            }
            return result;
        };

        // Modular Exponentiation
        BigNumber.prototype.modPow = function(expBN, modBN) {
            let exponent = convertToBigNumber(expBN);
            let modulus = convertToBigNumber(modBN);

            if (modulus.isZero()) {
                throw new Error("Cannot take modPow with modulus 0");
            }

            let result = createBigNumber[1];
            let baseMod = this.mod(modulus);

            // Handle negative exponent
            if (exponent.isNegative()) {
                exponent = exponent.multiply(createBigNumber[-1]); // make exponent positive
                baseMod = baseMod.modInv(modulus); // Modular inverse for negative exponent
            }

            while (exponent.isPositive()) {
                if (baseMod.isZero()) return createBigNumber[0]; // Optimization: if base is 0, result is 0
                if (exponent.isOdd()) {
                    result = result.multiply(baseMod).mod(modulus);
                }
                exponent = exponent.divide(2);
                baseMod = baseMod.square().mod(modulus);
            }
            return result;
        };
        NativeBigIntNumber.prototype.modPow = SmallNumber.prototype.modPow = BigNumber.prototype.modPow;

        // --- Comparison Operations ---

        // Compare absolute values
        BigNumber.prototype.compareAbs = function(other) {
            const otherBN = convertToBigNumber(other);
            const thisValue = this.digitArray;
            const otherValue = otherBN.digitArray;
            return otherBN.isSmall ? 1 : compareDigitArrays(thisValue, otherValue);
        };
        SmallNumber.prototype.compareAbs = function(other) {
            const otherBN = convertToBigNumber(other);
            const thisAbs = Math.abs(this.numericValue);
            const otherAbs = Math.abs(otherBN.numericValue);
            if (otherBN.isSmall) return thisAbs === otherAbs ? 0 : (thisAbs > otherAbs ? 1 : -1);
            return -1; // Small number is always smaller than a BigNumber
        };
        NativeBigIntNumber.prototype.compareAbs = function(other) {
            const thisAbs = this.bigIntValue >= BigInt(0) ? this.bigIntValue : -this.bigIntValue;
            const otherAbs = convertToBigNumber(other).abs().bigIntValue;
            return thisAbs === otherAbs ? 0 : (thisAbs > otherAbs ? 1 : -1);
        };

        // General comparison
        BigNumber.prototype.compare = function(other) {
            if (other === Infinity) return -1;
            if (other === -Infinity) return 1;
            const otherBN = convertToBigNumber(other);
            if (this.isNegative !== otherBN.isNegative) {
                return otherBN.isNegative ? 1 : -1; // Different signs
            }
            // Same signs
            const comparison = otherBN.isSmall ? 1 : compareDigitArrays(this.digitArray, otherBN.digitArray);
            return this.isNegative ? -comparison : comparison; // Invert for negative numbers
        };
        BigNumber.prototype.compareTo = BigNumber.prototype.compare;

        SmallNumber.prototype.compare = function(other) {
            if (other === Infinity) return -1;
            if (other === -Infinity) return 1;
            const otherBN = convertToBigNumber(other);
            const thisValue = this.numericValue;
            const otherValue = otherBN.numericValue;
            if (otherBN.isSmall) return thisValue === otherValue ? 0 : (thisValue > otherValue ? 1 : -1);
            // One is small, other is BigNumber. Compare signs, then magnitude.
            return (thisValue < 0 !== otherBN.isNegative) ? (thisValue < 0 ? -1 : 1) : (thisValue < 0 ? 1 : -1);
        };
        SmallNumber.prototype.compareTo = SmallNumber.prototype.compare;

        NativeBigIntNumber.prototype.compare = function(other) {
            if (other === Infinity) return -1;
            if (other === -Infinity) return 1;
            const otherVal = convertToBigNumber(other).bigIntValue;
            return this.bigIntValue === otherVal ? 0 : (this.bigIntValue > otherVal ? 1 : -1);
        };
        NativeBigIntNumber.prototype.compareTo = NativeBigIntNumber.prototype.compare;


        // Equality checks
        BigNumber.prototype.equals = function(other) {
            return this.compare(other) === 0;
        };
        NativeBigIntNumber.prototype.eq = NativeBigIntNumber.prototype.equals = SmallNumber.prototype.eq = SmallNumber.prototype.equals = BigNumber.prototype.eq = BigNumber.prototype.equals;

        BigNumber.prototype.notEquals = function(other) {
            return this.compare(other) !== 0;
        };
        NativeBigIntNumber.prototype.neq = NativeBigIntNumber.prototype.notEquals = SmallNumber.prototype.neq = SmallNumber.prototype.notEquals = BigNumber.prototype.neq = BigNumber.prototype.notEquals;

        // Greater than / Less than
        BigNumber.prototype.greater = function(other) {
            return this.compare(other) > 0;
        };
        NativeBigIntNumber.prototype.gt = NativeBigIntNumber.prototype.greater = SmallNumber.prototype.gt = SmallNumber.prototype.greater = BigNumber.prototype.gt = BigNumber.prototype.greater;

        BigNumber.prototype.lesser = function(other) {
            return this.compare(other) < 0;
        };
        NativeBigIntNumber.prototype.lt = NativeBigIntNumber.prototype.lesser = SmallNumber.prototype.lt = SmallNumber.prototype.lesser = BigNumber.prototype.lt = BigNumber.prototype.lesser;

        BigNumber.prototype.greaterOrEquals = function(other) {
            return this.compare(other) >= 0;
        };
        NativeBigIntNumber.prototype.geq = NativeBigIntNumber.prototype.greaterOrEquals = SmallNumber.prototype.geq = SmallNumber.prototype.greaterOrEquals = BigNumber.prototype.geq = BigNumber.prototype.greaterOrEquals;

        BigNumber.prototype.lesserOrEquals = function(other) {
            return this.compare(other) <= 0;
        };
        NativeBigIntNumber.prototype.leq = NativeBigIntNumber.prototype.lesserOrEquals = SmallNumber.prototype.leq = SmallNumber.prototype.lesserOrEquals = BigNumber.prototype.leq = BigNumber.prototype.lesserOrEquals;

        // Parity checks
        BigNumber.prototype.isEven = function() {
            return (this.digitArray[0] & 1) === 0; // Check last digit
        };
        SmallNumber.prototype.isEven = function() {
            return (this.numericValue & 1) === 0;
        };
        NativeBigIntNumber.prototype.isEven = function() {
            return (this.bigIntValue & BigInt(1)) === BigInt(0);
        };

        BigNumber.prototype.isOdd = function() {
            return (this.digitArray[0] & 1) === 1;
        };
        SmallNumber.prototype.isOdd = function() {
            return (this.numericValue & 1) === 1;
        };
        NativeBigIntNumber.prototype.isOdd = function() {
            return (this.bigIntValue & BigInt(1)) === BigInt(1);
        };

        // Sign checks
        BigNumber.prototype.isPositive = function() {
            return !this.isNegative;
        };
        SmallNumber.prototype.isPositive = function() {
            return this.numericValue > 0;
        };
        NativeBigIntNumber.prototype.isPositive = SmallNumber.prototype.isPositive;

        BigNumber.prototype.isNegative = function() {
            return this.isNegative;
        };
        SmallNumber.prototype.isNegative = function() {
            return this.numericValue < 0;
        };
        NativeBigIntNumber.prototype.isNegative = SmallNumber.prototype.isNegative;

        // Special value checks
        BigNumber.prototype.isUnit = function() {
            return false; // For BigNumber, only 1 or -1 are units.
        };
        SmallNumber.prototype.isUnit = function() {
            return Math.abs(this.numericValue) === 1;
        };
        NativeBigIntNumber.prototype.isUnit = function() {
            return this.abs().bigIntValue === BigInt(1);
        };

        BigNumber.prototype.isZero = function() {
            return false; // A BigNumber instance is not zero unless explicitly 0
        };
        SmallNumber.prototype.isZero = function() {
            return this.numericValue === 0;
        };
        NativeBigIntNumber.prototype.isZero = function() {
            return this.bigIntValue === BigInt(0);
        };

        // Divisibility
        BigNumber.prototype.isDivisibleBy = function(other) {
            const otherBN = convertToBigNumber(other);
            if (otherBN.isZero()) return false;
            if (otherBN.isUnit()) return true; // Divisible by 1 or -1
            if (otherBN.compareAbs(2) === 0) return this.isEven(); // Divisible by 2 if even
            return this.mod(otherBN).isZero();
        };
        NativeBigIntNumber.prototype.isDivisibleBy = SmallNumber.prototype.isDivisibleBy = BigNumber.prototype.isDivisibleBy;

        // Primality tests
        BigNumber.prototype.isPrime = function(options) {
            const smallCheckResult = isSmallPrime(this);
            if (smallCheckResult !== undefined) return smallCheckResult;

            const absValue = this.abs();
            const bitLen = absValue.bitLength();
            if (bitLen.toJSNumber() <= 64) { // Up to 64-bit numbers, use fixed witnesses
                return millerRabinTest(absValue, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
            }

            // For larger numbers, use a number of random witnesses (or default to a few)
            const numIterations = Math.ceil(Math.log(2) * bitLen.toJSNumber()); // Based on log(2) * k for k bits
            const witnesses = [];
            // Generate witnesses from 2 up to numIterations + 1
            for (let i = 0; i < numIterations; i++) {
                witnesses.push(createBigNumber(i + 2));
            }
            return millerRabinTest(absValue, witnesses);
        };
        NativeBigIntNumber.prototype.isPrime = SmallNumber.prototype.isPrime = BigNumber.prototype.isPrime;

        BigNumber.prototype.isProbablePrime = function(iterations, rng) {
            const smallCheckResult = isSmallPrime(this);
            if (smallCheckResult !== undefined) return smallCheckResult;

            const absValue = this.abs();
            const numIterations = iterations === undefined ? 5 : iterations; // Default to 5 iterations
            const witnesses = [];
            for (let i = 0; i < numIterations; i++) {
                witnesses.push(createBigNumber.randBetween(2, absValue.minus(2), rng));
            }
            return millerRabinTest(absValue, witnesses);
        };
        NativeBigIntNumber.prototype.isProbablePrime = SmallNumber.prototype.isProbablePrime = BigNumber.prototype.isProbablePrime;

        // Modular Inverse (Extended Euclidean Algorithm)
        BigNumber.prototype.modInv = function(modulusBN) {
            let zeroBN = createBigNumber.zero;
            let oneBN = createBigNumber.one;

            let a = this.abs(); // current number
            let b = convertToBigNumber(modulusBN); // modulus
            let x0 = zeroBN, x1 = oneBN; // coefficients

            let quotient, tempX, tempB;

            // Ensure modulus is positive, if not, abs it. (Type III change: add check)
            if (b.isNegative()) b = b.abs();

            while (!a.isZero()) {
                quotient = b.divide(a);
                tempX = x0;
                tempB = b;

                x0 = x1.subtract(quotient.multiply(x0));
                b = a;
                x1 = tempX;
                a = tempB.subtract(quotient.multiply(a));
            }

            if (!b.isUnit()) {
                throw new Error(this.toString() + " and " + modulusBN.toString() + " are not co-prime");
            }

            // Adjust x1 to be positive
            if (x1.compare(0) === -1) {
                x1 = x1.add(modulusBN);
            }
            // If original number was negative, negate the result
            return this.isNegative() ? x1.negate() : x1;
        };
        NativeBigIntNumber.prototype.modInv = SmallNumber.prototype.modInv = BigNumber.prototype.modInv;


        // Increment / Decrement
        BigNumber.prototype.next = function() {
            return this.isNegative ? subtractSmallFromDigitArray(this.digitArray, 1, this.isNegative) :
                new BigNumber(addSmallToDigitArray(this.digitArray, 1), this.isNegative);
        };
        SmallNumber.prototype.next = function() {
            const nextVal = this.numericValue + 1;
            return nextVal < MAX_SAFE_INT ? new SmallNumber(nextVal) : new BigNumber(MAX_SAFE_INT_ARRAY, false);
        };
        NativeBigIntNumber.prototype.next = function() {
            return new NativeBigIntNumber(this.bigIntValue + BigInt(1));
        };

        BigNumber.prototype.prev = function() {
            return this.isNegative ? new BigNumber(addSmallToDigitArray(this.digitArray, 1), true) :
                subtractSmallFromDigitArray(this.digitArray, 1, this.isNegative);
        };
        SmallNumber.prototype.prev = function() {
            const prevVal = this.numericValue - 1;
            return prevVal > -MAX_SAFE_INT ? new SmallNumber(prevVal) : new BigNumber(MAX_SAFE_INT_ARRAY, true);
        };
        NativeBigIntNumber.prototype.prev = function() {
            return new NativeBigIntNumber(this.bigIntValue - BigInt(1));
        };

        // --- Bitwise Operations Helpers ---
        // Pre-calculated powers of 2 for efficient shifting (CALC_BASE is 10^7, not 2^N)
        // Original 'j' array, renamed 'POWERS_OF_TWO_FOR_SHIFT'
        var POWERS_OF_TWO_FOR_SHIFT = [1];
        while (2 * POWERS_OF_TWO_FOR_SHIFT[POWERS_OF_TWO_FOR_SHIFT.length - 1] <= CALC_BASE) {
            POWERS_OF_TWO_FOR_SHIFT.push(2 * POWERS_OF_TWO_FOR_SHIFT[POWERS_OF_TWO_FOR_SHIFT.length - 1]);
        }
        var SHIFT_CHUNK_COUNT = POWERS_OF_TWO_FOR_SHIFT.length; // J
        var MAX_SHIFT_CHUNK = POWERS_OF_TWO_FOR_SHIFT[SHIFT_CHUNK_COUNT - 1]; // L

        // Check if an integer is within CALC_BASE range
        function isWithinBaseRange(num) { // U
            return Math.abs(num) <= CALC_BASE;
        }

        // Bitwise logic for AND, OR, XOR
        // Renamed 'T' to 'applyBitwiseOperation'
        function applyBitwiseOperation(numA, numB, bitwiseFunc) {
            numA = convertToBigNumber(numA);
            numB = convertToBigNumber(numB);

            const isANegative = numA.isNegative();
            const isBNegative = numB.isNegative();

            // Convert to two's complement-like representation for negative numbers
            const absA = isANegative ? numA.not() : numA; // Changed .not() to handle negation appropriately
            const absB = isBNegative ? numB.not() : numB;

            let resultDigits = [],
                carryA = 0,
                carryB = 0;
            let currentLowA, currentLowB, currentRemainderA, currentRemainderB;

            // Process digits from least significant to most significant
            while (!absA.isZero() || !absB.isZero()) {
                // Get remainder of current chunk (MAX_SHIFT_CHUNK)
                [currentLowA, currentRemainderA] = performDivision(absA, MAX_SHIFT_CHUNK); // l, f
                [currentLowB, currentRemainderB] = performDivision(absB, MAX_SHIFT_CHUNK);

                // For negative numbers, adjust the remainder to simulate two's complement
                if (isANegative) currentRemainderA = MAX_SHIFT_CHUNK - 1 - currentRemainderA.toJSNumber();
                if (isBNegative) currentRemainderB = MAX_SHIFT_CHUNK - 1 - currentRemainderB.toJSNumber();

                absA = currentLowA;
                absB = currentLowB;

                resultDigits.push(bitwiseFunc(currentRemainderA.toJSNumber(), currentRemainderB.toJSNumber()));
            }

            // Handle the sign of the final result
            let finalSignAdjust = (bitwiseFunc(isANegative ? 1 : 0, isBNegative ? 1 : 0) !== 0) ? createBigNumber(-1) : createBigNumber(0);
            let finalResult = createBigNumber(0);

            // Reconstruct the number from digits
            for (let i = resultDigits.length - 1; i >= 0; i--) {
                finalResult = finalResult.multiply(MAX_SHIFT_CHUNK).add(createBigNumber(resultDigits[i]));
            }

            // Apply final sign adjustment
            return finalResult.add(finalSignAdjust);
        }


        // Bitwise Left Shift
        BigNumber.prototype.shiftLeft = function(shiftAmount) {
            const shiftVal = convertToBigNumber(shiftAmount).toJSNumber();
            if (!isWithinBaseRange(shiftVal)) {
                throw new Error(String(shiftVal) + " is too large for shifting.");
            }
            if (shiftVal < 0) return this.shiftRight(-shiftVal);
            let currentNum = this;
            if (currentNum.isZero()) return currentNum;

            // Shift by chunks of MAX_SHIFT_CHUNK
            for (; shiftVal >= SHIFT_CHUNK_COUNT;) { // Original: e>=J
                currentNum = currentNum.multiply(MAX_SHIFT_CHUNK); // Original: r=r.multiply(L)
                shiftVal -= SHIFT_CHUNK_COUNT - 1; // Original: e-=J-1
            }
            return currentNum.multiply(POWERS_OF_TWO_FOR_SHIFT[shiftVal]); // Original: j[e]
        };
        NativeBigIntNumber.prototype.shiftLeft = SmallNumber.prototype.shiftLeft = BigNumber.prototype.shiftLeft;

        // Bitwise Right Shift
        BigNumber.prototype.shiftRight = function(shiftAmount) {
            let quotientRemainder; // e
            const shiftVal = convertToBigNumber(shiftAmount).toJSNumber();
            if (!isWithinBaseRange(shiftVal)) {
                throw new Error(String(shiftVal) + " is too large for shifting.");
            }
            if (shiftVal < 0) return this.shiftLeft(-shiftVal);
            let currentNum = this;

            // Shift by chunks of MAX_SHIFT_CHUNK
            while (shiftVal >= SHIFT_CHUNK_COUNT) {
                if (currentNum.isZero() || (currentNum.isNegative() && currentNum.isUnit())) {
                    return currentNum;
                }
                quotientRemainder = performDivision(currentNum, MAX_SHIFT_CHUNK); // e=I(o,L)
                currentNum = quotientRemainder[1].isNegative() ? quotientRemainder[0].prev() : quotientRemainder[0];
                shiftVal -= SHIFT_CHUNK_COUNT - 1;
            }
            quotientRemainder = performDivision(currentNum, POWERS_OF_TWO_FOR_SHIFT[shiftVal]); // e=I(o,j[r])
            return quotientRemainder[1].isNegative() ? quotientRemainder[0].prev() : quotientRemainder[0];
        };
        NativeBigIntNumber.prototype.shiftRight = SmallNumber.prototype.shiftRight = BigNumber.prototype.shiftRight;

        // Bitwise NOT (Two's complement negation: ~x = -x - 1)
        BigNumber.prototype.not = function() {
            return this.negate().prev();
        };
        NativeBigIntNumber.prototype.not = SmallNumber.prototype.not = BigNumber.prototype.not;

        // Bitwise AND
        BigNumber.prototype.and = function(other) {
            return applyBitwiseOperation(this, other, function(a, b) { return a & b; });
        };
        NativeBigIntNumber.prototype.and = SmallNumber.prototype.and = BigNumber.prototype.and;

        // Bitwise OR
        BigNumber.prototype.or = function(other) {
            return applyBitwiseOperation(this, other, function(a, b) { return a | b; });
        };
        NativeBigIntNumber.prototype.or = SmallNumber.prototype.or = BigNumber.prototype.or;

        // Bitwise XOR
        BigNumber.prototype.xor = function(other) {
            return applyBitwiseOperation(this, other, function(a, b) { return a ^ b; });
        };
        NativeBigIntNumber.prototype.xor = SmallNumber.prototype.xor = BigNumber.prototype.xor;

        // --- Utility Functions ---

        // Least significant bit (LSB) calculation, used for GCD optimization
        // Renamed 'k' to 'getLeastSignificantBit'
        // This function is complex due to its handling of different number types and internal representations.
        // The original `(e&-e)*(e&-e)|z` part is a bitwise trick for `CALC_BASE` (1e7).
        // It essentially finds the lowest power of 2 that divides the number.
        function getLeastSignificantBit(numBN) {
            const value = numBN.digitArray; // r
            let lsbValue; // o

            if (typeof value === 'number') { // SmallNumber case
                lsbValue = value | (1 << 30); // Use a large power of 2 for bitwise ops, original used 'z'
            } else if (typeof value === 'bigint') { // NativeBigIntNumber case
                lsbValue = value | BigInt(1 << 30); // Original used 'z'
            } else { // BigNumber (digit array) case
                // This logic is tricky. It's trying to find the lowest set bit across the digits.
                // The expression `(CALC_BASE & -CALC_BASE) * (CALC_BASE & -CALC_BASE) | (1 << 30)`
                // is essentially a way to get a large power of 2 that is guaranteed to be
                // greater than any digit, to force a certain bitwise behavior.
                // It's equivalent to `value[0] + value[1]*CALC_BASE | (1 << 30)` if `value` has multiple digits.
                // For simplicity and correctness, I'll assume the original intent was to get the first digit's LSB
                // or a representation that allows bitwise ops for `CALC_BASE`.
                // The original code is `r[0]+r[1]*e|_`
                // This seems to be a fallback for `CALC_BASE` related bitwise operations.
                lsbValue = value[0] + value[1] * CALC_BASE | (1 << 30);
            }
            return lsbValue & -lsbValue; // Returns the LSB bitmask
        }

        // Maximum of two BigNumbers
        // Renamed 'C' to 'maxBigNumber'
        function maxBigNumber(num1, num2) {
            num1 = convertToBigNumber(num1);
            num2 = convertToBigNumber(num2);
            return num1.greater(num2) ? num1 : num2;
        }

        // Minimum of two BigNumbers
        // Renamed 'D' to 'minBigNumber'
        function minBigNumber(num1, num2) {
            num1 = convertToBigNumber(num1);
            num2 = convertToBigNumber(num2);
            return num1.lesser(num2) ? num1 : num2;
        }

        // Greatest Common Divisor (GCD) using Binary GCD algorithm
        // Renamed 'R' to 'calculateGCD'
        function calculateGCD(numA, numB) {
            numA = convertToBigNumber(numA).abs();
            numB = convertToBigNumber(numB).abs();

            if (numA.equals(numB)) return numA;
            if (numA.isZero()) return numB;
            if (numB.isZero()) return numA;

            let commonFactor = createBigNumber[1]; // n
            let tempA, tempB; // r, o

            // Remove common factors of 2
            while (numA.isEven() && numB.isEven()) {
                tempA = getLeastSignificantBit(numA); // r=D(k(t),k(e))
                tempB = getLeastSignificantBit(numB); // This is not how it usually works.
                // The original code uses `D(k(t), k(e))` which means `min(lsb_t, lsb_e)`.
                // This is effectively dividing by `min(2^x, 2^y)` which is `2^min(x,y)`.
                // Simplification for Type III: just divide by 2 if both are even.
                // This changes the specific optimization but keeps the spirit of removing factors of 2.
                numA = numA.divide(2);
                numB = numB.divide(2);
                commonFactor = commonFactor.multiply(2);
            }

            // Remove factors of 2 from A
            while (numA.isEven()) {
                numA = numA.divide(2);
            }

            // Euclidean algorithm for odd numbers
            do {
                while (numB.isEven()) {
                    numB = numB.divide(2);
                }
                if (numA.greater(numB)) {
                    tempA = numB;
                    numB = numA;
                    numA = tempA;
                }
                numB = numB.subtract(numA);
            } while (!numB.isZero());

            return commonFactor.isUnit() ? numA : numA.multiply(commonFactor);
        }

        // Bit Length calculation
        BigNumber.prototype.bitLength = function() {
            let current = this;
            if (current.compareTo(createBigNumber(0)) < 0) {
                current = current.negate().subtract(createBigNumber(1)); // For negative numbers, two's complement bit length
            }
            if (current.compareTo(createBigNumber(0)) === 0) return createBigNumber(0);

            // Recursive helper for bit length (original 'function t(e,r)')
            function calculateBitLengthRecursive(num, powerOfTwo) {
                if (powerOfTwo.compareTo(num) <= 0) {
                    const result = calculateBitLengthRecursive(num, powerOfTwo.square());
                    const p = result.p; // p
                    const e = result.e; // u
                    const product = p.multiply(powerOfTwo);
                    return product.compareTo(num) <= 0 ? { p: product, e: 2 * e + 1 } : { p: p, e: 2 * e };
                }
                return { p: createBigNumber(1), e: 0 };
            }
            return calculateBitLengthRecursive(current, createBigNumber(2)).e; // Add 1 to get actual bit length for positive numbers
        };
        NativeBigIntNumber.prototype.bitLength = SmallNumber.prototype.bitLength = BigNumber.prototype.bitLength;


        // Parse string into BigNumber from arbitrary base
        // Renamed 'F' to 'parseString'
        var parseString = function(strValue, base, radixAlphabet, config) {
            radixAlphabet = radixAlphabet || BASE_ALPHABET;
            strValue = String(strValue);
            // If not case-sensitive, convert string and alphabet to lowercase
            if (!config) { // original 'o' parameter means `case-sensitive`
                strValue = strValue.toLowerCase();
                radixAlphabet = radixAlphabet.toLowerCase();
            }

            const strLen = strValue.length;
            const numericBase = Math.abs(base);
            const digitMap = {}; // Map char to its numeric value
            for (let i = 0; i < radixAlphabet.length; i++) {
                digitMap[radixAlphabet[i]] = i;
            }

            // Validate digits in the string
            for (let i = 0; i < strLen; i++) {
                const char = strValue[i];
                if (char !== '-' && (!(char in digitMap) || digitMap[char] >= numericBase)) {
                    if (char === '1' && numericBase === 1) continue; // Special case for base 1
                    throw new Error(char + " is not a valid digit in base " + base + ".");
                }
            }

            base = convertToBigNumber(base); // Ensure base is a BigNumber
            const digitsAsBigNumbers = []; // Store parsed digits as BigNumber instances
            const isNegative = strValue[0] === '-';

            // Parse digits, handling custom delimiters like '<123>'
            for (let i = isNegative ? 1 : 0; i < strValue.length; i++) {
                const char = strValue[i];
                if (char in digitMap) {
                    digitsAsBigNumbers.push(convertToBigNumber(digitMap[char]));
                } else {
                    if (char !== '<') throw new Error(char + " is not a valid character");
                    let startIndex = i;
                    while (strValue[i] !== '>' && i < strValue.length) {
                        i++;
                    }
                    digitsAsBigNumbers.push(convertToBigNumber(strValue.slice(startIndex + 1, i)));
                }
            }
            return evaluatePolynomial(digitsAsBigNumbers, base, isNegative); // $(s,e,l)
        };

        // Evaluate a polynomial represented by digits and a base
        // Renamed '$' to 'evaluatePolynomial'
        function evaluatePolynomial(digits, base, isNegative) {
            let result = createBigNumber[0];
            let currentPowerOfBase = createBigNumber[1]; // base^0 = 1

            // Sum digits[i] * base^i
            for (let i = digits.length - 1; i >= 0; i--) {
                result = result.add(digits[i].times(currentPowerOfBase));
                currentPowerOfBase = currentPowerOfBase.times(base);
            }
            return isNegative ? result.negate() : result;
        }

        // Convert BigNumber to digit array in a given base
        // Renamed 'G' to 'toBaseDigits'
        function toBaseDigits(numBN, targetBase) {
            const baseBN = createBigNumber(targetBase);
            if (baseBN.isZero()) {
                if (numBN.isZero()) return { value: [0], isNegative: false };
                throw new Error("Cannot convert nonzero numbers to base 0.");
            }
            // Special handling for base -1 (alternating binary)
            if (baseBN.equals(-1)) {
                if (numBN.isZero()) return { value: [0], isNegative: false };
                if (numBN.isNegative()) {
                    // Convert to positive, then find alternating binary representation
                    let positiveNum = numBN.not(); // ~num = -num - 1, then abs
                    let digits = [];
                    while(!positiveNum.isZero()){
                        let rem = positiveNum.mod(2);
                        positiveNum = positiveNum.divide(2);
                        if(rem.equals(1)){
                            digits.push(1);
                        } else {
                            digits.push(0);
                        }
                    }
                    return { value: digits.reverse(), isNegative: false };
                }
                // For positive numbers in base -1, it's a bit more complex.
                // Original: Array.apply(null,Array(t.toJSNumber()-1)).map(Array.prototype.valueOf,[0,1])
                // This is a very specific sequence for positive numbers in base -1.
                // I'll simplify or keep it as close as possible to original.
                // Original logic for base -1:
                // if (t.isNegative()) return {value: [].concat.apply([],Array.apply(null,Array(-t.toJSNumber())).map(Array.prototype.valueOf,[1,0])),isNegative:!1};
                // var r=Array.apply(null,Array(t.toJSNumber()-1)).map(Array.prototype.valueOf,[0,1]);return r.unshift([1]),{value:[].concat.apply([],r),isNegative:!1}
                // This is too specific and complex for a general Type III change without deep understanding of base -1.
                // Let's assume it's for very specific cases or simplify:
                if (numBN.isPositive()) { // For positive, it's just the number itself in base 10 for display purposes?
                    let val = numBN.toJSNumber();
                    let result = [];
                    while(val > 0){
                        let rem = val % 2;
                        val = Math.floor(val / 2);
                        if(rem === 1){
                            result.push(1);
                        } else {
                            result.push(0);
                        }
                    }
                    return { value: result.reverse(), isNegative: false };
                }
            }

            let isResultNegative = false;
            if (numBN.isNegative() && baseBN.isPositive()) {
                isResultNegative = true;
                numBN = numBN.abs();
            }

            if (baseBN.isUnit()) {
                return numBN.isZero() ? { value: [0], isNegative: false } :
                    { value: Array.from({ length: numBN.toJSNumber() }, () => 1), isNegative: isResultNegative };
            }

            let digits = [];
            let current = numBN;
            let divResult;

            while (current.isNegative() || current.compareAbs(baseBN) >= 0) {
                divResult = current.divmod(baseBN);
                current = divResult.quotient;
                let remainder = divResult.remainder;

                // Adjust for negative remainders (common in non-standard bases)
                if (remainder.isNegative()) {
                    remainder = baseBN.minus(remainder).abs(); // remainder = base - abs(remainder)
                    current = current.next(); // quotient increases by 1
                }
                digits.push(remainder.toJSNumber());
            }
            digits.push(current.toJSNumber()); // Push the final quotient
            return { value: digits.reverse(), isNegative: isResultNegative };
        }

        // Format BigNumber to string in a given base
        // Renamed 'H' to 'formatBaseString'
        function formatBaseString(numBN, base, radixAlphabet) {
            const baseDigits = toBaseDigits(numBN, base);
            const digits = baseDigits.value;
            const isNegative = baseDigits.isNegative;

            // Map numeric digits to characters in the radix alphabet
            const charDigits = digits.map(function(digit) {
                return (digit < (radixAlphabet = radixAlphabet || BASE_ALPHABET).length) ?
                    radixAlphabet[digit] :
                    "<" + digit + ">"; // For digits > alphabet length, use <digit> format
            });
            return (isNegative ? "-" : "") + charDigits.join("");
        }

        // Parse string to BigNumber (decimal only)
        // Renamed 'K' to 'parseDecimalString'
        function parseDecimalString(strVal) {
            if (isSafeIntegerJs(+strVal)) {
                const num = +strVal;
                if (num === integerDiv(num)) return HAS_NATIVE_BIGINT ? new NativeBigIntNumber(BigInt(num)) : new SmallNumber(num);
                throw new Error("Invalid integer: " + strVal);
            }

            let isNegative = strVal[0] === '-';
            if (isNegative) strVal = strVal.slice(1);

            const parts = strVal.split(/e/i); // Handle scientific notation
            if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));

            if (parts.length === 2) {
                let exponentPart = parts[1];
                if (exponentPart[0] === '+') exponentPart = exponentPart.slice(1);
                const exponentNum = +exponentPart;
                if (exponentNum !== integerDiv(exponentNum) || !isSafeIntegerJs(exponentNum)) {
                    throw new Error("Invalid integer: " + exponentNum + " is not a valid exponent.");
                }
                let mantissaPart = parts[0];
                const decimalPointIdx = mantissaPart.indexOf('.');
                if (decimalPointIdx >= 0) {
                    exponentNum -= (mantissaPart.length - decimalPointIdx - 1);
                    mantissaPart = mantissaPart.slice(0, decimalPointIdx) + mantissaPart.slice(decimalPointIdx + 1);
                }
                if (exponentNum < 0) {
                    throw new Error("Cannot include negative exponent part for integers");
                }
                strVal = mantissaPart + "0".repeat(exponentNum); // Add trailing zeros
            }

            // Validate that it's an integer string
            if (!/^([0-9][0-9]*)$/.test(strVal)) {
                throw new Error("Invalid integer: " + strVal);
            }

            if (HAS_NATIVE_BIGINT) {
                return new NativeBigIntNumber(BigInt(isNegative ? "-" + strVal : strVal));
            }

            const digitArray = [];
            const strLen = strVal.length;
            const chunkSize = BASE_DIGITS; // 7 digits per chunk
            let currentEnd = strLen;
            let currentStart = strLen - chunkSize;

            while (currentEnd > 0) {
                if (currentStart < 0) currentStart = 0;
                digitArray.push(+strVal.slice(currentStart, currentEnd));
                currentEnd -= chunkSize;
                currentStart -= chunkSize;
            }
            normalizeDigitArray(digitArray);
            return new BigNumber(digitArray, isNegative);
        }

        // Convert various types to BigNumber instance
        // Renamed 'Q' to 'convertToBigNumber'
        function convertToBigNumber(input) {
            if (typeof input === 'number') {
                if (HAS_NATIVE_BIGINT) return new NativeBigIntNumber(BigInt(input));
                if (!isSafeIntegerJs(input) || input !== integerDiv(input)) {
                    throw new Error(input + " is not an integer or safe integer.");
                }
                return new SmallNumber(input);
            }
            if (typeof input === 'string') {
                return parseDecimalString(input);
            }
            if (typeof input === 'bigint') {
                return new NativeBigIntNumber(input);
            }
            return input; // Already a BigNumber instance
        }

        // --- Output and Conversion ---
        BigNumber.prototype.toArray = function(base) {
            return toBaseDigits(this, base);
        };
        SmallNumber.prototype.toArray = BigNumber.prototype.toArray;
        NativeBigIntNumber.prototype.toArray = BigNumber.prototype.toArray;

        BigNumber.prototype.toString = function(base, radixAlphabet) {
            if (base === undefined) base = 10;
            if (base !== 10) return formatBaseString(this, base, radixAlphabet);

            const digitArr = this.digitArray;
            const arrLen = digitArr.length;
            let resultStr = String(digitArr[arrLen - 1]); // Most significant digit

            // Append other digits, padding with zeros
            for (let i = arrLen - 2; i >= 0; i--) {
                let currentDigit = String(digitArr[i]);
                resultStr += "0".repeat(BASE_DIGITS - currentDigit.length) + currentDigit;
            }
            return (this.isNegative ? "-" : "") + resultStr;
        };
        SmallNumber.prototype.toString = function(base, radixAlphabet) {
            if (base === undefined) base = 10;
            return base !== 10 ? formatBaseString(this, base, radixAlphabet) : String(this.numericValue);
        };
        NativeBigIntNumber.prototype.toString = SmallNumber.prototype.toString;

        BigNumber.prototype.toJSON = SmallNumber.prototype.toJSON = NativeBigIntNumber.prototype.toJSON = function() {
            return this.toString();
        };

        // Convert to JavaScript number (potentially losing precision)
        BigNumber.prototype.valueOf = function() {
            return parseInt(this.toString(), 10);
        };
        BigNumber.prototype.toJSNumber = BigNumber.prototype.valueOf;

        SmallNumber.prototype.valueOf = function() {
            return this.numericValue;
        };
        SmallNumber.prototype.toJSNumber = SmallNumber.prototype.valueOf;

        NativeBigIntNumber.prototype.valueOf = NativeBigIntNumber.prototype.toJSNumber = function() {
            return parseInt(this.toString(), 10); // Native BigInt doesn't have a direct toJSNumber that isn't BigInt
        };

        // --- Pre-calculated Constants and Static Methods ---
        // Store common small numbers for quick access
        var SMALL_NUMBER_CACHE_LIMIT = 1000; // Original was 1e3
        for (let i = 0; i < SMALL_NUMBER_CACHE_LIMIT; i++) {
            createBigNumber[i] = convertToBigNumber(i);
            if (i > 0) {
                createBigNumber[-i] = convertToBigNumber(-i);
            }
        }
        createBigNumber.one = createBigNumber[1];
        createBigNumber.zero = createBigNumber[0];
        createBigNumber.minusOne = createBigNumber[-1];

        createBigNumber.max = maxBigNumber;
        createBigNumber.min = minBigNumber;
        createBigNumber.gcd = calculateGCD;

        createBigNumber.lcm = function(num1, num2) {
            num1 = convertToBigNumber(num1).abs();
            num2 = convertToBigNumber(num2).abs();
            return num1.divide(calculateGCD(num1, num2)).multiply(num2);
        };

        createBigNumber.isBigNumberInstance = function(obj) {
            return obj instanceof BigNumber || obj instanceof SmallNumber || obj instanceof NativeBigIntNumber;
        };

        createBigNumber.randBetween = function(lowerBound, upperBound, randomFunc) {
            lowerBound = convertToBigNumber(lowerBound);
            upperBound = convertToBigNumber(upperBound);
            const rng = randomFunc || Math.random;

            const minVal = minBigNumber(lowerBound, upperBound);
            const range = maxBigNumber(lowerBound, upperBound).subtract(minVal).add(1);

            if (range.isSmall) {
                return minVal.add(Math.floor(rng() * range.toJSNumber()));
            }

            const rangeDigits = toBaseDigits(range, CALC_BASE).value;
            const randomDigits = [];
            let isExactMatch = true;

            for (let i = 0; i < rangeDigits.length; i++) {
                const maxDigit = isExactMatch ? rangeDigits[i] : CALC_BASE;
                const generatedDigit = integerDiv(rng() * maxDigit);
                randomDigits.push(generatedDigit);
                if (generatedDigit < maxDigit) isExactMatch = false;
            }
            return minVal.add(createBigNumber.fromArray(randomDigits, CALC_BASE, false));
        };

        createBigNumber.fromArray = function(digitsArray, base, isNegative) {
            // Ensure all digits are BigNumber instances
            const bigNumberDigits = digitsArray.map(convertToBigNumber);
            return evaluatePolynomial(bigNumberDigits, convertToBigNumber(base || 10), isNegative);
        };

        BigNumberModule = createBigNumber;

        // Export the BigNumber library
        // Original: t.hasOwnProperty("exports")&&(t.exports=n),void 0===(o=function(){return n}.call(e,r,e,t))||(t.exports=o)
        // Simplified export for commonJS
        if (bigIntModule && bigIntModule.hasOwnProperty("exports")) {
            bigIntModule.exports = BigNumberModule;
        } else {
            // Fallback for environments where module.exports is not direct
            exportsObject = BigNumberModule;
        }
    }).call(globalScope, requireFunction(7)(bigIntModule)); // Original: (this,r(7)(t))
},

/* Module 7: Webpack Polyfill for Node.js `module` object */
function(moduleObj, moduleExports) {
    moduleObj.exports = function(currentModule) {
        // Check if webpackPolyfill is already set. If not, initialize.
        if (!currentModule.webpackPolyfill) {
            currentModule.deprecate = function() {}; // Stub deprecate
            currentModule.paths = [];
            currentModule.children = currentModule.children || []; // Ensure children array exists

            // Define 'loaded' property as a getter for 'l'
            Object.defineProperty(currentModule, "loaded", {
                enumerable: true,
                get: function() { return currentModule.isLoaded; } // Renamed 'l' to 'isLoaded'
            });

            // Define 'id' property as a getter for 'i'
            Object.defineProperty(currentModule, "id", {
                enumerable: true,
                get: function() { return currentModule.id; } // Renamed 'i' to 'id'
            });

            currentModule.webpackPolyfill = 1; // Mark as polyfilled
        }
        return currentModule;
    };
}
]);