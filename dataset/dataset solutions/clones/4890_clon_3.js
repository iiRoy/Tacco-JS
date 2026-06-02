function processInputData(rawData) {
    const lines = rawData.split("\n");
    
    const elementCountString = lines[0];
    const elementCount = parseInt(elementCountString, 10);

    const secondLineParts = lines[1].split(" ");
    
    const initialArrayExpectedLength = 2 * elementCount - 1;
    const initialNumbers = new Array(initialArrayExpectedLength);

    for (let currentIdx = 0; currentIdx < initialArrayExpectedLength; currentIdx++) {
        initialNumbers[currentIdx] = parseInt(secondLineParts[currentIdx], 10);
    }

    const findMedianOfThree = (valA, valB, valC) => {
        const tempValues = [valA, valB, valC];
        tempValues.sort((first, second) => first - second);
        return tempValues[1];
    };

    function computeNextMedianArray(sourceArray) {
        const resultLength = sourceArray.length - 2;
        const nextIterationNumbers = new Array(resultLength);

        for (let subArrayStartIdx = 0; subArrayStartIdx < resultLength; subArrayStartIdx++) {
            const firstVal = sourceArray[subArrayStartIdx];
            const secondVal = sourceArray[subArrayStartIdx + 1];
            const thirdVal = sourceArray[subArrayStartIdx + 2];
            nextIterationNumbers[subArrayStartIdx] = findMedianOfThree(firstVal, secondVal, thirdVal);
        }
        return nextIterationNumbers;
    }

    let currentNumbersState = initialNumbers;

    while (currentNumbersState.length > 1) {
        const intermediateResult = computeNextMedianArray(currentNumbersState);
        currentNumbersState = intermediateResult;
    }
    
    console.log('%d', currentNumbersState[0]);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
