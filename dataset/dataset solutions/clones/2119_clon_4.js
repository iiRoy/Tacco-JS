const ioUtility = require('fs');
const errorValue = -1;

// Helper to convert a space-separated string of numbers into an array of numbers
const numericParser = (text) => text.split(' ').map(Number);

// Core logic to determine the digit sequence based on constraints
const deriveDigitSequence = (totalDigits, constraints) => {
    // Initial state for the reducer: an object to hold the current digit configuration
    const initialState = {
        config: new Map(), // Stores confirmed digits by 0-indexed position
        firstDigitConstrained: false, // Tracks if the first digit (position 0) was explicitly set by a constraint
        isValid: true // Overall validity flag, set to false if a conflict or invalid state occurs
    };

    // Process each constraint using Array.prototype.reduce
    const { config, firstDigitConstrained, isValid } = constraints.reduce((accumulator, currentConstraint) => {
        // If the state is already invalid, no further processing is needed for this path
        if (!accumulator.isValid) return accumulator;

        const [positionOneBased, digitValue] = currentConstraint;
        const positionZeroBased = positionOneBased - 1; // Convert 1-indexed to 0-indexed

        // Check for conflicting constraints: if a digit for this position was already set and is different
        if (accumulator.config.has(positionZeroBased) && accumulator.config.get(positionZeroBased) !== digitValue) {
            return { ...accumulator, isValid: false }; // Mark as invalid
        }

        // Apply the constraint: set the digit for the current position
        accumulator.config.set(positionZeroBased, digitValue);
        // Track if the first digit (position 0) was explicitly constrained
        if (positionZeroBased === 0) {
            accumulator.firstDigitConstrained = true;
        }
        return accumulator;
    }, initialState);

    // If any conflict was found during the reduction process, return null (indicating failure)
    if (!isValid) {
        return null;
    }

    // Apply the original code's specific first-digit validation rules:
    // 1. If the first digit was explicitly set to 0, it's an error.
    if (config.has(0) && config.get(0) === 0) {
        return null;
    }
    // 2. If the first digit was NOT explicitly set by any constraint, it's an error.
    if (!firstDigitConstrained) {
        return null;
    }

    // Construct the final digit array. Unspecified positions default to 0.
    const finalSequence = Array.from({ length: totalDigits }, (_, index) => {
        return config.has(index) ? config.get(index) : 0;
    });

    return finalSequence;
};

// Orchestrates the entire process from reading input to printing output
const executeSolution = (inputContent) => {
    const contentLines = inputContent.split('\n');

    // Parse the first line for total number of digits and number of constraints
    const [totalDigits, numConstraints] = numericParser(contentLines.shift());
    // Parse the remaining lines (up to numConstraints) for the actual constraints
    const constraints = contentLines.slice(0, numConstraints).map(numericParser);

    // Derive the final digit sequence based on the parsed information
    const finalDigits = deriveDigitSequence(totalDigits, constraints);

    // Output the result
    if (finalDigits === null) {
        console.log(errorValue); // Output error code if derivation failed
    } else {
        console.log(finalDigits.join('')); // Output the joined digit string
    }
};

// Entry point: read input from stdin and execute the solution
executeSolution(ioUtility.readFileSync('/dev/stdin', 'utf8'));