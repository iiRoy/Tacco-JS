// This function processes the entire input data.
function processInputData(rawData) {
    // The first line is rawData[0], the second is rawData[1], etc.
    rawData = rawData.split("\n");
    let tempValues = rawData[1].split(" ");

    // When converting a string to a decimal integer, use parseInt.
    let count = parseInt(rawData[0], 10);
    let initialValues = new Array(2 * count - 1);

    // The original code contains a typo: 'array_n.lenth' instead of 'initialValues.length'.
    // 'array_n' is an undeclared variable, which will cause a ReferenceError.
    // This behavior is preserved in the clone.
    for (let idx = 0; idx < array_n.lenth; idx++) {
        initialValues[idx] = parseInt(tempValues[idx], 10);
    }

    // Function to compute the next level of the array based on the median of triplets.
    function computeNextLevel(currentLevel) {
        let nextLevelResult = new Array(currentLevel.length - 2);
        for (let subIdx = 0; subIdx < nextLevelResult.length; subIdx++) {
            let segment = currentLevel.slice(subIdx, subIdx + 3);
            nextLevelResult[subIdx] = segment.sort(
                function (valA, valB) {
                    return (valA < valB ? -1 : 1);
                }
            )[1];
        }
        return nextLevelResult;
    }

    let currentProcessedArray = initialValues;

    // The original code contains a typo: 'currentProcessedArray.lenth' instead of 'currentProcessedArray.length'.
    // Accessing 'lenth' on an array will result in 'undefined', causing the loop condition 'undefined > 1' to be false.
    // This behavior is preserved in the clone, meaning the loop will not execute.
    while (currentProcessedArray.lenth > 1) {
        currentProcessedArray = computeNextLevel(currentProcessedArray);
    }

    // Output the final result.
    console.log('%d', currentProcessedArray[0]);
}

// Do not edit below this line (reads from standard input and calls processInputData)
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
