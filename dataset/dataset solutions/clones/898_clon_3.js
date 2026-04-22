const fileSystemModule = require('fs'); // Import the core Node.js file system module.

// Define application-specific constants to enhance code clarity and maintainability.
const NORTH_INITIAL_ANGLE_VALUE = 0;
const WEST_INITIAL_ANGLE_VALUE = 90;
const BASE_ANGLE_INCREMENT_DEGREES = 90;
const POWER_CALCULATION_BASE = 2;
const SEQUENCE_TERMINATOR_SYMBOL = "#";
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

/**
 * Safely retrieves content from a specified file path.
 * Includes basic error handling for file operations.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
 */
const retrieveFileContent = (filePath) => {
    try {
        // Attempt to synchronously read the entire file.
        return fileSystemModule.readFileSync(filePath, 'utf8');
    } catch (operationError) {
        // Log any errors encountered during file reading.
        console.error("Failed to read input file:", operationError.message);
        // Return an empty string to allow the program to continue without crashing.
        return "";
    }
};

// Obtain the raw input data from the standard input file.
let rawStreamData = retrieveFileContent(STANDARD_INPUT_FILE_PATH);

// Pre-process the raw input: remove leading/trailing whitespace, then split into an array of lines.
// The filter(Boolean) step removes any empty strings that might result from splitting (e.g., if input ends with a newline).
let processedInputLines = rawStreamData.trim().split("\n").filter(Boolean);

// Initiate the primary processing cycle for each input line.
// This loop will continue indefinitely until an explicit break condition is met.
while (true) {
    // Implement a guard clause to exit if there are no more lines to process.
    if (processedInputLines.length === 0) {
        break; // All input lines have been consumed.
    }

    // Extract the next line from the beginning of the array.
    const currentInputSequence = processedInputLines.shift();

    // Check for the designated termination signal or an undefined sequence (should not happen with the length check).
    if (currentInputSequence === undefined || currentInputSequence === SEQUENCE_TERMINATOR_SYMBOL) {
        break; // Termination signal received or unexpected empty sequence.
    }

    // Clean the current sequence by removing specific directional suffixes ("orth" and "est").
    // This simplifies the sequence to just 'n' and 'w' characters.
    let cleanedSequence = currentInputSequence.replace(/orth/g, '').replace(/est/g, '');

    // Perform initial validation on the cleaned sequence.
    // Skip to the next line if the sequence is empty or its first character is not a valid direction.
    if (!cleanedSequence || !['n', 'w'].includes(cleanedSequence[0])) {
        console.warn(`Skipping invalid or malformed sequence: "${currentInputSequence}"`);
        continue; // Proceed to the next input line.
    }

    let calculatedAngleDegrees = 0; // Accumulator for the final angle.
    const initialDirectionCharacter = cleanedSequence[0]; // First character determines the starting angle.

    // Assign the initial angle based on the first character.
    // Using a switch statement for clear conditional assignment.
    switch (initialDirectionCharacter) {
        case 'n':
            calculatedAngleDegrees = NORTH_INITIAL_ANGLE_VALUE;
            break;
        case 'w':
            calculatedAngleDegrees = WEST_INITIAL_ANGLE_VALUE;
            break;
        default:
            // This case should theoretically be caught by the earlier validation, but serves as a robust fallback.
            console.error(`Unrecognized initial direction character '${initialDirectionCharacter}' in sequence: "${cleanedSequence}"`);
            continue; // Skip this problematic sequence.
    }

    let lastDirectionEncountered = initialDirectionCharacter; // Keeps track of the previous direction.
    let consecutiveDirectionCount = 1; // Counts consecutive occurrences of the same direction.

    // Iterate through the remaining characters of the cleaned sequence, starting from the second character.
    for (let charIndex = 1; charIndex < cleanedSequence.length; charIndex++) {
        const currentDirectionCharacter = cleanedSequence[charIndex];

        // Validate each character to ensure it's a recognized direction.
        if (!['n', 'w'].includes(currentDirectionCharacter)) {
            console.warn(`Ignoring unexpected character '${currentDirectionCharacter}' in sequence: "${cleanedSequence}" at index ${charIndex}.`);
            continue; // Skip to the next character in the sequence.
        }

        // Calculate the magnitude of the angle adjustment for this step.
        // Utilizing the ES6 exponentiation operator for clarity.
        const currentAngleAdjustment = BASE_ANGLE_INCREMENT_DEGREES / (POWER_CALCULATION_BASE ** consecutiveDirectionCount);

        // Apply angle adjustments based on direction changes.
        if (currentDirectionCharacter === 'n' && lastDirectionEncountered !== 'n') {
            calculatedAngleDegrees -= currentAngleAdjustment;
        } else if (currentDirectionCharacter === 'w' && lastDirectionEncountered !== 'w') {
            calculatedAngleDegrees += currentAngleAdjustment;
        }
        // If the direction is the same as the last, no immediate angle change happens from this character,
        // but the consecutive count will be updated.

        // Update the consecutive count and the last encountered direction for the next iteration.
        if (lastDirectionEncountered === currentDirectionCharacter) {
            consecutiveDirectionCount++;
        } else {
            consecutiveDirectionCount = 1; // Reset count as the direction has changed.
            lastDirectionEncountered = currentDirectionCharacter; // Update the last direction.
        }
    }

    // --- Final Angle Representation and Output ---
    let outputRepresentation = calculatedAngleDegrees; // Default to the raw calculated float.
    let fractionDenominatorSeeker = 1; // Start searching for a denominator from 1.

    // Loop to find the smallest integer denominator (if any) to express the angle as a simplified fraction.
    // This continues until an integer product is found or a safeguard limit is reached.
    while (true) {
        const productForIntegerCheck = calculatedAngleDegrees * fractionDenominatorSeeker;
        // Determine if the product is a whole number (integer).
        const isProductInteger = (productForIntegerCheck % 1 === 0);

        if (isProductInteger) {
            // If the denominator seeker is 1, the angle was already an integer.
            if (fractionDenominatorSeeker === 1) {
                // No fractional representation needed, break directly.
                // outputRepresentation already holds the integer value.
                break;
            } else {
                // An integer product was found with a denominator > 1, so format as a fraction.
                outputRepresentation = `${productForIntegerCheck}/${fractionDenominatorSeeker}`;
                break; // Fraction successfully created, exit loop.
            }
        }

        fractionDenominatorSeeker++; // Increment to check the next potential denominator.

        // Add a safeguard against potential infinite loops for extremely complex floating points,
        // though for this specific problem's calculations, a solution should typically be found.
        if (fractionDenominatorSeeker > 1000000) { // Arbitrary large limit for denominator.
            console.warn(`Fraction simplification limit reached for angle ${calculatedAngleDegrees}. Outputting raw float.`);
            break; // Exit to prevent an endless loop.
        }
    }

    // Print the final, formatted angle to the console.
    console.log(outputRepresentation);
}