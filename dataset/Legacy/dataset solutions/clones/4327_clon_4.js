function findSolutionRecursive(targetN) {
    const targetA = 4 / targetN;
    const constB = 2 / 3500;
    const constC = 1 / 3500;
    const upperLimit = 3499;
    const EPSILON = 1e-9;

    let foundH = 0, foundN = 0, foundW = 0;
    let solutionFound = false;

    function searchForFraction(currentDepth, currentSumOfReciprocals, previousTermValue) {
        if (solutionFound) return;

        if (currentDepth === 2) {
            const remainingFraction = targetA - currentSumOfReciprocals;
            if (remainingFraction <= EPSILON) return;

            const candidateW = 1 / remainingFraction;

            if (Math.abs(candidateW - Math.round(candidateW)) < EPSILON) {
                const integerW = Math.round(candidateW);
                if (integerW >= previousTermValue && integerW <= upperLimit) {
                    foundW = integerW;
                    solutionFound = true;
                }
            }
            return;
        }

        let iterationStartValue;
        if (currentDepth === 0) {
            const hLowerBoundCalc = targetA - constB;
            iterationStartValue = hLowerBoundCalc > EPSILON ? Math.max(1, Math.floor(1 / hLowerBoundCalc)) : 1;
        } else {
            const nLowerBoundCalc = targetA - currentSumOfReciprocals - constC;
            iterationStartValue = nLowerBoundCalc > EPSILON ? Math.max(1, Math.floor(1 / nLowerBoundCalc)) : 1;
        }

        iterationStartValue = Math.max(1, iterationStartValue);

        for (let currentTermValue = iterationStartValue; currentTermValue <= upperLimit; currentTermValue++) {
            if (solutionFound) break;

            if (currentDepth === 0) {
                if (targetA - (1 / currentTermValue) < constB - EPSILON) {
                    continue;
                }
                foundH = currentTermValue;
                searchForFraction(currentDepth + 1, currentSumOfReciprocals + (1 / currentTermValue), currentTermValue);
            } else if (currentDepth === 1) {
                if (targetA - currentSumOfReciprocals - (1 / currentTermValue) < constC - EPSILON) {
                    continue;
                }
                foundN = currentTermValue;
                searchForFraction(currentDepth + 1, currentSumOfReciprocals + (1 / currentTermValue), currentTermValue);
            }

            if (solutionFound) break;
        }
    }

    searchForFraction(0, 0, 1);

    return [foundH, foundN, foundW];
}

function processInputAndSolve(inputLines) {
    const NValue = parseInt(inputLines[0], 10);
    const solutionResult = findSolutionRecursive(NValue);
    console.log(solutionResult.join(' '));
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    processInputAndSolve(inputBuffer.split(/\r?\n/));
});
