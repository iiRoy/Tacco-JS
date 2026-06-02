function computeGreatestCommonDivisor(valA, valB) {
    while (valB !== 0) {
        let temp = valB;
        valB = valA % valB;
        valA = temp;
    }
    return valA;
}

function executeSolution(inputPayload) {
    const [firstLine, stringA, stringB] = inputPayload.split("\n");
    const [lenA, lenB] = firstLine.split(" ").map(Number);

    if (stringA === stringB) {
        console.log(lenA);
        return;
    }

    // This block is executed only if stringA !== stringB
    if (lenA % lenB === 0 || lenB % lenA === 0) {
        console.log(-1);
    } else {
        const commonDivisor = computeGreatestCommonDivisor(lenA, lenB);
        let currentLength = (lenA * lenB) / commonDivisor; // This is the Least Common Multiple (LCM)
        const lengthIncrementStep = currentLength; // Store LCM for incrementing

        // Iterate through multiples of LCM until a match is found or limit is reached
        while (currentLength < 100000) { // Original limit Math.pow(10,5)
            let allCharsMatch = true;

            // Iterate through all possible positions within the current combined length
            for (let pos = 0; pos < currentLength; pos++) {
                // Check if 'pos' aligns with a character in stringA
                // (pos * lenA) must be a multiple of currentLength
                const isAlignedA = (pos * lenA) % currentLength === 0;
                const charIdxA = isAlignedA ? (pos * lenA) / currentLength : -1;

                // Check if 'pos' aligns with a character in stringB
                // (pos * lenB) must be a multiple of currentLength
                const isAlignedB = (pos * lenB) % currentLength === 0;
                const charIdxB = isAlignedB ? (pos * lenB) / currentLength : -1;

                // Only compare characters if 'pos' is an alignment point for BOTH strings
                if (isAlignedA && isAlignedB) {
                    if (stringA[charIdxA] !== stringB[charIdxB]) {
                        allCharsMatch = false;
                        break; // Mismatch found, no need to check further for this currentLength
                    }
                }
            }

            if (allCharsMatch) {
                break; // Found the smallest matching length, currentLength holds the answer
            }

            currentLength += lengthIncrementStep; // Move to the next multiple of LCM
        }
        console.log(currentLength); // Prints the value of currentLength after the loop
    }
}

executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
