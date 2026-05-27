function solveCombinations(digitCount, desiredSum) {
    if (digitCount === 0) {
        return desiredSum === 0 ? 1 : 0;
    }
    if (digitCount < 0 || desiredSum < 0 || digitCount > 10) {
        return 0;
    }

    const maxPossibleDigit = 9;
    // dpTable[k][currentAccumulatedSum][lastChosenDigit]
    // k: number of digits selected so far (from 1 to digitCount)
    // currentAccumulatedSum: sum of k selected digits (from 0 to desiredSum)
    // lastChosenDigit: the largest digit among the k selected digits (from 0 to maxPossibleDigit)
    const dpTable = Array(digitCount + 1).fill(null).map(() =>
        Array(desiredSum + 1).fill(null).map(() =>
            Array(maxPossibleDigit + 1).fill(0)
        )
    );

    // Initialize for selecting 1 digit
    for (let d = 0; d <= maxPossibleDigit; d++) {
        if (d <= desiredSum) {
            dpTable[1][d][d] = 1;
        }
    }

    // Fill the DP table for selecting k digits
    for (let k = 1; k < digitCount; k++) { // k represents the number of digits already chosen
        for (let currentAccumulatedSum = 0; currentAccumulatedSum <= desiredSum; currentAccumulatedSum++) {
            for (let lastChosenDigit = 0; lastChosenDigit <= maxPossibleDigit; lastChosenDigit++) {
                if (dpTable[k][currentAccumulatedSum][lastChosenDigit] === 0) {
                    continue; // No combinations for this state
                }

                // Try to select the (k+1)-th digit
                // The next digit must be greater than the last chosen digit to ensure distinct and increasing sequence
                for (let nextDigit = lastChosenDigit + 1; nextDigit <= maxPossibleDigit; nextDigit++) {
                    const newAccumulatedSum = currentAccumulatedSum + nextDigit;
                    if (newAccumulatedSum <= desiredSum) {
                        dpTable[k + 1][newAccumulatedSum][nextDigit] += dpTable[k][currentAccumulatedSum][lastChosenDigit];
                    }
                }
            }
        }
    }

    // Sum up all valid combinations for 'digitCount' digits and 'desiredSum'
    let totalValidWays = 0;
    for (let lastChosenDigit = 0; lastChosenDigit <= maxPossibleDigit; lastChosenDigit++) {
        totalValidWays += dpTable[digitCount][desiredSum][lastChosenDigit];
    }

    return totalValidWays;
}

// Function to process the entire input string
function processInputData(fullInputString) {
    const inputLines = fullInputString.trim().split('\n');
    for (const currentLine of inputLines) {
        const lineParts = currentLine.split(' ');
        const countParam = Number(lineParts[0]);
        const sumParam = Number(lineParts[1]);

        if (countParam === 0 && sumParam === 0) {
            break; // Termination condition
        }
        console.log(solveCombinations(countParam, sumParam));
    }
}

// Standard Node.js input handling setup
let collectedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
    collectedInput += dataChunk;
});
process.stdin.on('end', () => {
    processInputData(collectedInput);
});
