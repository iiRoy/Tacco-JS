var inputLines = [];
var ioHandler = require('readline');

var lineReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineReader.on('close', function () {
    // The first line (N) is read but not directly used in the calculation,
    // but its reading is preserved for behavioral equivalence.
    var numElements = +inputLines[0]; 
    var dataArray = inputLines[1].split(" ").map(strVal => +strVal);

    // Use a Map object for frequency counting, a structural change from plain object.
    const frequencyMap = new Map();
    for (const currentNum of dataArray) {
        // Initialize count to 0 if not present, then increment.
        frequencyMap.set(currentNum, (frequencyMap.get(currentNum) || 0) + 1);
    }

    let totalAdjustment = 0;
    // Iterate through the Map entries using a for...of loop with destructuring,
    // a structural change from Object.keys().forEach().
    for (const [keyNum, countVal] of frequencyMap.entries()) {
        // Map keys preserve their original type (number in this case),
        // so no explicit Number() conversion is needed.
        const currentKey = keyNum; 
        const currentCount = countVal;

        // Check if the number's value (currentKey) is different from its count (currentCount).
        if (currentKey !== currentCount) {
            // Introduce a helper variable for the difference, an intermediate computation step.
            const difference = currentCount - currentKey;

            if (difference > 0) { // If currentCount is greater than currentKey
                // We have too many occurrences; add the excess to totalAdjustment.
                totalAdjustment += difference;
            } else { // If currentCount is less than currentKey (since they are not equal)
                // We have too few; add all existing occurrences to totalAdjustment,
                // implying they all need to be changed or removed.
                totalAdjustment += currentCount;
            }
        }
    }

    console.log(totalAdjustment);
});
