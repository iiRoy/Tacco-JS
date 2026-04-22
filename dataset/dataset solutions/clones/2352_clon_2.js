function ProcessInput(rawData) {
    const textRows = rawData.split('\n');
    const numIndividuals = +textRows[0];
    const remainingData = textRows.slice(1);

    const assertionsList = [];
    let currentPersonAssertionsCount;
    let individualAssertions;
    let outerIndex, innerCounter, truthfulnessPattern;

    // Loop through the input to parse each person's statements
    for (outerIndex = 0; outerIndex < remainingData.length; outerIndex++) {
        currentPersonAssertionsCount = parseInt(remainingData[outerIndex], 10);
        individualAssertions = [];

        // Collect all statements for the current person
        for (innerCounter = 1; innerCounter <= currentPersonAssertionsCount; innerCounter++) {
            individualAssertions.push(
                remainingData[outerIndex + innerCounter].split(' ').map(parseInt)
            );
        }
        assertionsList.push(individualAssertions);
        outerIndex += currentPersonAssertionsCount;
    }

    let maxTruthfulCount = 0;
    let currentTruthfulPersons;

    // Iterate through all possible combinations of truthful/untruthful people using bitmasking
    for (truthfulnessPattern = Math.pow(2, numIndividuals) - 1; truthfulnessPattern >= 0; truthfulnessPattern--) {
        currentTruthfulPersons = calculateSetBits(truthfulnessPattern);

        // If the current count of truthful people is not better than the best found so far, skip
        if (currentTruthfulPersons <= maxTruthfulCount) {
            continue;
        }

        // Check for consistency across all assertions with the current truthfulness pattern
        if (assertionsList.every((personAssertion, personIdx) => {
            // Determine if the current person (personIdx) is considered truthful in this pattern
            const isPersonTruthful = (truthfulnessPattern >> personIdx) & 1;

            // Verify that this person's statements are consistent
            return personAssertion.every((specificAssertion) => {
                const accusedIndividual = specificAssertion[0];
                const accusedTruthfulness = specificAssertion[1];
                
                // Get the truthfulness status of the accused individual from the current pattern
                const accusedTruthStatus = (truthfulnessPattern >> (accusedIndividual - 1)) & 1;

                // If the person making the statement is truthful, their statement must match reality
                // Otherwise, if the person is untruthful, their statement must contradict reality
                return isPersonTruthful
                    ? (accusedTruthfulness === accusedTruthStatus)
                    : (accusedTruthfulness !== accusedTruthStatus);
            });
        })) {
            maxTruthfulCount = currentTruthfulPersons; // Update the maximum truthful count
        }
    }

    // Output the final result
    console.log(maxTruthfulCount);
}

/**
 * Counts the number of '1' bits in a given integer (population count).
 * @param {number} bitmaskInput The integer bitmask to analyze.
 * @returns {number} The total count of set bits.
 */
function calculateSetBits(bitmaskInput) {
    let tempMask = bitmaskInput;
    let setBitCount = 0;
    // Loop until all bits have been checked
    while (tempMask > 0) {
        if ((tempMask & 1) === 1) { // Check if the least significant bit is 1
            setBitCount++;
        }
        tempMask = tempMask >>> 1; // Right shift to check the next bit
    }
    return setBitCount;
}

ProcessInput( require("fs").readFileSync("/dev/stdin", 'utf-8').trim() );