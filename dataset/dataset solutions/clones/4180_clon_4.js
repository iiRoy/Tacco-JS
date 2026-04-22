const parseAndAnalyze = (sourceText) => {
    const contentLines = sourceText.trim().split('\n');
    const elementCount = parseInt(contentLines[0].split(' ')[0], 10);
    const numericElements = contentLines[1].split(' ').map(val => parseInt(val, 10));

    const minimumValue = Math.min(...numericElements);
    const maximumValue = Math.max(...numericElements);
    const minimumPosition = numericElements.indexOf(minimumValue);
    const maximumPosition = numericElements.indexOf(maximumValue);

    return {
        sizeDescriptor: elementCount,
        initialSequence: [...numericElements],
        extremumData: {
            valMin: minimumValue,
            idxMin: minimumPosition,
            valMax: maximumValue,
            idxMax: maximumPosition
        }
    };
};

const processAscendingOrder = (inputSequence) => {
    let currentWorkingSequence = [...inputSequence];
    const generatedOperations = [];

    currentWorkingSequence.reduce((previousItem, currentItem, currentItemIndex) => {
        if (currentItemIndex > 0 && currentItem < previousItem) {
            generatedOperations.push([currentItemIndex, currentItemIndex + 1]);
            currentWorkingSequence[currentItemIndex] = previousItem + currentItem;
        }
        return currentWorkingSequence[currentItemIndex];
    }, currentWorkingSequence[0]);

    return { resultantSequence: currentWorkingSequence, operationsLog: generatedOperations };
};

const processDescendingOrder = (inputSequence) => {
    let currentWorkingSequence = [...inputSequence];
    const generatedOperations = [];

    let currentIdx = currentWorkingSequence.length - 2;
    while (currentIdx >= 0) {
        if (currentWorkingSequence[currentIdx] > currentWorkingSequence[currentIdx + 1]) {
            generatedOperations.push([currentIdx + 2, currentIdx + 1]);
            currentWorkingSequence[currentIdx] = currentWorkingSequence[currentIdx + 1] + currentWorkingSequence[currentIdx];
        }
        currentIdx--;
    }
    return { resultantSequence: currentWorkingSequence, operationsLog: generatedOperations };
};

const manageDominantHighest = (inputSequence, extremumInfo) => {
    const highestMagnitudeVal = extremumInfo.valMax;
    const highestMagnitudePos = extremumInfo.idxMax;

    const { interimSequence, interimOperations } = inputSequence.reduce((accumulator, value, index) => {
        if (index !== highestMagnitudePos) {
            accumulator.interimSequence.push(value + highestMagnitudeVal);
            accumulator.interimOperations.push([highestMagnitudePos + 1, index + 1]);
        } else {
            accumulator.interimSequence.push(value);
        }
        return accumulator;
    }, { interimSequence: [], interimOperations: [] });

    const { resultantSequence, operationsLog } = processAscendingOrder(interimSequence);
    return { resultantSequence, operationsLog: interimOperations.concat(operationsLog) };
};

const manageDominantLowest = (inputSequence, extremumInfo) => {
    const lowestMagnitudeVal = extremumInfo.valMin;
    const lowestMagnitudePos = extremumInfo.idxMin;

    const { interimSequence, interimOperations } = inputSequence.reduce((accumulator, value, index) => {
        if (index !== lowestMagnitudePos) {
            accumulator.interimSequence.push(value + lowestMagnitudeVal);
            accumulator.interimOperations.push([lowestMagnitudePos + 1, index + 1]);
        } else {
            accumulator.interimSequence.push(value);
        }
        return accumulator;
    }, { interimSequence: [], interimOperations: [] });

    const { resultantSequence, operationsLog } = processDescendingOrder(interimSequence);
    return { resultantSequence, operationsLog: interimOperations.concat(operationsLog) };
};

function performSequenceTransformation(rawDataString) {
    const { sizeDescriptor, initialSequence, extremumData } = parseAndAnalyze(rawDataString);
    const { valMin, valMax } = extremumData;

    const strategyDispatch = new Map();
    strategyDispatch.set('allPositive', () => processAscendingOrder(initialSequence));
    strategyDispatch.set('allNegative', () => processDescendingOrder(initialSequence));
    strategyDispatch.set('maxAbsoluteDominant', () => manageDominantHighest(initialSequence, extremumData));
    strategyDispatch.set('minAbsoluteDominant', () => manageDominantLowest(initialSequence, extremumData));

    let selectedStrategyKey;
    if (valMin >= 0) {
        selectedStrategyKey = 'allPositive';
    } else if (valMax < 0) {
        selectedStrategyKey = 'allNegative';
    } else if (valMax > Math.abs(valMin)) {
        selectedStrategyKey = 'maxAbsoluteDominant';
    } else {
        selectedStrategyKey = 'minAbsoluteDominant';
    }

    const { operationsLog: finalOperationList } = strategyDispatch.get(selectedStrategyKey)();

    const resultLines = [finalOperationList.length.toString()];
    finalOperationList.forEach(opPair => resultLines.push(opPair.join(' ')));
    return resultLines.join('\n');
}

const entryPoint = (dataInput) => {
    const finalResultOutput = performSequenceTransformation(dataInput);
    console.log(finalResultOutput);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));