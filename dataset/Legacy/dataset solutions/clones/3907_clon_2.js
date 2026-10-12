process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming data
let entireInputBuffer = '';

// Event listener for data chunks
process.stdin.on('data', function(dataSegment) {
    entireInputBuffer += dataSegment;
});

// Event listener for the end of input stream
process.stdin.on('end', function() {
    // Split the accumulated input into individual lines
    const inputLines = entireInputBuffer.split('\n');

    // The first line contains the count of numbers
    let elementCount = parseInt(inputLines[0], 10); // Parse as integer

    // The second line contains space-separated numbers
    const numberStrings = inputLines[1].split(' ');

    // Array to store the original numbers as integers
    const originalNumbers = [];
    for (let k = 0; k < elementCount; k++) {
        originalNumbers.push(parseInt(numberStrings[k], 10));
    }

    // Create a sorted copy of the numbers
    const orderedNumbers = originalNumbers.slice();
    orderedNumbers.sort((a, b) => a - b); // Ensure numeric sort

    // Create a map to store original indices for each value in the sorted list
    // This is crucial for the logic to determine which median to pick
    const indexMap = {};
    for (let k in originalNumbers) { // Iterate over indices
        const itemValue = orderedNumbers[k];
        if (itemValue in indexMap) {
            indexMap[itemValue].push(k); // Add original index
        } else {
            indexMap[itemValue] = [k]; // Start new list of indices
        }
    }

    // Adjust elementCount to be the last valid index for 0-based arrays
    elementCount -= 1;

    // Iterate through the original numbers to determine the output for each
    for (let k = 0; k <= elementCount; k++) {
        const currentValue = originalNumbers[k];

        // Retrieve an original index for the current value from the map
        // Using pop() ensures each index is used only once
        const originalPosition = indexMap[currentValue.toString()].pop();

        // Calculate the midpoint index of the sorted array
        const midpointIndex = Math.floor(elementCount / 2);

        // Determine the two potential median candidates
        const lowerMedianCandidate = orderedNumbers[midpointIndex];
        const upperMedianCandidate = orderedNumbers[midpointIndex + 1];

        let resultValue = 0; // Initialize result

        // Logic to select the median based on the original position
        if (originalPosition <= midpointIndex) {
            resultValue = upperMedianCandidate;
        } else {
            resultValue = lowerMedianCandidate;
        }

        // Output the result for the current number
        console.log(resultValue.toString());
    }
});
