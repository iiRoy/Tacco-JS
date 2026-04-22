const fileSystem = require('fs');

/**
 * Parses a string into a numeric value.
 * If the string cannot be converted to a number, it defaults to 0.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed numeric value or 0.
 */
const parseNumericValue = (inputString) => {
    const parsedNumber = Number(inputString);
    // Return the parsed number, or 0 if it's not a valid number (NaN).
    return isNaN(parsedNumber) ? 0 : parsedNumber;
};

// Retrieve all lines of input from the standard input stream.
// The input is read as UTF-8 text and split into an array of lines.
const rawInputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');

// Perform an initial check for sufficient input data.
// We expect at least one line for parameters and potentially one for operations.
if (rawInputLines.length < 1) {
    console.log('No'); // Not enough data to even read parameters.
    return;
}

// The initial line contains the problem's primary configuration values.
const primaryConfigurationLine = rawInputLines[0].split(' ');

// Validate the number of configuration parameters.
// We expect four numeric values: N, A, B, C.
if (primaryConfigurationLine.length < 4) {
    console.log('No'); // Insufficient initial parameters.
    return;
}

// Extract and convert the initial state parameters.
const totalOperationSteps = parseNumericValue(primaryConfigurationLine[0]); // Corresponds to N
let alphaCount = parseNumericValue(primaryConfigurationLine[1]);     // Corresponds to A
let betaCount = parseNumericValue(primaryConfigurationLine[2]);      // Corresponds to B
let gammaCount = parseNumericValue(primaryConfigurationLine[3]);     // Corresponds to C

// An array to hold the sequence of operation instructions.
const instructionSequence = [];

// Populate the instruction sequence from the input lines, starting from the second line.
// We iterate up to `totalOperationSteps` to collect all expected instructions.
for (let currentLineIdx = 0; currentLineIdx < totalOperationSteps; currentLineIdx++) {
    const lineContent = rawInputLines[currentLineIdx + 1];
    if (lineContent !== undefined) {
        instructionSequence.push(lineContent.trim()); // Add trimmed line to sequence.
    } else {
        // If an expected instruction line is missing, this might indicate an invalid input.
        // For robustness, we could throw an error or handle it as an 'impossible' case.
        // For this problem, we proceed and let subsequent logic determine feasibility.
    }
}

// A boolean flag to track if the overall sequence of operations is possible.
let solutionIsFeasible = true;
// An array to store the specific character ('A', 'B', or 'C') chosen at each step.
const chosenActionPath = [];

/**
 * Helper function to modify counts based on a chosen action.
 * Increments one count and decrements another.
 * @param {string} charToIncrement - The character ('A', 'B', 'C') whose count should increase.
 * @param {string} charToDecrement - The character ('A', 'B', 'C') whose count should decrease.
 * @returns {string} The character that was incremented, representing the chosen action.
 */
const applyCountChange = (charToIncrement, charToDecrement) => {
    switch (charToIncrement) {
        case 'A': alphaCount++; break;
        case 'B': betaCount++; break;
        case 'C': gammaCount++; break;
    }
    switch (charToDecrement) {
        case 'A': alphaCount--; break;
        case 'B': betaCount--; break;
        case 'C': gammaCount--; break;
    }
    return charToIncrement;
};

/**
 * Helper function to check if a specific count is currently zero.
 * @param {string} char - The character ('A', 'B', 'C') whose count to check.
 * @returns {boolean} True if the count is zero, false otherwise.
 */
const isCountZero = (char) => {
    switch (char) {
        case 'A': return alphaCount === 0;
        case 'B': return betaCount === 0;
        case 'C': return gammaCount === 0;
        default: return false; // Should not occur with valid inputs.
    }
};

/**
 * Helper function to retrieve the current value of a specific count.
 * @param {string} char - The character ('A', 'B', 'C') whose count to retrieve.
 * @returns {number} The current count value, or -1 if the character is invalid.
 */
const getCountValue = (char) => {
    switch (char) {
        case 'A': return alphaCount;
        case 'B': return betaCount;
        case 'C': return gammaCount;
        default: return -1; // Indicate an error or invalid character.
    }
};

// Process the operation instructions from the first to the second-to-last.
// The last operation is handled separately due to a slightly different decision logic.
for (let currentInstructionIdx = 0; currentInstructionIdx < totalOperationSteps - 1; currentInstructionIdx++) {
    // If an impossible state has already been reached, exit the loop early.
    if (!solutionIsFeasible) {
        break;
    }

    const presentInstruction = instructionSequence[currentInstructionIdx];
    const futureInstruction = instructionSequence[currentInstructionIdx + 1]; // Look-ahead to the next instruction.

    let currentStepAction = ''; // Stores the character chosen for the current step.

    // Logic for 'AB' type operations.
    if (presentInstruction === 'AB') {
        if (isCountZero('A') && isCountZero('B')) {
            solutionIsFeasible = false; // Cannot proceed if both A and B are zero.
        } else if (isCountZero('A')) {
            currentStepAction = applyCountChange('A', 'B'); // Increment A, decrement B.
        } else if (isCountZero('B')) {
            currentStepAction = applyCountChange('B', 'A'); // Increment B, decrement A.
        } else {
            // Both A and B are available. Decision based on the next instruction.
            if (futureInstruction === 'AC' && getCountValue('A') === 1) {
                currentStepAction = applyCountChange('A', 'B'); // Prioritize A if it's 1 and needed next.
            } else if (futureInstruction === 'BC' && getCountValue('B') === 1) {
                currentStepAction = applyCountChange('B', 'A'); // Prioritize B if it's 1 and needed next.
            } else {
                currentStepAction = applyCountChange('A', 'B'); // Default choice: increment A.
            }
        }
    }
    // Logic for 'AC' type operations.
    else if (presentInstruction === 'AC') {
        if (isCountZero('A') && isCountZero('C')) {
            solutionIsFeasible = false;
        } else if (isCountZero('A')) {
            currentStepAction = applyCountChange('A', 'C');
        } else if (isCountZero('C')) {
            currentStepAction = applyCountChange('C', 'A');
        } else {
            if (futureInstruction === 'AB' && getCountValue('A') === 1) {
                currentStepAction = applyCountChange('A', 'C');
            } else if (futureInstruction === 'BC' && getCountValue('C') === 1) {
                currentStepAction = applyCountChange('C', 'A');
            } else {
                currentStepAction = applyCountChange('A', 'C');
            }
        }
    }
    // Logic for 'BC' type operations.
    else if (presentInstruction === 'BC') {
        if (isCountZero('B') && isCountZero('C')) {
            solutionIsFeasible = false;
        } else if (isCountZero('B')) {
            currentStepAction = applyCountChange('B', 'C');
        } else if (isCountZero('C')) {
            currentStepAction = applyCountChange('C', 'B');
        } else {
            if (futureInstruction === 'AB' && getCountValue('B') === 1) {
                currentStepAction = applyCountChange('B', 'C');
            } else if (futureInstruction === 'AC' && getCountValue('C') === 1) {
                currentStepAction = applyCountChange('C', 'B');
            } else {
                currentStepAction = applyCountChange('B', 'C');
            }
        }
    }

    // If the sequence is still possible, record the chosen action for this step.
    if (solutionIsFeasible) {
        chosenActionPath.push(currentStepAction);
    }
}

// After the loop, handle the very last operation instruction.
// This block only executes if the solution is still feasible and there was at least one operation.
if (solutionIsFeasible && totalOperationSteps > 0) {
    const finalInstruction = instructionSequence[totalOperationSteps - 1];
    let finalStepAction = '';

    // The decision logic for the final step is simpler, as there's no 'next' instruction to consider.
    if (finalInstruction === 'AB') {
        if (alphaCount < betaCount) {
            finalStepAction = 'A'; // If A is smaller, choose A.
        } else if (alphaCount === betaCount && alphaCount === 0) {
            solutionIsFeasible = false; // If both are zero, it's impossible.
        } else {
            finalStepAction = 'B'; // Otherwise (B is smaller or equal and non-zero), choose B.
        }
    } else if (finalInstruction === 'BC') {
        if (gammaCount < betaCount) {
            finalStepAction = 'C'; // If C is smaller, choose C.
        } else if (gammaCount === betaCount && gammaCount === 0) {
            solutionIsFeasible = false;
        } else {
            finalStepAction = 'B'; // Otherwise, choose B.
        }
    } else if (finalInstruction === 'AC') {
        if (gammaCount < alphaCount) {
            finalStepAction = 'C'; // If C is smaller, choose C.
        } else if (gammaCount === alphaCount && gammaCount === 0) {
            solutionIsFeasible = false;
        } else {
            finalStepAction = 'A'; // Otherwise, choose A.
        }
    }

    // Record the final action if the solution remains feasible.
    if (solutionIsFeasible) {
        chosenActionPath.push(finalStepAction);
    }
} else if (totalOperationSteps === 0) {
    // If there are no operations (N=0), and the initial counts are non-negative,
    // the problem is considered solved successfully with no actions.
    // The original code would imply 'Yes' here with an empty output.
    // No specific action is pushed, so 'Yes' will be printed followed by nothing.
}


// Output the final determination and the sequence of actions.
if (!solutionIsFeasible) {
    console.log('No'); // If any step made the sequence impossible.
} else {
    console.log('Yes'); // If a feasible sequence of actions was found.
    // Print each recorded action on a new line.
    chosenActionPath.forEach(actionChar => console.log(actionChar));
}