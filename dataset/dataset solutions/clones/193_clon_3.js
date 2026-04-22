const fileSystemOperations = require('fs');

const standardInputSourcePath = '/dev/stdin';

// This array defines the upper weight limits for each boxing category and their corresponding names.
// It replaces the original 'k' array and the series of 'if' statements, making the classification logic
// more data-driven and extensible. Categories are ordered by ascending weight.
const officialBoxingWeightClasses = [
    { maximumWeightKg: 48, categoryName: "light fly" },
    { maximumWeightKg: 51, categoryName: "fly" },
    { maximumWeightKg: 54, categoryName: "bantam" },
    { maximumWeightKg: 57, categoryName: "feather" },
    { maximumWeightKg: 60, categoryName: "light" },
    { maximumWeightKg: 64, categoryName: "light welter" },
    { maximumWeightKg: 69, categoryName: "welter" },
    { maximumWeightKg: 75, categoryName: "light middle" },
    { maximumWeightKg: 81, categoryName: "middle" },
    { maximumWeightKg: 91, categoryName: "light heavy" },
    { maximumWeightKg: Infinity, categoryName: "heavy" } // Catches any weight exceeding the previous boundaries
];

/**
 * Retrieves and processes raw numerical input from a specified file path.
 * This function handles file reading, string trimming, splitting by lines,
 * and converting each line into an integer, while also validating for non-numeric entries.
 *
 * @param {string} pathToFile - The absolute path to the input file (e.g., '/dev/stdin').
 * @returns {number[]} An array containing only valid parsed integer weights.
 */
function obtainAndParseWeightInputs(pathToFile) {
    let rawTextualData;
    try {
        // Attempt to read the entire file content synchronously using UTF-8 encoding.
        rawTextualData = fileSystemOperations.readFileSync(pathToFile, 'utf8');
    } catch (ioError) {
        // Log an error if file reading fails and return an empty array to prevent further processing.
        console.error("Error encountered while reading input data:", ioError.message);
        return [];
    }

    // Perform a series of transformations on the raw input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of lines based on newline characters.
    // 3. Filter out any empty lines that might result from splitting or initial trimming.
    // 4. Map each non-empty line to an integer, explicitly specifying radix 10.
    // 5. Validate if the parsed value is a number; if not, log a warning and return null.
    // 6. Filter out any null values resulting from failed parsing.
    const validatedNumericalWeights = rawTextualData
        .trim()
        .split('\n')
        .filter(lineContent => lineContent.length > 0)
        .map(stringRepresentation => {
            const numericalValue = parseInt(stringRepresentation, 10);
            if (isNaN(numericalValue)) {
                console.warn(`Skipping invalid non-numeric input: '${stringRepresentation}'.`);
                return null; // Mark as null for subsequent filtering
            }
            return numericalValue;
        })
        .filter(value => value !== null); // Remove any entries that failed parsing

    return validatedNumericalWeights;
}

/**
 * Classifies a given weight into its corresponding boxing category based on predefined rules.
 * This function iterates through a structured list of categories to find the appropriate match.
 *
 * @param {number} candidateWeightKg - The weight in kilograms to be classified.
 * @returns {string} The name of the determined boxing category, or an error message if the weight is invalid.
 */
function classifyWeightToBoxingCategory(candidateWeightKg) {
    // Implement a guard clause for invalid or non-positive weight inputs.
    if (typeof candidateWeightKg !== 'number' || isNaN(candidateWeightKg) || candidateWeightKg <= 0) {
        console.error(`Attempted to classify an invalid weight: ${candidateWeightKg}. Returning default.`);
        return "Invalid Weight Entry";
    }

    // Iterate through the ordered list of weight classes.
    // The first category whose `maximumWeightKg` is greater than or equal to the `candidateWeightKg` is the correct one.
    for (const categoryDefinition of officialBoxingWeightClasses) {
        if (candidateWeightKg <= categoryDefinition.maximumWeightKg) {
            return categoryDefinition.categoryName;
        }
    }

    // This return statement should ideally never be reached due to the `Infinity` category,
    // but serves as a robust fallback.
    return "Uncategorized Weight";
}

// --- Main Program Execution Flow ---

// 1. Obtain and parse all numerical weight values from the standard input.
const athleteWeightMeasurements = obtainAndParseWeightInputs(standardInputSourcePath);

// 2. Check if any valid weights were processed.
if (athleteWeightMeasurements.length === 0) {
    console.log("No valid weight measurements were found for classification.");
} else {
    // 3. Iterate over each valid weight and determine its boxing category.
    athleteWeightMeasurements.forEach(currentAthleteWeight => {
        const determinedCategoryLabel = classifyWeightToBoxingCategory(currentAthleteWeight);
        // 4. Output the determined category label for the current weight.
        console.log(determinedCategoryLabel);
    });
}