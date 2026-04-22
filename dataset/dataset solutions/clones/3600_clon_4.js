function extractData(rawInputText) {
    const relevantLines = rawInputText.split('\n').filter(line => line.trim().length > 0);
    const firstNum = parseInt(relevantLines[0], 10);
    const secondLineNums = relevantLines[1].split(' ').map(Number);
    return { count: firstNum, values: secondLineNums };
}

function createSegmentTree(sizeBoundary) {
    const treeStorage = new Array(4 * sizeBoundary).fill(0);
    const rangeMin = 1;
    const rangeMax = sizeBoundary - 1;

    function applyChange(targetIndex, amount, nodeIdentifier, currentRangeStart, currentRangeEnd) {
        if (currentRangeStart === currentRangeEnd) {
            treeStorage[nodeIdentifier] += amount;
            return;
        }
        const midPoint = Math.floor((currentRangeStart + currentRangeEnd) / 2);
        if (targetIndex <= midPoint) {
            applyChange(targetIndex, amount, 2 * nodeIdentifier, currentRangeStart, midPoint);
        } else {
            applyChange(targetIndex, amount, 2 * nodeIdentifier + 1, midPoint + 1, currentRangeEnd);
        }
        treeStorage[nodeIdentifier] = treeStorage[2 * nodeIdentifier] + treeStorage[2 * nodeIdentifier + 1];
    }

    function retrieveRangeSum(queryStart, queryEnd, nodeIdentifier, currentRangeStart, currentRangeEnd) {
        if (queryEnd < currentRangeStart || queryStart > currentRangeEnd) {
            return 0;
        }
        if (queryStart <= currentRangeStart && currentRangeEnd <= queryEnd) {
            return treeStorage[nodeIdentifier];
        }
        const midPoint = Math.floor((currentRangeStart + currentRangeEnd) / 2);
        const sumLeftBranch = retrieveRangeSum(queryStart, queryEnd, 2 * nodeIdentifier, currentRangeStart, midPoint);
        const sumRightBranch = retrieveRangeSum(queryStart, queryEnd, 2 * nodeIdentifier + 1, midPoint + 1, currentRangeEnd);
        return sumLeftBranch + sumRightBranch;
    }

    return {
        updatePoint: (index, value) => applyChange(index, value, 1, rangeMin, rangeMax),
        queryCumulative: (upperBound) => retrieveRangeSum(rangeMin, upperBound, 1, rangeMin, rangeMax)
    };
}

function solveMedianProblem() {
    const { count: totalElements, values: dataSequence } = extractData(require("fs").readFileSync("/dev/stdin","utf8"));

    if (totalElements <= 2) {
        return Math.max(...dataSequence);
    }

    const targetPosition = Math.floor(totalElements * (totalElements + 1) / 4 + 1);
    let searchLower = 2;
    let searchUpper = 1e9 + 1;

    const maxPermittedBalance = 2 * totalElements + 2;

    while (searchLower < searchUpper) {
        const currentGuess = Math.floor((searchLower + searchUpper) / 2);
        let runningBalance = totalElements + 1;
        let countSubarraysWithMedianGEGuess = 0;

        const balanceTree = createSegmentTree(maxPermittedBalance);
        balanceTree.updatePoint(runningBalance, 1);

        for (let idx = 0; idx < totalElements; idx++) {
            runningBalance += (dataSequence[idx] < currentGuess ? -1 : 1);
            countSubarraysWithMedianGEGuess += balanceTree.queryCumulative(runningBalance);
            balanceTree.updatePoint(runningBalance, 1);
        }

        const totalPossibleSubarrays = totalElements * (totalElements + 1) / 2;
        const countSubarraysWithMedianLTGuess = totalPossibleSubarrays - countSubarraysWithMedianGEGuess;

        if (countSubarraysWithMedianLTGuess < targetPosition) {
            searchLower = currentGuess + 1;
        } else {
            searchUpper = currentGuess;
        }
    }
    return searchLower - 1;
}

console.log(solveMedianProblem());