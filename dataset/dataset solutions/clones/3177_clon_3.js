"use strict";

// Define boundary constants for locations outside the valid range.
// These large values ensure paths involving non-existent shrines/temples are disfavored,
// effectively making those paths infinitely long when calculating the minimum.
const VERY_LOW_SHRINE_LOC = -1.0E14; // A very small number representing a shrine location far to the left.
const VERY_HIGH_SHRINE_LOC = 1.0E14;  // A very large number representing a shrine location far to the right.
const VERY_LOW_TEMPLE_LOC = -1.0E15; // A very small number representing a temple location far to the left.
const VERY_HIGH_TEMPLE_LOC = 1.0E15; // A very large number representing a temple location far to the right.

/**
 * Provides a convenient alias for Math.abs, demonstrating a simple helper variable.
 * @param {number} val - The number to get the absolute value of.
 * @returns {number} The absolute value.
 */
const retrieveAbsoluteValue = Math.abs;

/**
 * Determines the minimum travel distance for a given query point.
 * The path involves visiting one structure (shrine or temple) and then the other.
 * It considers all 8 possible combinations:
 * (Query -> Nearest Shrine -> Nearest Temple)
 * (Query -> Nearest Shrine -> Farthest Temple)
 * (Query -> Farthest Shrine -> Nearest Temple)
 * (Query -> Farthest Shrine -> Farthest Temple)
 * and similarly for starting at a Temple first.
 *
 * @param {number} currentQueryPoint - The location of the query.
 * @param {number} prevShrineLoc - Location of the shrine just before or at the query point.
 * @param {number} nextShrineLoc - Location of the shrine just after or at the query point.
 * @param {number} prevTempleLoc - Location of the temple just before or at the query point.
 * @param {number} nextTempleLoc - Location of the temple just after or at the query point.
 * @returns {number} The minimum total distance found among all valid paths.
 */
function calculateOptimalJourneyLength(currentQueryPoint, prevShrineLoc, nextShrineLoc, prevTempleLoc, nextTempleLoc) {
    const potentialJourneyDistances = [];

    // Evaluate paths that start by going to a shrine
    // Path 1: Query -> Next Shrine -> Next Temple
    potentialJourneyDistances.push(retrieveAbsoluteValue(nextShrineLoc - currentQueryPoint) + retrieveAbsoluteValue(nextTempleLoc - nextShrineLoc));
    // Path 2: Query -> Next Shrine -> Previous Temple
    potentialJourneyDistances.push(retrieveAbsoluteValue(nextShrineLoc - currentQueryPoint) + retrieveAbsoluteValue(prevTempleLoc - nextShrineLoc));
    // Path 3: Query -> Previous Shrine -> Next Temple
    potentialJourneyDistances.push(retrieveAbsoluteValue(prevShrineLoc - currentQueryPoint) + retrieveAbsoluteValue(nextTempleLoc - prevShrineLoc));
    // Path 4: Query -> Previous Shrine -> Previous Temple
    potentialJourneyDistances.push(retrieveAbsoluteValue(prevShrineLoc - currentQueryPoint) + retrieveAbsoluteValue(prevTempleLoc - prevShrineLoc));

    // Evaluate paths that start by going to a temple
    // Path 5: Query -> Next Temple -> Next Shrine
    potentialJourneyDistances.push(retrieveAbsoluteValue(nextTempleLoc - currentQueryPoint) + retrieveAbsoluteValue(nextShrineLoc - nextTempleLoc));
    // Path 6: Query -> Next Temple -> Previous Shrine
    potentialJourneyDistances.push(retrieveAbsoluteValue(nextTempleLoc - currentQueryPoint) + retrieveAbsoluteValue(prevShrineLoc - nextTempleLoc));
    // Path 7: Query -> Previous Temple -> Next Shrine
    potentialJourneyDistances.push(retrieveAbsoluteValue(prevTempleLoc - currentQueryPoint) + retrieveAbsoluteValue(nextShrineLoc - prevTempleLoc));
    // Path 8: Query -> Previous Temple -> Previous Shrine
    potentialJourneyDistances.push(retrieveAbsoluteValue(prevTempleLoc - currentQueryPoint) + retrieveAbsoluteValue(prevShrineLoc - prevTempleLoc));

    // Math.min will automatically select the smallest value. Paths involving
    // the very large/small boundary constants will yield extremely large sums,
    // effectively disqualifying them unless no valid path exists.
    return Math.min(...potentialJourneyDistances);
}

/**
 * Sorts an array of numerical values while retaining their original indices.
 * This function implements an insertion sort strategy, but uses binary search
 * to efficiently locate the correct insertion position for each element.
 *
 * @param {number[]} arrayOfValues - The input array of numbers to be sorted.
 * @returns {Array<[number, number]>} An array where each element is a pair `[value, originalIndex]`,
 *                                     sorted in ascending order based on `value`.
 */
function organizeAndMapOriginalIndices(arrayOfValues) {
    const collectionSize = arrayOfValues.length;
    // Initialize the result array with the first element and its original index.
    const sortedValueIndexPairs = [[arrayOfValues[0], 0]];

    // Iterate through the remaining elements, inserting each into its sorted position.
    for (let currentElementIndex = 1; currentElementIndex < collectionSize; currentElementIndex++) {
        const valueToInsert = arrayOfValues[currentElementIndex];
        let searchUpperBound = sortedValueIndexPairs.length - 1;
        let searchLowerBound = 0;
        let insertPosition = 0; // Default to 0 if value is smaller than all existing.

        // Perform a binary search to find the precise insertion point.
        while (searchLowerBound <= searchUpperBound) {
            const searchMidPoint = Math.floor((searchLowerBound + searchUpperBound) / 2);
            if (sortedValueIndexPairs[searchMidPoint][0] < valueToInsert) {
                searchLowerBound = searchMidPoint + 1;
            } else {
                searchUpperBound = searchMidPoint - 1;
            }
        }
        // After the binary search, 'searchLowerBound' indicates the correct index for insertion.
        insertPosition = searchLowerBound;

        // Insert the current value along with its original index into the sorted array.
        sortedValueIndexPairs.splice(insertPosition, 0, [valueToInsert, currentElementIndex]);
    }
    return sortedValueIndexPairs;
}

/**
 * The main function to process the input, calculate the minimum travel distances for queries,
 * and output the results. This serves as the primary entry point for the problem solution.
 *
 * @param {string} rawInputString - A string containing all problem data, typically read from stdin.
 */
function ProcessInputData(rawInputString) {
    // Parse the raw input string into an array of numbers.
    // Splitting by whitespace, filtering out any empty strings, and then converting to numbers.
    const parsedNumericData = rawInputString
        .split(/\s+/)
        .filter(element => element !== '') // Ensure no empty strings are converted to 0
        .map(Number);

    // Extract the initial problem parameters: counts of shrines, temples, and queries.
    const numberOfShrines = parsedNumericData.shift();
    const numberOfTemples = parsedNumericData.shift();
    const numberOfQueries = parsedNumericData.shift();

    // Implement a guard clause for edge case: no queries to process.
    if (numberOfQueries === 0) {
        console.log('\n'); // Output an empty line as expected in some competitive programming scenarios.
        return;
    }

    // Distribute the remaining numerical data into their respective arrays.
    // Using `splice` is an efficient way to extract segments from the array.
    const shrineCoordinates = parsedNumericData.splice(0, numberOfShrines);
    const templeCoordinates = parsedNumericData.splice(0, numberOfTemples);
    const queryCoordinatePoints = parsedNumericData; // The rest are query points

    // Sort the query points while preserving their original order.
    // This allows for efficient processing using two pointers, but results can be mapped back.
    const sortedQueriesWithOriginalIndices = organizeAndMapOriginalIndices(queryCoordinatePoints);

    // Prepare arrays to store the immediate neighboring shrine/temple locations for each query.
    // These arrays are sized according to the number of queries.
    const previousShrineLocations = new Array(numberOfQueries);
    const nextShrineLocations = new Array(numberOfQueries);
    const previousTempleLocations = new Array(numberOfQueries);
    const nextTempleLocations = new Array(numberOfQueries);

    // Initialize pointers for scanning shrine and temple coordinate arrays.
    // These pointers will only move forward because queries are processed in sorted order.
    let shrineScanCursor = 0;
    let templeScanCursor = 0;

    // Iterate through the sorted queries to pre-determine their nearest shrine and temple neighbors.
    for (let currentQIndex = 0; currentQIndex < numberOfQueries; currentQIndex++) {
        const currentQueryValue = sortedQueriesWithOriginalIndices[currentQIndex][0];

        // Advance the shrine cursor until it points to a shrine location greater than or equal to the current query.
        while (shrineScanCursor < shrineCoordinates.length && shrineCoordinates[shrineScanCursor] < currentQueryValue) {
            shrineScanCursor++;
        }
        // Store the shrine location immediately preceding the query (or the smallest if query is before all).
        previousShrineLocations[currentQIndex] = (shrineScanCursor > 0 ? shrineCoordinates[shrineScanCursor - 1] : VERY_LOW_SHRINE_LOC);
        // Store the shrine location immediately following the query (or the largest if query is after all).
        nextShrineLocations[currentQIndex] = (shrineScanCursor < shrineCoordinates.length ? shrineCoordinates[shrineScanCursor] : VERY_HIGH_SHRINE_LOC);

        // Perform similar logic for temple locations.
        while (templeScanCursor < templeCoordinates.length && templeCoordinates[templeScanCursor] < currentQueryValue) {
            templeScanCursor++;
        }
        previousTempleLocations[currentQIndex] = (templeScanCursor > 0 ? templeCoordinates[templeScanCursor - 1] : VERY_LOW_TEMPLE_LOC);
        nextTempleLocations[currentQIndex] = (templeScanCursor < templeCoordinates.length ? templeCoordinates[templeScanCursor] : VERY_HIGH_TEMPLE_LOC);
    }

    // Initialize an array to hold the final results, indexed by the original query order.
    const computedFinalDistances = new Array(numberOfQueries);

    // Calculate the optimal journey length for each query.
    for (let currentQIndex = 0; currentQIndex < numberOfQueries; currentQIndex++) {
        const originalQueryReference = sortedQueriesWithOriginalIndices[currentQIndex][1];
        const queryPointValue = sortedQueriesWithOriginalIndices[currentQIndex][0];

        // Retrieve the pre-calculated neighboring locations for the current query.
        const previousShrine = previousShrineLocations[currentQIndex];
        const nextShrine = nextShrineLocations[currentQIndex];
        const previousTemple = previousTempleLocations[currentQIndex];
        const nextTemple = nextTempleLocations[currentQIndex];

        // Utilize the helper function to determine the shortest path.
        const shortestCalculatedDistance = calculateOptimalJourneyLength(
            queryPointValue,
            previousShrine,
            nextShrine,
            previousTemple,
            nextTemple
        );
        // Store the result (converted to a string) at its original query index.
        computedFinalDistances[originalQueryReference] = shortestCalculatedDistance.toString();
    }

    // Output the results, with each distance on a new line, followed by a final newline.
    console.log(computedFinalDistances.join("\n") + '\n');
}

// Entry point: Read the entire standard input content and pass it to the main processing function.
ProcessInputData(require('fs').readFileSync("/dev/stdin", "utf8"));