let itemCount;

function swapArrayElements(arr, indexA, indexB) {
    const tempValue = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = tempValue;
}

function parseNumberLine(lineContent) {
    return lineContent.split(" ").map(valueStr => parseInt(valueStr, 10));
}

const MAX_SORT_VALUE = 10000;
const INITIAL_MIN_WEIGHT_SEARCH = 1000000;

function performCountingSort(sourceArr, destArr, maxVal) {
    const counts = Array.from({ length: maxVal + 1 }, () => 0);

    for (let elemIdx = 0; elemIdx < itemCount; elemIdx++) {
        counts[sourceArr[elemIdx]]++;
    }

    for (let idx = 1; idx <= maxVal; idx++) {
        counts[idx] += counts[idx - 1];
    }

    for (let elemIdx = 0; elemIdx < itemCount; elemIdx++) {
        const currentVal = sourceArr[elemIdx];
        const targetPos = --counts[currentVal];
        destArr[targetPos] = currentVal;
    }
}

function initializePermutationMaps(currentWeights, sortedWeights, count) {
    const permutationMap = new Array(count);
    const inversePermutationMap = new Array(count);

    for (let currIdx = 0; currIdx < count; currIdx++) {
        for (let sortedIdx = 0; sortedIdx < count; sortedIdx++) {
            if (currentWeights[currIdx] === sortedWeights[sortedIdx]) {
                permutationMap[currIdx] = sortedIdx;
                inversePermutationMap[sortedIdx] = currIdx;
            }
        }
    }
    return { permutationMap, inversePermutationMap };
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    itemCount = parseInt(inputLines[0], 10);

    if (itemCount === 0) {
        console.log(0);
        return;
    }

    const weights = parseNumberLine(inputLines[1]);
    const sortedWeights = new Array(itemCount);

    performCountingSort(weights, sortedWeights, MAX_SORT_VALUE);

    let matchCount = 0;
    for (let idx = 0; idx < itemCount; idx++) {
        if (weights[idx] === sortedWeights[idx]) {
            matchCount++;
        }
    }

    const { permutationMap, inversePermutationMap } = initializePermutationMaps(weights, sortedWeights, itemCount);

    let totalCost = 0;

    for (let idx = 0; idx < itemCount; idx++) {
        const targetIdx = permutationMap[idx];
        const targetTargetIdx = permutationMap[targetIdx];

        if (targetTargetIdx === idx && targetIdx !== idx) {
            matchCount += 2;
            totalCost += weights[idx] + weights[targetIdx];

            swapArrayElements(weights, idx, targetIdx);

            const originalPermMapTarget = permutationMap[idx];
            permutationMap[idx] = permutationMap[originalPermMapTarget];
            permutationMap[originalPermMapTarget] = originalPermMapTarget;

            const originalInvPermMapTarget = inversePermutationMap[idx];
            inversePermutationMap[idx] = inversePermutationMap[originalPermMapTarget];
            inversePermutationMap[originalInvPermMapTarget] = originalInvPermMapTarget;
        }
    }

    while (matchCount < itemCount) {
        let minWeight = INITIAL_MIN_WEIGHT_SEARCH;
        let minWeightIndex = -1;

        for (let idx = 0; idx < itemCount; idx++) {
            if (permutationMap[idx] !== idx && weights[idx] < minWeight) {
                minWeight = weights[idx];
                minWeightIndex = idx;
            }
        }

        if (minWeightIndex === -1) {
            break;
        }

        let currentCycleElementIndex = minWeightIndex;
        while (permutationMap[currentCycleElementIndex] !== currentCycleElementIndex) {
            const elementToSwapWithIndex = inversePermutationMap[currentCycleElementIndex];
            totalCost += weights[currentCycleElementIndex] + weights[elementToSwapWithIndex];

            swapArrayElements(weights, currentCycleElementIndex, elementToSwapWithIndex);

            const tempPermVal = permutationMap[currentCycleElementIndex];
            permutationMap[currentCycleElementIndex] = permutationMap[elementToSwapWithIndex];
            permutationMap[elementToSwapWithIndex] = tempPermVal;

            const tempInvPermVal = inversePermutationMap[currentCycleElementIndex];
            inversePermutationMap[permutationMap[elementToSwapWithIndex]] = inversePermutationMap[currentCycleElementIndex];
            inversePermutationMap[currentCycleElementIndex] = currentCycleElementIndex;
            currentCycleElementIndex = tempInvPermVal;

            matchCount++;
        }
        matchCount++;
    }

    console.log(totalCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
