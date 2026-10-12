function extractProblemParameters(rawInputText) {
    const contentLines = rawInputText.trim().split('\n');
    const firstLineParts = contentLines[0].split(' ');
    const heightValues = contentLines[1].split(' ').map(Number);

    return {
        totalHills: parseInt(firstLineParts[0], 10),
        maxJumpDistance: parseInt(firstLineParts[1], 10),
        hillHeights: heightValues
    };
}

function computeMinimumJumpCost(problemData) {
    const numberOfHills = problemData.totalHills;
    const maximumStep = problemData.maxJumpDistance;
    const heightsOfHills = problemData.hillHeights;

    const MAX_POS_INT_32BIT = 2147483647;
    const pathCosts = new Array(numberOfHills).fill(MAX_POS_INT_32BIT);
    pathCosts[0] = 0;

    let currentIdx = 0;
    while (currentIdx < numberOfHills) {
        let nextIdx = currentIdx + 1;
        while (nextIdx < numberOfHills && nextIdx <= currentIdx + maximumStep) {
            const heightDiff = Math.abs(heightsOfHills[currentIdx] - heightsOfHills[nextIdx]);
            const candidateCost = (pathCosts[currentIdx] + heightDiff) | 0;

            pathCosts[nextIdx] = Math.min(pathCosts[nextIdx], candidateCost);
            nextIdx++;
        }
        currentIdx++;
    }

    return String(pathCosts[numberOfHills - 1]) + '\n';
}

function initiateProgramExecution() {
    const fileSystemModule = require('fs');
    const standardInputIdentifier = '/dev/stdin';
    const inputStringContent = fileSystemModule.readFileSync(standardInputIdentifier, 'utf8');

    const parsedInput = extractProblemParameters(inputStringContent);
    const finalCalculatedResult = computeMinimumJumpCost(parsedInput);

    process.stdout.write(finalCalculatedResult);
}

initiateProgramExecution();
