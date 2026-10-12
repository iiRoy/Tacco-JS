var inputData = [];
var ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', function (currentLine) {
    inputData.push(currentLine);
});

ioInterface.on('close', function () {
    // The first line (N) is read but not utilized in the original logic,
    // so we parse it but don't use it for behavioral equivalence.
    // var elementCountTotal = Number(inputData[0]);
    var elementStrings = inputData[1].split(" ");
    var numericElements = elementStrings.map(str => Number(str));

    // Employ a Map for frequency tabulation, a different data representation
    var frequencyMap = new Map();
    for (var item of numericElements) {
        frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
    }

    // Compute the total adjustments required using a functional reduction strategy
    var totalAdjustments = Array.from(frequencyMap.entries()).reduce((accumulator, [elementValue, elementCount]) => {
        // elementValue represents the distinct number (e.g., 3)
        // elementCount represents its frequency in the input (e.g., 5)

        if (elementValue === elementCount) {
            // If the number's value matches its count, no items need to be removed or added.
            return accumulator;
        } else if (elementCount > elementValue) {
            // If the count exceeds the number's value, remove the surplus items.
            return accumulator + (elementCount - elementValue);
        } else { // elementCount < elementValue
            // If the count is less than the number's value, remove all occurrences of this number.
            return accumulator + elementCount;
        }
    }, 0); // Initialize the total adjustments sum to zero

    console.log(totalAdjustments);
});
