function* permutationGenerator(elements) {
    const itemCount = elements.length;
    const currentArrangement = Array.from(elements);
    const swapCounters = new Array(itemCount).fill(0);
    let currentIdx = 1;
    let swapTargetIdx;

    yield currentArrangement.slice();

    while (currentIdx < itemCount) {
        if (swapCounters[currentIdx] < currentIdx) {
            swapTargetIdx = (currentIdx % 2 === 0) ? 0 : swapCounters[currentIdx];
            [currentArrangement[currentIdx], currentArrangement[swapTargetIdx]] = [currentArrangement[swapTargetIdx], currentArrangement[currentIdx]];
            yield currentArrangement.slice();
            swapCounters[currentIdx]++;
            currentIdx = 1;
        } else {
            swapCounters[currentIdx] = 0;
            currentIdx++;
        }
    }
}

function evaluatePermutation(currentPermutation, foodItems, itemCount) {
    const evaluationResult = currentPermutation.reduce((accumulator, foodIdx, sequencePos) => {
        if (!accumulator.validSequence) return accumulator;

        const itemWeight = foodItems[foodIdx][1] - 0;
        const itemSatiety = foodItems[foodIdx][2] - 0;

        if (accumulator.cumulativeWeight > itemSatiety) {
            accumulator.validSequence = false;
            return accumulator;
        }

        accumulator.cumulativeWeight += itemWeight;
        accumulator.weightedSum += itemWeight * (itemCount - sequencePos);
        return accumulator;
    }, { cumulativeWeight: 0, weightedSum: 0, validSequence: true });

    if (!evaluationResult.validSequence) {
        return {
            score: evaluationResult.weightedSum / evaluationResult.cumulativeWeight,
            permutation: currentPermutation
        };
    } else {
        return { score: Infinity, permutation: currentPermutation };
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

let linePointer = 0;

function processNextCase() {
    const currentN = inputLines[linePointer++] - 0;
    if (currentN === 0) return false;

    const currentFoodItems = [];
    for (let j = 0; j < currentN; j++) {
        currentFoodItems.push(inputLines[linePointer++].split(" "));
    }

    let minimumOverallScore = Infinity;
    let bestPermutationIndices = null;

    const initialIndices = Array.from({ length: currentN }, (_, idx) => idx);

    for (const p of permutationGenerator(initialIndices)) {
        const result = evaluatePermutation(p, currentFoodItems, currentN);
        if (result.score < minimumOverallScore) {
            minimumOverallScore = result.score;
            bestPermutationIndices = result.permutation;
        }
    }

    if (bestPermutationIndices) {
        bestPermutationIndices.reverse().forEach(idx => {
            console.log(currentFoodItems[idx][0]);
        });
    }
    return true;
}

while (processNextCase()) {}
