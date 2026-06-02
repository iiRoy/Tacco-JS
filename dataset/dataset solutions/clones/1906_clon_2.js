function processInputData(rawData) {
    // Split the raw input string into an array of lines
    const inputLines = rawData.split('\n');

    // Extract the first number, converting it to a numeric type
    let totalElements = inputLines.shift() * 1.0;

    // Extract the second line, split by space, and map each part to a number
    const elementHeights = inputLines.shift().split(' ').map(currentValue => currentValue * 1.0);

    // Initialize a counter for matching pairs
    let matchingPairs = 0.0;

    // Iterate through the elements using an outer loop
    for (let outerIndex = totalElements; outerIndex >= 1.0; outerIndex--) {
        // Iterate through the elements using an inner loop
        for (let innerIndex = totalElements; innerIndex >= 1.0; innerIndex--) {
            // Ensure we are not comparing an element with itself
            if (outerIndex !== innerIndex) {
                // Calculate the absolute difference between the current indices
                const absoluteDifference = Math.abs(outerIndex - innerIndex);

                // Calculate the sum of heights for the current pair of elements
                const heightSum = elementHeights[outerIndex - 1] + elementHeights[innerIndex - 1];

                // Check if the absolute difference equals the sum of heights
                if (absoluteDifference === heightSum) {
                    // Increment the counter if the condition is met
                    matchingPairs++;
                }
            }
        }
    }
    // Output the final result, which is half of the total matching pairs
    console.log(matchingPairs * (1 / 2));
}

// Read input from standard input and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
