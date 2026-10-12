function processInputData(rawText) {
    const textLines = rawText.split("\n");
    const [stoneCount, maxStep] = textLines[0].split(" ").map(Number);
    const stoneHeights = textLines[1].split(" ").map(Number);
    return { stoneCount, maxStep, stoneHeights };
}

function calculateOptimalPath(sourceText) {
    const { stoneCount, maxStep, stoneHeights } = processInputData(sourceText);

    const initialPathCosts = [0];

    const finalPathCosts = Array.from({ length: stoneCount - 1 }, (_, idx) => idx + 1)
        .reduce((currentCostArray, targetStoneIdx) => {
            const reachablePredecessors = Array.from({ length: maxStep }, (_, offset) => targetStoneIdx - 1 - offset)
                .filter(prevIdx => prevIdx >= 0);

            const potentialCosts = reachablePredecessors.map(sourceStoneIdx => {
                const costFromSource = currentCostArray[sourceStoneIdx];
                const heightDifference = Math.abs(stoneHeights[sourceStoneIdx] - stoneHeights[targetStoneIdx]);
                return costFromSource + heightDifference;
            });

            const minimumCostToTarget = Math.min(...potentialCosts);
            currentCostArray.push(minimumCostToTarget);
            return currentCostArray;
        }, initialPathCosts);

    console.log(finalPathCosts[finalPathCosts.length - 1]);
}

calculateOptimalPath(require("fs").readFileSync("/dev/stdin", "utf8"));
