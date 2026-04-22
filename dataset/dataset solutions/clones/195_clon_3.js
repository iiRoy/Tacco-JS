const DATA_SOURCE_FILE = '/dev/stdin'; // Defines the standard input source for weight measurements.

// Core module for file system operations, used to retrieve raw data.
const fileSystemModule = require('fs');

// Reads the entire content from the specified input file synchronously.
// The content is expected to be UTF-8 encoded.
const rawInputContent = fileSystemModule.readFileSync(DATA_SOURCE_FILE, 'utf8');

// Processes the raw input:
// 1. Splits the string into an array of individual lines based on newline characters.
// 2. Maps over each line to remove leading/trailing whitespace.
// 3. Filters out any lines that are empty after trimming, ensuring only valid entries are processed.
const individualWeightStrings = rawInputContent.split('\n').map(str => str.trim()).filter(str => str.length > 0);

/**
 * Defines the various boxing weight classes and their respective upper weight limits.
 * The order is crucial as it's processed sequentially to determine the correct class.
 * Weights are in kilograms.
 */
const predefinedBoxingCategories = [
    { threshold: 48, label: 'light fly' },
    { threshold: 51, label: 'fly' },
    { threshold: 54, label: 'bantam' },
    { threshold: 57, label: 'feather' },
    { threshold: 60, label: 'light' },
    { threshold: 64, label: 'light welter' },
    { threshold: 69, label: 'welter' },
    { threshold: 75, label: 'light middle' },
    { threshold: 81, label: 'middle' },
    { threshold: 91, label: 'light heavy' }
    // Any weight exceeding the highest defined threshold (91 kg) will fall into the 'heavy' category.
];

// Iterates through each processed weight string obtained from the input.
for (const currentWeightInput of individualWeightStrings) {

    // Converts the string representation of weight into a floating-point number.
    // Using parseFloat allows for decimal weights, although the original code used unary plus for integer conversion.
    let athleteKilograms = parseFloat(currentWeightInput);

    // --- Input Validation Guard Clause ---
    // Checks if the parsed weight is not a valid number (NaN) or if it's a negative value.
    // Invalid entries are skipped, preventing errors and ensuring robust processing.
    if (isNaN(athleteKilograms) || athleteKilograms < 0) {
        // In a production scenario, one might log this error or output a specific message.
        // For this task, we simply move to the next valid entry.
        continue;
    }

    // Initializes the determined category to 'heavy' as a default.
    // This aligns with the original 'else' condition for weights above 91 kg.
    let assignedWeightClass = 'heavy';

    // Iterates through the predefined boxing categories to find the appropriate class for the athlete.
    // The loop breaks as soon as the first matching category (based on upper limit) is found.
    for (const classDefinition of predefinedBoxingCategories) {
        if (athleteKilograms <= classDefinition.threshold) {
            assignedWeightClass = classDefinition.label;
            break; // Found the category, no need to check further classes.
        }
    }

    // Outputs the final determined weight class to the console.
    console.log(assignedWeightClass);
}