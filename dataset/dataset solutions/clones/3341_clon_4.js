function ProcessStoneData(inputString) {
    const rawLines = inputString.split("\n");
    const quantity = parseInt(rawLines[0], 10);
    const stoneMeasurements = rawLines[1].split(" ").map(val => parseInt(val, 10));

    const partialSums = new Array(quantity);
    if (quantity > 0) {
        partialSums[0] = stoneMeasurements[0];
        for (let currentIdx = 1; currentIdx < quantity; currentIdx++) {
            partialSums[currentIdx] = partialSums[currentIdx - 1] + stoneMeasurements[currentIdx];
        }
    }

    const costMemo = new Map();

    const obtainRangeSum = (s, e) => {
        if (s > e) return 0;
        return partialSums[e] - (s > 0 ? partialSums[s - 1] : 0);
    };

    const determineOptimalMergeCost = (beginIndex, finishIndex) => {
        if (beginIndex === finishIndex) {
            return 0;
        }
        if (beginIndex > finishIndex) {
            return 0;
        }

        const cacheKey = `${beginIndex},${finishIndex}`;
        if (costMemo.has(cacheKey)) {
            return costMemo.get(cacheKey);
        }

        let minimumCurrentCost = Infinity;

        for (let splitPoint = beginIndex; splitPoint < finishIndex; splitPoint++) {
            const leftSubproblemCost = determineOptimalMergeCost(beginIndex, splitPoint);
            const rightSubproblemCost = determineOptimalMergeCost(splitPoint + 1, finishIndex);
            const currentMergeCost = obtainRangeSum(beginIndex, finishIndex);

            const totalSubproblemCost = leftSubproblemCost + rightSubproblemCost + currentMergeCost;
            minimumCurrentCost = Math.min(minimumCurrentCost, totalSubproblemCost);
        }

        costMemo.set(cacheKey, minimumCurrentCost);
        return minimumCurrentCost;
    };

    const ultimateOutcome = determineOptimalMergeCost(0, quantity - 1);

    console.log('%s', ultimateOutcome);
    return ultimateOutcome;
}

ProcessStoneData(require("fs").readFileSync("/dev/stdin", "utf8"));