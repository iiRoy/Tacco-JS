const sourceMaterial = require('node:fs').readFileSync(0, 'utf8');
const lineFragments = sourceMaterial.trim().split('\n');
let fragmentPointer = 0;

function extractNumber() {
    return Number(lineFragments[fragmentPointer++]);
}

function extractNumberSequence() {
    return lineFragments[fragmentPointer++].split(' ').map(Number);
}

function orderNumericsDescending(collection) {
    const workingCopy = collection.slice();
    const elementCount = workingCopy.length;

    for (let outer = 0; outer < elementCount - 1; outer++) {
        let largestIndex = outer;
        for (let inner = outer + 1; inner < elementCount; inner++) {
            if (workingCopy[inner] > workingCopy[largestIndex]) {
                largestIndex = inner;
            }
        }
        if (largestIndex !== outer) {
            const temporary = workingCopy[outer];
            workingCopy[outer] = workingCopy[largestIndex];
            workingCopy[largestIndex] = temporary;
        }
    }
    return workingCopy;
}

function analyzeScenario(baseCount, baseItems, supplementalItems) {
    let primarySum = 0;
    for (let index = 0; index < baseItems.length; ++index) {
        primarySum += baseItems[index];
    }

    const sortedSupplemental = orderNumericsDescending(supplementalItems);

    let currentBestProduct = primarySum * baseCount;

    function exploreAdditions(currentIterationIndex, currentCumulativeSum, currentEffectiveCount, currentOptimalProduct) {
        const potentialProduct = currentCumulativeSum * currentEffectiveCount;
        const updatedOptimalProduct = (potentialProduct > currentOptimalProduct) ? potentialProduct : currentOptimalProduct;

        if (currentIterationIndex === sortedSupplemental.length) {
            return updatedOptimalProduct;
        }

        const nextCumulativeSum = currentCumulativeSum + sortedSupplemental[currentIterationIndex];
        const nextEffectiveCount = currentEffectiveCount - 1;

        return exploreAdditions(
            currentIterationIndex + 1,
            nextCumulativeSum,
            nextEffectiveCount,
            updatedOptimalProduct
        );
    }

    return exploreAdditions(0, primarySum, baseCount, currentBestProduct);
}

let currentCaseSize;
while ((currentCaseSize = extractNumber()) !== 0) {
    const primaryElements = extractNumberSequence();
    const additionalElements = extractNumberSequence();
    const finalResult = analyzeScenario(currentCaseSize, primaryElements, additionalElements);
    console.log(finalResult);
}