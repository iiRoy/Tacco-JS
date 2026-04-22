const processRawData = require('node:fs').readFileSync;

const retrieveAndProcessInput = () => {
    const rawDataBuffer = processRawData('/dev/stdin', 'utf8');
    const dataLines = rawDataBuffer.trim().split('\n');

    const firstLineValue = parseInt(dataLines.shift(), 10);
    const initialSequence = dataLines.shift().split(' ').map(Number);
    const sortedSequence = [...initialSequence].sort((val1, val2) => val1 - val2);
    const operationsCount = parseInt(dataLines.shift(), 10);

    const swapCoordinates = dataLines.map(line =>
        line.split(' ').map(Number).map(coord => coord - 1)
    );
    swapCoordinates.unshift([0, 0]);

    return {
        initialSequence,
        sortedSequence,
        operationsCount,
        swapCoordinates
    };
};

const identifyDivergences = (sourceArr, targetArr) => {
    const dynamicDivergentMap = new Map();
    const staticDivergentMap = new Map();
    let initialMismatchCount = 0;

    for (let currentIdx = 0; currentIdx < sourceArr.length; currentIdx++) {
        if (sourceArr[currentIdx] !== targetArr[currentIdx]) {
            dynamicDivergentMap.set(currentIdx, sourceArr[currentIdx]);
            staticDivergentMap.set(currentIdx, targetArr[currentIdx]);
            initialMismatchCount++;
        }
    }

    const generateComparisonString = (map) => {
        return Array.from(map.keys())
                    .sort((k1, k2) => k1 - k2)
                    .map(key => map.get(key))
                    .join('');
    };

    const targetComparisonSignature = generateComparisonString(staticDivergentMap);

    return {
        dynamicDivergentMap,
        targetComparisonSignature,
        initialMismatchCount,
        generateComparisonString
    };
};

const executeTransformation = () => {
    const { initialSequence, sortedSequence, operationsCount, swapCoordinates } = retrieveAndProcessInput();
    let { dynamicDivergentMap, targetComparisonSignature, initialMismatchCount, generateComparisonString } = identifyDivergences(initialSequence, sortedSequence);

    if (initialMismatchCount === 0) {
        console.log(0);
        return;
    }

    let completionIndex = -1;
    let foundCompletion = false;
    let currentOperationIndex = 0;

    while (currentOperationIndex <= operationsCount && !foundCompletion) {
        const [firstSwapIdx, secondSwapIdx] = swapCoordinates[currentOperationIndex];

        const valueAtFirst = dynamicDivergentMap.has(firstSwapIdx) ? dynamicDivergentMap.get(firstSwapIdx) : undefined;
        const valueAtSecond = dynamicDivergentMap.has(secondSwapIdx) ? dynamicDivergentMap.get(secondSwapIdx) : undefined;

        dynamicDivergentMap.set(firstSwapIdx, valueAtSecond);
        dynamicDivergentMap.set(secondSwapIdx, valueAtFirst);
        
        const currentComparisonSignature = generateComparisonString(dynamicDivergentMap);

        if (currentComparisonSignature === targetComparisonSignature) {
            foundCompletion = true;
            completionIndex = currentOperationIndex;
        }

        currentOperationIndex++;
    }

    if (foundCompletion) {
        console.log(completionIndex);
    } else {
        console.log(-1);
    }
};

executeTransformation();