function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    const inputLines = rawData.split("\n");

    // Parse the first line to get the count of elements
    let arrayLength = parseInt(inputLines[0]);

    // Parse the second line, splitting by space and converting to integers
    let originalArray = inputLines[1].split(" ").map(function(itemStr) {
        return parseInt(itemStr);
    });

    // Create a sorted copy of the array to find medians
    let orderedArray = originalArray.slice().sort(function(valA, valB) {
        return valA - valB; // Ascending numerical sort
    });

    // Determine the two middle elements (medians)
    // Assuming arrayLength is even, N/2-1 and N/2 are the two middle indices
    const lowerMedian = orderedArray[arrayLength / 2 - 1];
    const upperMedian = orderedArray[arrayLength / 2];

    // Iterate through the original array and print the appropriate median
    originalArray.forEach(function(currentValue) {
        // If the current value is less than or equal to the lower median,
        // output the upper median; otherwise, output the lower median.
        console.log(currentValue <= lowerMedian ? upperMedian : lowerMedian);
    });
}

// Read input from standard input and pass it to the processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
