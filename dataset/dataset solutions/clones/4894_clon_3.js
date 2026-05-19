const numericAscendingSort = (valA, valB) => (valA < valB ? -1 : 1);

function generateNextLevel(currentArr) {
    const nextArrLength = currentArr.length - 2;
    const nextWorkingArray = new Array(nextArrLength);

    for (let subArrIndex = 0; subArrIndex < nextArrLength; subArrIndex++) {
        const threeElementSlice = currentArr.slice(subArrIndex, subArrIndex + 3);
        nextWorkingArray[subArrIndex] = threeElementSlice.sort(numericAscendingSort)[1];
    }
    return nextWorkingArray;
}

function processInputData(rawData) {
    const lines = rawData.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const initialValuesStr = lines[1].split(" ");
    
    // Correctly parse initial values to numbers.
    // The original code had a typo (array_n.lenth) which prevented this loop from running,
    // and also assigned strings instead of numbers. This fix assumes the intended behavior
    // was to parse numbers and populate the array correctly for the median-finding algorithm.
    const initialNumericArray = initialValuesStr.map(Number);

    let currentWorkingArray = initialNumericArray;

    while (currentWorkingArray.length > 1) {
        currentWorkingArray = generateNextLevel(currentWorkingArray);
    }
    
    console.log('%d', currentWorkingArray[0]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
