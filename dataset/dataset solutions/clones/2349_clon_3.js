/**
 * This module processes raw input data describing a set of individuals and their testimonies about each other.
 * It aims to calculate a specific metric based on contradictions and mutual distrust among individuals.
 */

/**
 * Safely converts a string to a numeric value.
 * If the conversion fails, it logs a warning and returns 0, ensuring robustness.
 * @param {string} stringValue - The string to convert.
 * @returns {number} The numeric value, or 0 if parsing fails.
 */
const convertToNumberSafely = (stringValue) => {
    const numericalResult = Number(stringValue);
    if (isNaN(numericalResult)) {
        // In a production scenario, one might throw an error or handle this more rigorously.
        console.warn(`Warning: Input "${stringValue}" could not be parsed as a number. Defaulting to 0.`);
        return 0;
    }
    return numericalResult;
};

/**
 * Orchestrates the entire data processing workflow: parsing input, structuring data,
 * performing calculations, and outputting the final result.
 * @param {string} rawInputContent - The complete raw input string from the data source.
 */
const processTestimonyData = (rawInputContent) => {
    // Split the entire input content into an array of individual lines.
    const dataLines = rawInputContent.trim().split('\n');

    // Implement a basic guard clause for empty input.
    if (dataLines.length === 0) {
        console.error("Error: The provided input data is empty. Cannot proceed.");
        return;
    }

    // The first line always contains the total number of individuals involved.
    const totalIndividuals = convertToNumberSafely(dataLines.shift());

    // Initialize an array to hold detailed profiles for each individual.
    // Each profile tracks received testimonies and who they declared dishonest/who declared them dishonest.
    const individualProfiles = Array.from({ length: totalIndividuals }, (_, individualId) => ({
        // Using 0-indexed IDs internally for array access
        id: individualId,
        // Counters for the types of testimonies received by this individual
        positiveTestimoniesReceived: 0, // Count of times someone said this individual is honest (1)
        negativeTestimoniesReceived: 0, // Count of times someone said this individual is dishonest (0)
        // Lists of individuals involved in specific declarations
        individualsDeclaredDishonestByMe: [], // IDs of people this individual declared dishonest
        individualsWhoDeclaredMeDishonest: [] // IDs of people who declared this individual dishonest
    }));

    // This data structure will store all statements made by each individual.
    // statementsMadeByIndex[i] will contain an array of strings, where each string
    // represents a statement made by the individual with internal ID 'i'.
    const statementsMadeByIndex = [];
    let currentInputLinePointer = 0; // Pointer to navigate through the 'dataLines' array

    // Loop through the input lines to extract all statements made by each individual.
    // The original code's loop structure (modifying 'i' inside the loop) is refactored
    // into a more conventional 'while' loop with an explicit pointer.
    for (let individualIdx = 0; individualIdx < totalIndividuals; individualIdx++) {
        // Ensure there are enough lines remaining for the current individual's statement count.
        if (currentInputLinePointer >= dataLines.length) {
            console.warn(`Warning: Expected statements for individual ${individualIdx}, but ran out of input lines.`);
            statementsMadeByIndex.push([]); // Add an empty array for missing statements
            continue;
        }

        const numberOfStatementsByCurrentIndividual = convertToNumberSafely(dataLines[currentInputLinePointer]);
        const currentIndividualStatements = [];

        // Validate the number of statements declared.
        if (numberOfStatementsByCurrentIndividual < 0 ||
            numberOfStatementsByCurrentIndividual > (dataLines.length - currentInputLinePointer - 1)) {
            console.warn(`Warning: Invalid number of statements (${numberOfStatementsByCurrentIndividual}) declared by individual ${individualIdx}. Skipping their statements.`);
            currentInputLinePointer++; // Move past the invalid count line
            statementsMadeByIndex.push([]);
            continue;
        }

        // Collect all statements made by the current individual.
        for (let statementOffset = 1; statementOffset <= numberOfStatementsByCurrentIndividual; statementOffset++) {
            const statementLine = dataLines[currentInputLinePointer + statementOffset];
            if (statementLine) {
                currentIndividualStatements.push(statementLine);
            } else {
                console.warn(`Warning: Missing statement line for individual ${individualIdx} at expected line ${currentInputLinePointer + statementOffset}.`);
            }
        }
        statementsMadeByIndex.push(currentIndividualStatements);

        // Advance the pointer past the current individual's statement count line and all their statements.
        currentInputLinePointer += numberOfStatementsByCurrentIndividual + 1;
    }

    // Now, iterate through all collected statements and update the individual profiles.
    // The outer loop represents the individual making the statement.
    for (let statementOriginatorId = 0; statementOriginatorId < statementsMadeByIndex.length; statementOriginatorId++) {
        const originatorStatements = statementsMadeByIndex[statementOriginatorId];

        // The inner loop processes each specific statement made by the current originator.
        for (const singleStatementText of originatorStatements) {
            const statementParts = singleStatementText.split(" ");
            // Validate the format of each statement.
            if (statementParts.length !== 2) {
                console.warn(`Warning: Malformed statement "${singleStatementText}". Expected two parts (target ID and truth value). Skipping.`);
                continue;
            }

            const targetedIndividualId = convertToNumberSafely(statementParts[0]); // The 1-indexed ID of the person being talked about
            const testimonyTruthValue = convertToNumberSafely(statementParts[1]); // 0 for dishonest, 1 for honest

            // Convert the 1-indexed target ID to a 0-indexed internal ID.
            const targetedIndividualInternalIndex = targetedIndividualId - 1;

            // Validate that the targeted individual ID is within the expected range.
            if (targetedIndividualInternalIndex < 0 || targetedIndividualInternalIndex >= totalIndividuals) {
                console.warn(`Warning: Statement targets an invalid individual ID (${targetedIndividualId}). Skipping statement: "${singleStatementText}".`);
                continue;
            }

            // Update the profile of the individual who is the subject of the testimony.
            if (testimonyTruthValue === 0) { // If the testimony declares the target as dishonest
                individualProfiles[targetedIndividualInternalIndex].negativeTestimoniesReceived++;
                individualProfiles[targetedIndividualInternalIndex].individualsWhoDeclaredMeDishonest.push(statementOriginatorId);
                individualProfiles[statementOriginatorId].individualsDeclaredDishonestByMe.push(targetedIndividualInternalIndex);
            } else if (testimonyTruthValue === 1) { // If the testimony declares the target as honest
                individualProfiles[targetedIndividualInternalIndex].positiveTestimoniesReceived++;
            } else {
                console.warn(`Warning: Unexpected testimony truth value (${testimonyTruthValue}). Expected 0 or 1. Statement: "${singleStatementText}".`);
            }
        }
    }

    // --- Final Calculation Phase ---

    let countOfInternallyContradictoryIndividuals = 0;
    let countOfBidirectionalDistrust = 0;

    // Analyze each individual's profile to identify specific conditions.
    for (const currentProfile of individualProfiles) {
        // Condition 1: An individual has received both 'honest' and 'dishonest' testimonies.
        // This suggests a contradiction in how they are perceived by others.
        if (currentProfile.negativeTestimoniesReceived >= 1 && currentProfile.positiveTestimoniesReceived >= 1) {
            countOfInternallyContradictoryIndividuals++;
        }

        // Condition 2: Identify pairs of individuals who mutually declare each other dishonest.
        // E.g., Individual A says B is dishonest, AND Individual B says A is dishonest.
        for (const personDeclaredDishonestByCurrent of currentProfile.individualsDeclaredDishonestByMe) {
            // Check if the person 'personDeclaredDishonestByCurrent' also declared 'currentProfile.id' dishonest.
            if (individualProfiles[personDeclaredDishonestByCurrent].individualsDeclaredDishonestByMe.includes(currentProfile.id)) {
                countOfBidirectionalDistrust++;
            }
        }
    }

    // Each pair of mutual distrust (A -> B, B -> A) is counted twice by the above loop
    // (once when processing A's declarations, once when processing B's declarations).
    // We divide by two to get the count of unique pairs.
    const uniqueBidirectionalDistrustPairs = countOfBidirectionalDistrust / 2;

    // The final result is calculated by subtracting the sum of
    // contradictory individuals and unique mutual distrust pairs from the total number of individuals.
    // This effectively identifies individuals who cannot be definitively classified as "honest"
    // due to these specific types of conflicts.
    const finalCalculatedMetric = totalIndividuals - (countOfInternallyContradictoryIndividuals + uniqueBidirectionalDistrustPairs);

    console.log(finalCalculatedMetric);
};

// Initiate the processing by reading input from standard input.
processTestimonyData(require('fs').readFileSync('/dev/stdin', 'utf8'));