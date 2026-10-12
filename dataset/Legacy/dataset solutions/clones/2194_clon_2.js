function ProcessInput(rawData) {
    // The raw input string is split into an array of lines.
    rawData = rawData.split("\n");

    // The second line of the input contains the sequence of numbers.
    let secondLineData = rawData[1];

    // The first line contains two space-separated integers.
    let firstLineParts = rawData[0].split(" ");

    // Parse the first integer from the first line as the total count of elements.
    let totalElements = parseInt(firstLineParts[0], 10);

    // Parse the second integer from the first line as the number of elements to disregard.
    let elementsToDisregard = parseInt(firstLineParts[1], 10);

    // Initialize a variable to store the accumulated sum.
    let accumulatedSum = 0;

    // Evaluate different scenarios based on the parsed integers.
    if (totalElements <= elementsToDisregard) {
        // If the total number of elements is less than or equal to the elements to disregard, output "0".
        console.log("0");
    } else if (elementsToDisregard === 0) {
        // If no elements are to be disregarded, sum all numbers from the second line.
        let numericStrings = secondLineData.split(" ");
        // This loop contains a bug from the original code: 'loopVarJ' is initialized,
        // but 'loopVarI' is used in the increment and array access.
        // 'loopVarJ' and 'loopVarI' are not declared with 'let' or 'var' to preserve the original's behavior
        // (e.g., implicit global declaration in non-strict mode, or ReferenceError in strict mode).
        for (loopVarJ = 0; loopVarJ < numericStrings.length; loopVarI++) {
            accumulatedSum += numericStrings[loopVarI];
        }
    } else {
        // If elements need to be disregarded, process the remaining ones.
        let numericStrings = secondLineData.split(" ");

        // Sort the array of numeric strings in descending lexicographical order.
        numericStrings.sort(function(valueA, valueB) {
            // If valueA is lexicographically smaller than valueB, place valueA after valueB.
            return (valueA < valueB ? 1 : -1);
        });

        // Iterate from the index corresponding to 'elementsToDisregard' up to 'totalElements'.
        // The loop variable 'currentIdx' starts with the value of 'elementsToDisregard'.
        for (let currentIdx = elementsToDisregard; currentIdx < totalElements; currentIdx++) {
            // Convert each string element to an integer and add it to the accumulated sum.
            accumulatedSum += parseInt(numericStrings[currentIdx], 10);
        }
        // Output the final accumulated sum.
        console.log('%d', accumulatedSum);
    }
}

// The following line is for standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
