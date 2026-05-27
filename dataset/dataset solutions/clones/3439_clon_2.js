function ProcessInput(rawData) {
    // Process the raw input data
    rawData = rawData.split('\n');

    // Extract the count of elements from the first line
    var elementCount = ~~rawData[0];

    // Parse the second line into an array of numbers
    var dataValues = rawData[1].split(' ').map(currentVal => ~~currentVal);

    // Calculate the total sum of all data values
    var totalSum = 0;
    for (var idx = 0; idx < elementCount; idx++) {
        totalSum += dataValues[idx];
    }

    // Transform the array elements into objects containing difference from average and original index
    for (var idx = 0; idx < elementCount; idx++) {
        dataValues[idx] = {
            differenceValue: Math.abs(dataValues[idx] - totalSum / elementCount),
            originalIndex: idx
        };
    }

    // Sort the transformed array based on the difference value
    dataValues = dataValues.sort((itemA, itemB) => itemA.differenceValue - itemB.differenceValue);

    // Return the original index of the element with the smallest difference
    return dataValues[0].originalIndex;
}

// This section handles input/output for different environments.
// It's not part of the core algorithm.

((inputString, executionResult, resultType) =>
    "undefined" !== typeof require ?
    console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"))) :
    [
        inputString = inputString.split('\n').slice(1, -1).join('\n'),
        executionResult = function() {
            try {
                return ProcessInput(inputString);
            } catch (errorObj) {
                return errorObj.stack || errorObj.message;
            }
        }(),
        resultType = typeof executionResult,
        "string" === resultType || (executionResult = JSON.stringify(executionResult)),
        $("<form>").append(
            [
                [10, inputString], 0, [1, resultType], 0, [10, executionResult]
            ].map(elementData =>
                $(elementData ? "<textarea>" : "<br>", elementData && {
                    rows: elementData[0],
                    cols: 40,
                    text: elementData[1]
                })
            )
        ).appendTo("body")
    ]
)(`
5
2 5 2 5 6
`);
