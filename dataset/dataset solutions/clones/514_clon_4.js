const obtainSourceMaterial = () => {
    const { execSync } = require('child_process');
    try {
        return execSync('cat /dev/stdin', { encoding: 'utf8' });
    } catch (issue) {
        process.stderr.write("Issue encountered reading input: " + issue.message + '\n');
        return "";
    }
};

class MaterialExtractor {
    constructor(entireContent) {
        this.sections = entireContent.trim().split('\n');
        this.position = 0;
    }

    pullNextSection() {
        if (this.position >= this.sections.length) {
            return undefined;
        }
        return this.sections[this.position++];
    }
}

const arrangeDescending = (collectionToOrder) => {
    if (collectionToOrder.length <= 1) {
        return collectionToOrder;
    }

    const midPoint = Math.floor(collectionToOrder.length / 2);
    const pivotElement = collectionToOrder[midPoint];
    const smallerElements = [];
    const largerElements = [];
    const equalElements = [];

    for (let currentItem of collectionToOrder) {
        if (currentItem > pivotElement) {
            largerElements.push(currentItem);
        } else if (currentItem < pivotElement) {
            smallerElements.push(currentItem);
        } else {
            equalElements.push(currentItem);
        }
    }

    return [...arrangeDescending(largerElements), ...equalElements, ...arrangeDescending(smallerElements)];
};

const processBatch = (resourceProvider) => {
    const initialQuantityLine = resourceProvider.pullNextSection();
    if (initialQuantityLine === undefined) {
        return;
    }

    const initialQuantity = parseInt(initialQuantityLine, 10);
    if (initialQuantity === 0) {
        return;
    }

    const primaryValuesLine = resourceProvider.pullNextSection();
    const primaryValues = primaryValuesLine.split(' ').map(val => parseInt(val, 10));

    const extraValuesLine = resourceProvider.pullNextSection();
    const extraValues = extraValuesLine.split(' ').map(val => parseInt(val, 10));

    let currentAccumulatedTotal = 0;
    for (let element of primaryValues) {
        currentAccumulatedTotal += element;
    }

    const orderedExtraValues = arrangeDescending(extraValues);

    let peakPerformanceMetric = currentAccumulatedTotal * initialQuantity;

    const evaluateSequence = (currentIndex, currentSumSnapshot, currentMultiplierSnapshot, currentBestOverall) => {
        if (currentIndex >= orderedExtraValues.length || currentMultiplierSnapshot <= 0) {
            return currentBestOverall;
        }

        const nextExtraValue = orderedExtraValues[currentIndex];
        const updatedSum = currentSumSnapshot + nextExtraValue;
        const updatedMultiplier = currentMultiplierSnapshot - 1;
        
        const calculatedResult = updatedSum * updatedMultiplier;

        const newBestOverall = (calculatedResult > currentBestOverall) ? calculatedResult : currentBestOverall;

        return evaluateSequence(currentIndex + 1, updatedSum, updatedMultiplier, newBestOverall);
    };

    peakPerformanceMetric = evaluateSequence(0, currentAccumulatedTotal, initialQuantity, peakPerformanceMetric);

    process.stdout.write(String(peakPerformanceMetric) + '\n');

    processBatch(resourceProvider);
};

const allIncomingContent = obtainSourceMaterial();
const inputSupplier = new MaterialExtractor(allIncomingContent);
processBatch(inputSupplier);