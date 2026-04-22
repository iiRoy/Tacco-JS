// This module processes raw input data to identify and list restaurants
// based on specific sorting criteria: primarily by name (ascending)
// and then by score (descending) if names are identical.

/**
 * Parses a single line of restaurant data into a structured object.
 *
 * @param {string} lineContent - The string content of a single restaurant line (e.g., "RestaurantA 100").
 * @param {number} originalInputIndex - The 1-based index of this line from the original input.
 * @returns {object|null} An object with `id`, `name`, and `score` properties, or null if parsing fails.
 */
const extractRestaurantDetails = (lineContent, originalInputIndex) => {
    // Attempt to split the line into name and score components.
    const parts = lineContent.trim().split(' ');

    // Basic validation: A restaurant entry should have at least a name and a score.
    if (parts.length < 2) {
        // console.warn(`Skipping malformed line: "${lineContent}" at index ${originalInputIndex}`);
        return null; // Return null for invalid lines.
    }

    // The name could be multi-word, so we take the last part as the score
    // and the rest as the name.
    const rawScore = parts[parts.length - 1];
    const restaurantName = parts.slice(0, parts.length - 1).join(' ');

    // Convert the score string to an integer.
    const scoreValue = parseInt(rawScore, 10);

    // Further validation: Ensure the score is a valid number.
    if (isNaN(scoreValue)) {
        // console.warn(`Skipping line with invalid score: "${lineContent}" at index ${originalInputIndex}`);
        return null; // Return null for lines with invalid scores.
    }

    // Return the structured restaurant object.
    return {
        identifier: originalInputIndex, // Using 'identifier' instead of 'id'
        venueName: restaurantName,      // Using 'venueName' instead of 'name'
        ratingScore: scoreValue         // Using 'ratingScore' instead of 'score'
    };
};

/**
 * Compares two restaurant objects primarily by name (ascending)
 * and secondarily by score (descending).
 *
 * @param {object} firstVenue - The first restaurant object.
 * @param {object} secondVenue - The second restaurant object.
 * @returns {number} A negative value if firstVenue comes before secondVenue,
 *                   a positive value if firstVenue comes after secondVenue,
 *                   or zero if they are considered equal for sorting purposes.
 */
const establishSortingOrder = (firstVenue, secondVenue) => {
    // Compare venue names lexicographically.
    // localeCompare provides a robust way to compare strings,
    // especially for different locales, and returns -1, 0, or 1.
    const nameComparison = firstVenue.venueName.localeCompare(secondVenue.venueName);

    // If names are different, return the result of the name comparison.
    if (nameComparison !== 0) {
        return nameComparison;
    }

    // If names are identical, compare scores in descending order.
    // Higher score comes first.
    return secondVenue.ratingScore - firstVenue.ratingScore;
};

/**
 * Main function to process the input string, sort restaurant data,
 * and output the identifiers of the sorted restaurants.
 *
 * @param {string} rawInputString - The complete input string containing restaurant data.
 */
const ProcessRestaurantListings = (rawInputString) => {
    // Split the entire input content into individual lines.
    const dataLines = rawInputString.split('\n');

    // Add a quick check for empty input or only a header line.
    if (dataLines.length <= 1) {
        // console.log("No valid restaurant data provided.");
        return; // Exit if no actual restaurant entries are present.
    }

    // The first line usually contains the count, which is not used for sorting
    // but might be useful for a sanity check or future features.
    // For this implementation, we simply discard it by slicing the array.
    const actualRestaurantEntries = dataLines.slice(1);

    // Parse each raw line into a structured restaurant object.
    // We use a temporary array to store the parsed objects, filtering out any nulls
    // that result from malformed lines during parsing.
    const structuredRestaurantData = [];
    for (let i = 0; i < actualRestaurantEntries.length; i++) {
        const currentEntry = actualRestaurantEntries[i];
        // The original problem uses 1-based indexing for output.
        const parsedObject = extractRestaurantDetails(currentEntry, i + 1);
        if (parsedObject) {
            structuredRestaurantData.push(parsedObject);
        }
    }

    // Sort the structured data using the custom comparison function.
    // This will arrange restaurants by name (A-Z) then by score (high to low).
    structuredRestaurantData.sort(establishSortingOrder);

    // Iterate over the sorted list and print the original identifier for each restaurant.
    // An additional check for venueName existence is included, though `extractRestaurantDetails`
    // already handles this by returning null for empty names. This acts as a final safeguard.
    for (const restaurantRecord of structuredRestaurantData) {
        if (restaurantRecord.venueName && restaurantRecord.venueName.trim() !== '') {
            console.log(restaurantRecord.identifier);
        } else {
            // This case should ideally not be reached if extractRestaurantDetails is robust,
            // but it's a defensive check.
            // console.warn(`Skipping output for restaurant with missing name: ID ${restaurantRecord.identifier}`);
        }
    }
};

// --- Execution Entry Point ---
// Reads input from standard in and passes it to the main processing function.
try {
    const fileSystem = require("fs");
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    ProcessRestaurantListings(standardInputContent);
} catch (error) {
    // Basic error handling for file reading or initial processing.
    // console.error("An error occurred during input processing:", error);
    // Optionally, exit with a non-zero status code.
    // process.exit(1);
}