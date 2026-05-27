function processSingleCase(initialA, paramB, paramC, paramD) {
    const RADIX_DECIMAL = 10;

    // Initial guard conditions based on problem constraints
    if (initialA < paramB) {
        return "No";
    }
    if (paramD < paramB) {
        return "No";
    }
    if (initialA < paramC) {
        return "Yes";
    }

    // Initialize currentA for the loop, matching the original's A = newA + B;
    // where newA was A % B.
    let currentA = (initialA % paramB) + paramB;

    // Loop until currentA falls below paramB
    while (currentA >= paramB) {
        // Calculate the difference (currentA - paramB) once per iteration
        let differenceAB = currentA - paramB;
        let nextAValue;

        // Apply the conditional update logic
        if (differenceAB <= paramC) {
            nextAValue = differenceAB + paramD;
        } else {
            nextAValue = differenceAB;
        }
        currentA = nextAValue; // Update currentA for the next iteration

        // Check for the termination condition that results in "Yes"
        if (currentA >= (2 * initialA) || currentA === initialA) {
            return "Yes";
        }
    }

    // If the loop completes without meeting the "Yes" condition, return "No"
    return "No";
}

function solveProblem(rawInputString) {
    const RADIX_DECIMAL = 10;
    const inputLines = rawInputString.split('\n');
    const numberOfTestCases = parseInt(inputLines[0], RADIX_DECIMAL);

    for (let testCaseIdx = 1; testCaseIdx <= numberOfTestCases; testCaseIdx++) {
        const currentCaseParams = inputLines[testCaseIdx].split(' ');
        const currentA = parseInt(currentCaseParams[0], RADIX_DECIMAL);
        const paramB = parseInt(currentCaseParams[1], RADIX_DECIMAL);
        const paramC = parseInt(currentCaseParams[2], RADIX_DECIMAL);
        const paramD = parseInt(currentCaseParams[3], RADIX_DECIMAL);

        const result = processSingleCase(currentA, paramB, paramC, paramD);
        console.log(result);
    }
}

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
