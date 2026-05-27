process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', chunk => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    const lineSegments = inputBuffer.trim().split('\n');

    const [numRows, numCols] = lineSegments.shift().split(' ').map(Number); // numRows for m, numCols for n

    const dataA = lineSegments.splice(0, numCols).map(Number); // d array (length n)
    const dataB = lineSegments.splice(0, numRows).map(Number); // c array (length m)

    // dpTable[c_index][d_index] stores the minimum cost
    const dpTable = Array.from({ length: numRows + 1 }, () => Array(numCols + 1).fill(Infinity));

    dpTable[0][0] = 0;

    // Iterate over each cell (currentCIndex, currentDIndex) in the dpTable
    // and compute its value based on previously calculated states.
    for (let currentCIndex = 0; currentCIndex <= numRows; currentCIndex++) {
        for (let currentDIndex = 0; currentDIndex <= numCols; currentDIndex++) {
            if (currentCIndex === 0 && currentDIndex === 0) {
                continue; // Base case dpTable[0][0] is already 0
            }

            if (currentDIndex === 0) {
                // If no 'd' elements are processed (currentDIndex is 0),
                // the cost is Infinity for currentCIndex > 0, as there's no
                // transition in the original logic to set these to a finite value.
                // dpTable[0][0] is the only finite value in this row.
                continue;
            }

            // To calculate dpTable[currentCIndex][currentDIndex],
            // we consider all possible previous states dpTable[prevCIndex][currentDIndex - 1].
            // This corresponds to matching dataA[currentDIndex - 1] (original d[j])
            // with dataB[prevCIndex] (original c[i]),
            // where kVal = currentCIndex - prevCIndex (original k) represents
            // the number of 'c' elements consumed to process dataA[currentDIndex - 1].
            for (let prevCIndex = 0; prevCIndex < currentCIndex; prevCIndex++) {
                const kVal = currentCIndex - prevCIndex; // kVal is the 'k' from the original loop

                // Ensure the previous state is reachable (not Infinity)
                if (dpTable[prevCIndex][currentDIndex - 1] !== Infinity) {
                    // Replicate the original condition: i + k + n - j + 1 <= m
                    // i = prevCIndex, k = kVal, n = numCols, j = currentDIndex - 1, m = numRows
                    if (prevCIndex + kVal + numCols - (currentDIndex - 1) + 1 <= numRows) {
                        dpTable[currentCIndex][currentDIndex] = Math.min(
                            dpTable[currentCIndex][currentDIndex],
                            dpTable[prevCIndex][currentDIndex - 1] + dataB[prevCIndex] * dataA[currentDIndex - 1]
                        );
                    }
                }
            }
        }
    }

    console.log(dpTable[numRows][numCols]);
});
