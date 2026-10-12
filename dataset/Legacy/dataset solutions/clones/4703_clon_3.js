function calculateOptimalPairs(rawInputData) {
    const tokenizedInput = rawInputData.split(' ');

    const [sResourceStr, cResourceStr] = tokenizedInput;
    const sResourceCount = Number(sResourceStr);
    let cResourceCount = Number(cResourceStr);

    let totalPairsFormed = 0;

    const maxCPairsPossible = Math.floor(cResourceCount / 2);

    if (sResourceCount > maxCPairsPossible) {
        totalPairsFormed = totalPairsFormed + maxCPairsPossible;
    } else {
        totalPairsFormed = totalPairsFormed + sResourceCount;

        const cConsumedBySPairs = sResourceCount * 2;
        cResourceCount = cResourceCount - cConsumedBySPairs;

        const additionalPairsFromRemainingC = Math.floor(cResourceCount / 4);
        totalPairsFormed = totalPairsFormed + additionalPairsFromRemainingC;
    }

    console.log(totalPairsFormed);
}

calculateOptimalPairs(require("fs").readFileSync("/dev/stdin", "utf8"));
