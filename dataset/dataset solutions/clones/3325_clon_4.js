function processInputData(inputString) {
    const lines = inputString.trim().split('\n');
    const totalPlates = parseInt(lines[0].split(' ')[0], 10);
    const plateValues = lines[1].split(' ').map(Number);

    const initialItemCounts = Array(4).fill(0);
    for (const val of plateValues) {
        initialItemCounts[val]++;
    }

    const expectedValue = calculateExpectedRolls(totalPlates, initialItemCounts);
    console.log(expectedValue);
}

function calculateExpectedRolls(totalPlates, currentCounts) {
    const expectedValuesCache = Array(totalPlates + 1).fill(0).map(() =>
        Array(totalPlates + 1).fill(0).map(() =>
            Array(totalPlates + 1).fill(0)
        )
    );

    for (let c3 = 0; c3 <= totalPlates; c3++) {
        for (let c2 = 0; c2 <= totalPlates; c2++) {
            for (let c1 = 0; c1 <= totalPlates; c1++) {
                if (c1 + c2 + c3 > totalPlates) {
                    continue;
                }

                const countOfZeros = totalPlates - c1 - c2 - c3;
                const countOfNonZeros = c1 + c2 + c3;

                if (countOfNonZeros === 0) {
                    expectedValuesCache[c1][c2][c3] = 0;
                    continue;
                }

                let sumOfNextStateExpectations = 0;

                if (c1 > 0) {
                    sumOfNextStateExpectations += expectedValuesCache[c1 - 1][c2][c3] * c1;
                }
                if (c2 > 0) {
                    sumOfNextStateExpectations += expectedValuesCache[c1 + 1][c2 - 1][c3] * c2;
                }
                if (c3 > 0) {
                    sumOfNextStateExpectations += expectedValuesCache[c1][c2 + 1][c3 - 1] * c3;
                }

                const denominatorTerm = countOfNonZeros - countOfZeros;
                expectedValuesCache[c1][c2][c3] = (countOfNonZeros + sumOfNextStateExpectations) / denominatorTerm;
            }
        }
    }

    return expectedValuesCache[currentCounts[1]][currentCounts[2]][currentCounts[3]];
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
