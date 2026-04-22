const dataProcessor = (function() {
    let currentLinesContainer;
    let linePointer = 0;
    let wordPointer = 0;

    function init(rawDataContent) {
        currentLinesContainer = rawDataContent.toString().trim().split('\n');
        linePointer = 0;
        wordPointer = 0;
    }

    function obtainScalar() {
        if (!currentLinesContainer || linePointer >= currentLinesContainer.length) {
            return undefined;
        }

        let lineTokens = currentLinesContainer[linePointer].split(' ');
        if (wordPointer >= lineTokens.length) {
            linePointer++;
            wordPointer = 0;
            return obtainScalar(); 
        }

        const numericValue = BigInt(lineTokens[wordPointer++]);
        if (wordPointer >= lineTokens.length) { 
            linePointer++;
            wordPointer = 0;
        }
        return numericValue;
    }

    function obtainVector() {
        if (!currentLinesContainer || linePointer >= currentLinesContainer.length) {
            return [];
        }
        const numericVector = currentLinesContainer[linePointer++].split(' ').map(BigInt);
        return numericVector;
    }

    function obtainMatrix(rowsCount, colsCount) { 
        const numericMatrix = [];
        for (let r = 0; r < rowsCount; r++) {
            numericMatrix.push(obtainVector());
        }
        return numericMatrix;
    }

    return {
        setupReader: init,
        pullNumeric: obtainScalar,
        pullVector: obtainVector,
        pullMatrix: obtainMatrix
    };
})();

dataProcessor.setupReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(performMainCalculation());

function performMainCalculation() {
    const totalElements = dataProcessor.pullNumeric(); 
    const requiredMatches = dataProcessor.pullNumeric(); 
    const elementSequence = dataProcessor.pullVector(); 

    const cumulativeTotals = [0n];
    for (let idx = 0; idx < totalElements; idx++) {
        cumulativeTotals.push(cumulativeTotals[idx] + elementSequence[idx]);
    }

    const valueFrequencies = new Map(); 
    let overallMaximumValue = 0n;

    for (let startIdx = 0; startIdx < totalElements; startIdx++) {
        for (let endIdx = startIdx + 1; endIdx <= totalElements; endIdx++) {
            const currentSegmentSum = cumulativeTotals[endIdx] - cumulativeTotals[startIdx];
            valueFrequencies.set(currentSegmentSum, (valueFrequencies.get(currentSegmentSum) || 0) + 1);
            if (currentSegmentSum > overallMaximumValue) {
                overallMaximumValue = currentSegmentSum;
            }
        }
    }

    let finalAccumulatedResult = 0n;
    let currentConsideredValues = new Map(valueFrequencies); 

    let currentBitMagnitude = 0n;
    if (overallMaximumValue > 0n) {
        currentBitMagnitude = 1n << (BigInt(overallMaximumValue.toString(2).length) - 1n);
    } else {
        return 0n;
    }
    
    while (currentBitMagnitude > 0n) {
        let countForThisBit = 0;
        const nextSetOfValues = new Map();

        for (const [sumValue, frequency] of currentConsideredValues.entries()) {
            if ((sumValue & currentBitMagnitude) !== 0n) {
                countForThisBit += frequency;
                nextSetOfValues.set(sumValue, frequency);
            }
        }

        if (countForThisBit >= requiredMatches) {
            finalAccumulatedResult = finalAccumulatedResult | currentBitMagnitude;
            currentConsideredValues = nextSetOfValues;
        }
        
        currentBitMagnitude = currentBitMagnitude >> 1n;
    }

    return finalAccumulatedResult;
}