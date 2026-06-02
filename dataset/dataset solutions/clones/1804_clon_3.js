function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const numberOfTestCases = parseInt(inputLines[0], 10);
    const testCaseDetails = [];
    const collectedResults = [];

    // Parse all test cases into a more structured format
    for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
        const N_value = parseInt(inputLines[3 * caseIndex + 1], 10);
        const A_array = inputLines[3 * caseIndex + 2].split(' ').map(strNum => parseInt(strNum, 10));
        const S_string = inputLines[3 * caseIndex + 3];
        testCaseDetails.push({ N: N_value, A: A_array, S: S_string });
    }

    // Process each test case
    for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
        const currentCase = testCaseDetails[caseIndex];
        const N_val = currentCase.N;
        const A_arr = currentCase.A;
        const S_str = currentCase.S;

        let caseOutcome = 0; // Default outcome is 0

        // Determine the count of trailing '0's in the S string
        let trailingZeroCharacterCount = 0;
        const stringLength = S_str.length;
        for (let charPosition = stringLength - 1; charPosition >= 0; charPosition--) {
            if (S_str[charPosition] === '0') {
                trailingZeroCharacterCount++;
            } else {
                break; // Stop at the first '1' from the right
            }
        }
        currentCase.trailingZeros = trailingZeroCharacterCount; // Store this for later use

        // Phase 1: Generate XOR sums using numbers corresponding to '1's in S
        // These are the first (N - trailingZeroCharacterCount) numbers from A
        let currentXorSumSet = new Set([0]); // Start with 0 as a possible sum

        const oneSegmentEnd = N_val - trailingZeroCharacterCount;
        for (let arrIndex = 0; arrIndex < oneSegmentEnd; arrIndex++) {
            const valueToCombine = A_arr[arrIndex];
            const nextXorSumSet = new Set(currentXorSumSet); // Copy current sums
            for (const existingSum of currentXorSumSet) {
                nextXorSumSet.add(existingSum ^ valueToCombine); // Add new XOR combination
            }
            currentXorSumSet = nextXorSumSet; // Update the set of possible sums
        }

        // Phase 2: For each sum generated in Phase 1, check if it can be reduced to 0
        // using numbers corresponding to '0's in S (the last 'trailingZeroCharacterCount' numbers from A)
        const finalXorSumsFromOnes = Array.from(currentXorSumSet); // Convert Set to Array for iteration

        for (const initialChallengeValue of finalXorSumsFromOnes) {
            let currentChoiceSet = new Set([initialChallengeValue]); // Start with one sum from Phase 1
            let canReachZero = false; // Flag to track if 0 is achievable

            const zeroSegmentStart = N_val - trailingZeroCharacterCount;
            const zeroSegmentEnd = N_val; // Exclusive end index

            for (let arrIndex = zeroSegmentStart; arrIndex < zeroSegmentEnd; arrIndex++) {
                const valueToCombine = A_arr[arrIndex];
                const nextChoiceSet = new Set(currentChoiceSet); // Copy current choices
                for (const existingChoice of currentChoiceSet) {
                    nextChoiceSet.add(existingChoice ^ valueToCombine); // Add new XOR combination
                }
                currentChoiceSet = nextChoiceSet; // Update the set of possible choices

                if (currentChoiceSet.has(0)) { // If 0 is found in the set of choices
                    canReachZero = true;
                    break; // No need to process further for this initialChallengeValue
                }
            }

            if (!canReachZero) {
                caseOutcome = 1; // If any initial sum cannot be reduced to 0, the overall result is 1
                break; // No need to check other initial sums
            }
        }
        collectedResults.push(String(caseOutcome)); // Store the result for the current test case
    }

    // Output all collected results, separated by newlines
    console.log(collectedResults.join('\n'));
}

// Standard input/output handling, do not modify below this line
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
