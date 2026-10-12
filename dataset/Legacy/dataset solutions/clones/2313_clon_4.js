const extractAndSort = (dataLine) => dataLine.split(' ').map(Number).sort((a, b) => a - b);

const evaluatePossibility = (indexCandidate, itemData) => {
    const { totalElements, maxBoostAmount, totalBoostSlots, requiredRank, sortedElements } = itemData;
    const potentialAchievedScore = sortedElements[indexCandidate] + maxBoostAmount;

    // First filter: Check if the candidate's potential score can even reach the P-th highest initial score.
    // The P-th highest initial score is at index `totalElements - requiredRank`.
    if (sortedElements[totalElements - requiredRank] > potentialAchievedScore) {
        return false;
    }

    // Second filter: Simulate vote distribution to determine if enough problems can achieve `potentialAchievedScore`.
    // The candidate itself consumes one vote slot.
    let remainingBoostSlots = totalBoostSlots - 1;

    // Count problems that are initially higher than `indexCandidate`
    // but have scores less than `potentialAchievedScore`.
    // These problems would need a boost to reach `potentialAchievedScore`.
    let countHigherNeedingBoost = 0;
    for (let j = indexCandidate + 1; j < totalElements; j++) {
        if (sortedElements[j] < potentialAchievedScore) {
            countHigherNeedingBoost++;
        }
    }

    if (remainingBoostSlots < countHigherNeedingBoost) {
        // If there are not enough remaining vote slots to boost all problems
        // (initially higher than `indexCandidate` but below `potentialAchievedScore`)
        // to `potentialAchievedScore`, then some of these problems will remain below `potentialAchievedScore`.
        // The number of problems that will definitively be below `potentialAchievedScore` (among those initially higher than `indexCandidate`)
        // is `countHigherNeedingBoost - remainingBoostSlots`.
        //
        // Total problems that will end up below `potentialAchievedScore` are:
        // 1. All problems from index `0` to `indexCandidate - 1` (as `sortedElements[j] + maxBoostAmount < potentialAchievedScore` for `j < indexCandidate`).
        // 2. The `countHigherNeedingBoost - remainingBoostSlots` problems mentioned above.
        const allBelowFinalScore = indexCandidate + (countHigherNeedingBoost - remainingBoostSlots);

        // For `indexCandidate` to achieve the `requiredRank` or better,
        // the number of problems at or above `potentialAchievedScore` (`totalElements - allBelowFinalScore`)
        // must be at least `requiredRank`.
        return (totalElements - allBelowFinalScore) >= requiredRank;
    } else {
        // If there are enough (or more) vote slots to boost all problems
        // (initially higher than `indexCandidate` and below `potentialAchievedScore`)
        // to `potentialAchievedScore`, then all problems from `indexCandidate` to `totalElements - 1`
        // will end up with a score of at least `potentialAchievedScore`.
        // The count of such problems is `totalElements - indexCandidate`.
        // This count must be at least `requiredRank`.
        return (totalElements - indexCandidate) >= requiredRank;
    }
};

const computeResult = (processedData) => {
    // Binary search for the smallest index `k` in `sortedElements`
    // such that `sortedElements[k]` can achieve the `requiredRank`.
    let lowerBound = 0;
    let upperBound = processedData.totalElements - 1;
    let successfulIndex = processedData.totalElements - 1; // Initialize with the highest possible index (meaning 1 winner)

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor(lowerBound + (upperBound - lowerBound) / 2);
        if (evaluatePossibility(midPoint, processedData)) {
            successfulIndex = midPoint;
            upperBound = midPoint - 1;
        } else {
            lowerBound = midPoint + 1;
        }
    }

    // The result is the number of problems from `successfulIndex` to `totalElements - 1`.
    return processedData.totalElements - successfulIndex;
};

const executeProgram = (rawInputText) => {
    const linesOfText = rawInputText.trim().split("\n");
    const firstLineValues = linesOfText[0].split(" ").map(Number);
    
    const programData = {
        totalElements: firstLineValues[0],
        maxBoostAmount: firstLineValues[1],
        totalBoostSlots: firstLineValues[2],
        requiredRank: firstLineValues[3],
        sortedElements: extractAndSort(linesOfText[1]),
    };

    const finalCount = computeResult(programData);
    console.log(finalCount);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));