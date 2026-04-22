const ExecuteCalculation = (sourceData) => {
    const dataLines = sourceData.split('\n');

    const dimensionTokens = dataLines[0].split(' ').map(Number);
    const gridHeight = dimensionTokens[0];
    const gridWidth = dimensionTokens[1];

    const conversionMatrixSize = 10;
    const unreachableCost = 1e9; // Represents infinity for path calculations

    const directConversionCharges = new Map();

    for (let originIndex = 0; originIndex < conversionMatrixSize; ++originIndex) {
        const chargeRowStrings = dataLines[originIndex + 1].split(' ');
        const destinationCharges = new Map();
        for (let targetIndex = 0; targetIndex < conversionMatrixSize; ++targetIndex) {
            destinationCharges.set(targetIndex, Number(chargeRowStrings[targetIndex]));
        }
        directConversionCharges.set(originIndex, destinationCharges);
    }

    const allPairShortestPaths = new Map();
    for (let i = 0; i < conversionMatrixSize; ++i) {
        const innerMap = new Map();
        for (let j = 0; j < conversionMatrixSize; ++j) {
            innerMap.set(j, directConversionCharges.get(i).get(j));
        }
        allPairShortestPaths.set(i, innerMap);
    }

    for (let transitNode = 0; transitNode < conversionMatrixSize; ++transitNode) {
        for (let startNode = 0; startNode < conversionMatrixSize; ++startNode) {
            for (let endNode = 0; endNode < conversionMatrixSize; ++endNode) {
                const pathViaTransit = allPairShortestPaths.get(startNode).get(transitNode) +
                                       allPairShortestPaths.get(transitNode).get(endNode);
                if (pathViaTransit < allPairShortestPaths.get(startNode).get(endNode)) {
                    allPairShortestPaths.get(startNode).set(endNode, pathViaTransit);
                }
            }
        }
    }

    const digitTallies = new Map();
    for (let k = 0; k < conversionMatrixSize; ++k) {
        digitTallies.set(k, 0);
    }

    for (let rowCounter = 0; rowCounter < gridHeight; ++rowCounter) {
        const gridLineTokens = dataLines[rowCounter + 11].split(' ');
        gridLineTokens.forEach(tokenString => {
            const numericalValue = Number(tokenString);
            if (numericalValue >= 0 && numericalValue < conversionMatrixSize) {
                digitTallies.set(numericalValue, digitTallies.get(numericalValue) + 1);
            }
        });
    }

    let accumulatedConversionCost = 0;
    const finalDesiredDigit = 1;

    for (let currentDigit = 0; currentDigit < conversionMatrixSize; ++currentDigit) {
        const occurrenceCount = digitTallies.get(currentDigit);

        if (currentDigit !== finalDesiredDigit && occurrenceCount > 0) {
            const costToConvert = allPairShortestPaths.get(currentDigit).get(finalDesiredDigit);
            accumulatedConversionCost += costToConvert * occurrenceCount;
        }
    }

    console.log(String(accumulatedConversionCost));
};

ExecuteCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));