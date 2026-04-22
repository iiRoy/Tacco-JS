const decomposeTextualNumbers = (sourceString, currentList = []) => {
    if (sourceString.length === 0) return currentList;
    const separatorPosition = sourceString.indexOf(' ');
    if (separatorPosition === -1) {
        currentList.push(Number(sourceString));
        return currentList;
    }
    currentList.push(Number(sourceString.substring(0, separatorPosition)));
    return decomposeTextualNumbers(sourceString.substring(separatorPosition + 1), currentList);
};

const gatherNumericalPayload = (rawDataBlob) => {
    const contentLines = rawDataBlob.split('\n');
    const quantity = Number(contentLines[0]);
    const valueSeries = decomposeTextualNumbers(contentLines[1]);
    return { sizeParameter: quantity, numericSeries: valueSeries };
};

const determineMidpointElement = (collectionOfValues) => {
    const orderedCollection = [...collectionOfValues].sort((first, second) => first - second);
    const centralIndex = Math.floor(orderedCollection.length / 2);
    return orderedCollection[centralIndex];
};

const extractSegment = (sourceArray, beginIndex, finishIndex, currentSegment = [], indexPointer = beginIndex) => {
    if (indexPointer > finishIndex) {
        return currentSegment;
    }
    currentSegment.push(sourceArray[indexPointer]);
    return extractSegment(sourceArray, beginIndex, finishIndex, currentSegment, indexPointer + 1);
};

const enumerateContiguousCollections = (sourceArray, startIndex = 0, endIndex = 0, accumulatedCollections = []) => {
    if (startIndex >= sourceArray.length) {
        return accumulatedCollections;
    }
    if (endIndex >= sourceArray.length) {
        return enumerateContiguousCollections(sourceArray, startIndex + 1, startIndex + 1, accumulatedCollections);
    }
    accumulatedCollections.push(extractSegment(sourceArray, startIndex, endIndex));
    return enumerateContiguousCollections(sourceArray, startIndex, endIndex + 1, accumulatedCollections);
};

const calculateAllCollectionMidpoints = (inputNumericSeries) => {
    const allPossibleSubarrays = enumerateContiguousCollections(inputNumericSeries);
    const allSubarrayMedians = allPossibleSubarrays.reduce((accumulator, currentSubarray) => {
        accumulator.push(determineMidpointElement(currentSubarray));
        return accumulator;
    }, []);
    return allSubarrayMedians;
};

const performComplexCalculation = (rawDataString) => {
    const { sizeParameter, numericSeries } = gatherNumericalPayload(rawDataString);
    const aggregateMedians = calculateAllCollectionMidpoints(numericSeries);
    const finalResult = determineMidpointElement(aggregateMedians);
    console.log(finalResult);
};

performComplexCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));