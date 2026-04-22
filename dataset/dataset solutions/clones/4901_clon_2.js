const ProcessInputData = (rawData) => {
    // Divide the incoming string data into an array of lines.
    let lineData = rawData.split('\n');

    // Extract the first numeric quantity from the initial line.
    const initialCount = Number(lineData[0].split(' ')[0]);

    // Retrieve the second numeric quantity from the initial line.
    const typeCount = Number(lineData[0].split(' ')[1]);

    // Parse the second line: split by spaces, then convert each segment into a numerical value.
    let valueList = lineData[1].split(' ').map((elementItem, indexPosition) => {
        // Convert the string representation of a number to its actual numeric type.
        return Number(elementItem);
    });

    // Arrange the list of values in descending sequence.
    valueList.sort((firstValue, secondValue) => {
        // This comparison function results in a descending sort,
        // positioning the highest values at the start of the array.
        return secondValue - firstValue;
    });

    // The largest value is now conveniently located at the beginning of the sorted array.
    const largestElement = valueList[0];

    // Compute the sum of all numerical entries within the list.
    const totalSumOfValues = valueList.reduce((currentSum, nextItem) => currentSum + nextItem, 0);

    // Calculate the final output: twice the largest element, minus one, minus the total sum.
    // The result is then ensured to be non-negative.
    console.log(
        Math.max.apply(
            null,
            [
                (2 * largestElement) - 1 - totalSumOfValues,
                0
            ]
        )
    );
};

// Acquire the complete file content from the standard input stream
// and then initiate the primary data processing routine.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));