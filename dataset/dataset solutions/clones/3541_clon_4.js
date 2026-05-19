'use strict';

function* generateChainCosts(startIndex, elements, xVal) {
    let distanceK = 1;
    for (let currentLookbackIndex = startIndex - 1; currentLookbackIndex >= 0; currentLookbackIndex--) {
        const elementValue = elements[currentLookbackIndex];
        const independentCost = 5 * elementValue + 2 * xVal;
        const chainedCost = (2 * distanceK + 3) * elementValue + xVal;

        if (independentCost < chainedCost) {
            return;
        }
        yield chainedCost;
        distanceK++;
    }
}

const calculateOptimalCost = (dataElements, costFactorX) => {
    const segmentCostCalculator = (currentSegmentEndIndex) => {
        if (currentSegmentEndIndex < 0) {
            return 0;
        }

        let segmentTotal = 5 * dataElements[currentSegmentEndIndex] + 2 * costFactorX;
        let elementsInCurrentChain = 1;

        for (const chainedElementCost of generateChainCosts(currentSegmentEndIndex, dataElements, costFactorX)) {
            segmentTotal += chainedElementCost;
            elementsInCurrentChain++;
        }
        
        return segmentTotal + segmentCostCalculator(currentSegmentEndIndex - elementsInCurrentChain);
    };

    return segmentCostCalculator(dataElements.length - 1);
};

const processInputAndCompute = (inputString) => {
    const lines = inputString.split('\n');
    const firstLineParts = lines[0].split(' ');
    const elementCount = parseInt(firstLineParts[0], 10);
    const xValue = parseInt(firstLineParts[1], 10);
    const elementValues = lines[1].split(' ').slice(0, elementCount).map(Number);

    const finalCost = calculateOptimalCost(elementValues, xValue);
    console.log(finalCost);
};

const isTestMode = false;

if (isTestMode) {
    processInputAndCompute('2 100\n1 10');
    processInputAndCompute('5 1\n1 999999997 999999998 999999999 1000000000');
    processInputAndCompute('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
    processInputAndCompute('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
} else {
    processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
