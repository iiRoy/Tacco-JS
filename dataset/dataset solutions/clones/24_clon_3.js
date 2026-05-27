(function mainApplication(global, undefined) {
    'use strict';

    // --- Utility Functions Module (formerly 'utils') ---
    // Renamed and refactored print_float
    function formatFloat(value, precision) { // Removed unused 'base', 'pad' parameters
        const powerOfTen = Math.pow(10, precision);
        const roundedValue = Math.round(value * powerOfTen);
        const integerString = String(roundedValue);

        if (integerString === '0') {
            return '0.' + '0'.repeat(precision);
        }

        const integerPartLength = integerString.length - precision;

        // Replicating original substr logic to preserve exact behavior, including potential edge cases/bugs.
        if (integerPartLength === 0) {
            return "0." + integerString.substr(integerPartLength, precision);
        } else {
            return integerString.substr(0, integerPartLength) + "." + integerString.substr(integerPartLength, precision);
        }
    }

    // Expose utility functions to global scope, matching original behavior
    global.formatFloat = formatFloat;


    // --- Math Operations Module (formerly 'math') ---
    // Renamed functions
    function greatestCommonDivisor(firstNum, secondNum) {
        return !secondNum ? firstNum : greatestCommonDivisor(secondNum, firstNum % secondNum);
    }

    function leastCommonMultiple(firstNum, secondNum) {
        // Preserving original behavior for LCM, including NaN for lcm(0,0)
        return (firstNum / greatestCommonDivisor(firstNum, secondNum)) * secondNum;
    }

    function square(num) {
        return num * num;
    }

    // Expose math functions to global scope, matching original behavior
    global.greatestCommonDivisor = greatestCommonDivisor;
    global.leastCommonMultiple = leastCommonMultiple;
    global.square = square;


    // --- Application Initialization and Solver Logic ---
    let pendingNumericInputs = [];
    let standardInputSource; // Renamed from stdin
    let logOutputFunction; // Renamed from output

    // Initialization function (formerly 'init')
    function initializeApplication() {
        logOutputFunction = function() {
            console.log.apply(console, arguments);
        };
        standardInputSource = process.openStdin();
        standardInputSource.setEncoding('utf8');

        standardInputSource.on('data', function(dataChunk) { // Renamed chunk to dataChunk
            const parsedNumbers = dataChunk.match(/[-]?\d+/g);
            if (parsedNumbers) { // Added check for null match result
                pendingNumericInputs.push(...parsedNumbers); // Using spread for in-place modification
            }
        });

        standardInputSource.on('end', function() {
            initiateProcessing(); // Renamed fire to initiateProcessing
        });
    }

    // Input handling functions
    function retrieveNextNumber() { // Renamed input_number
        const nextInput = pendingNumericInputs.shift(); // Using shift for clarity and efficiency
        return parseInt(nextInput, 10); // Explicit radix
    }

    function areMoreInputsAvailable() { // Renamed has_next
        // Original `has_next` returned true if list was empty.
        // This function returns true if there ARE more inputs.
        return pendingNumericInputs.length > 0;
    }

    // Solver function (formerly 'solver' IIFE)
    function initiateProcessing() { // Renamed fire
        setTimeout(processInputPair, 0);
    }

    function processInputPair() { // Renamed solve
        const firstValue = retrieveNextNumber();
        const secondValue = retrieveNextNumber();
        const currentInputPair = [firstValue, secondValue]; // Helper variable for clarity

        const calculatedGCD = greatestCommonDivisor(currentInputPair[0], currentInputPair[1]);
        const calculatedLCM = leastCommonMultiple(currentInputPair[0], currentInputPair[1]);

        logOutputFunction(calculatedGCD, calculatedLCM);

        // Condition adjusted based on `areMoreInputsAvailable` definition
        if (areMoreInputsAvailable()) {
            setTimeout(processInputPair, 0);
        }
    }

    // Call the initialization function to set up the application
    initializeApplication();

    // Expose the main entry point to global, matching original behavior
    global.initiateProcessing = initiateProcessing;

})(global);
