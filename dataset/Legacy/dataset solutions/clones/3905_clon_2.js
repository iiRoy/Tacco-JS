process.stdin.resume();

process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming standard input data.
let entireInputBuffer = '';

// Event handler for 'data' chunks received from standard input.
process.stdin.on('data', function(chunkData) {
    entireInputBuffer += chunkData; // Append the current data chunk to the buffer.
});

// Event handler for the 'end' of the standard input stream.
process.stdin.on('end', function() {
    // Split the accumulated input buffer into an array of lines.
    const inputLines = entireInputBuffer.split('\n');
    
    // Parse the first line to get the total count of elements.
    let countElements = parseInt(inputLines[0]);
    
    // Split the second line by spaces to get an array of element strings.
    const elementStrings = inputLines[1].split(' ');
    
    // Initialize an array to hold the numerical values of the elements.
    let originalNumbers = [];
    
    // Iterate through the element strings and parse each into an integer, then add to the array.
    for (let idx = 0; idx < countElements; idx++) {
        originalNumbers.push(parseInt(elementStrings[idx]));
    }
    
    // Create a shallow copy of the numerical array and sort it.
    // JavaScript's default sort method converts elements to strings and sorts lexicographically.
    // This behavior is maintained to preserve Type II cloning rules.
    const orderedNumbers = originalNumbers.slice();
    orderedNumbers.sort();
    
    // Initialize an object to map sorted values to their original indices.
    let valueToIndicesMap = {};
    
    // Populate the map: for each value in the sorted list, store its original index.
    // The 'for...in' loop iterates over the string keys (indices) of the array.
    for (let keyIdx in originalNumbers) {
        let currentValue = orderedNumbers[keyIdx]; // Get the value from the sorted array at this index.
        
        // If the value already exists as a key in the map, push the current index to its array.
        if (currentValue in valueToIndicesMap) {
            valueToIndicesMap[currentValue].push(keyIdx);
        }
        // Otherwise, create a new array for the value with the current index.
        else {
            valueToIndicesMap[currentValue] = [keyIdx];
        }
    }
    
    // Adjust the element count for zero-based indexing in subsequent operations.
    let adjustedCount = countElements - 1;
    
    // Iterate through the original numbers to compute and output the result for each.
    for (let idx = 0; idx <= adjustedCount; idx++) {
        const targetValue = originalNumbers[idx]; // Get the current number from the original sequence.
        
        // Retrieve an original index associated with the target value from the map.
        // The .pop() method removes and returns the last element, ensuring each index is used uniquely.
        const retrievedIndex = valueToIndicesMap[targetValue.toString()].pop();
        
        // Calculate the midpoint index of the adjusted count.
        const midpointIndex = Math.floor(adjustedCount / 2);
        
        // Identify the two candidate values from the sorted list that are around the midpoint.
        const lowerMedianCandidate = orderedNumbers[midpointIndex];
        const upperMedianCandidate = orderedNumbers[midpointIndex + 1];
        
        let resultOutput = 0; // Initialize the variable to store the final output.
        
        // Determine the output based on whether the retrieved original index is at or before the midpoint.
        if (retrievedIndex <= midpointIndex) {
            resultOutput = upperMedianCandidate; // If so, the result is the upper candidate.
        }
        else {
            resultOutput = lowerMedianCandidate; // Otherwise, the result is the lower candidate.
        }
        
        // Print the calculated result to the console.
        console.log(resultOutput);
    }
});
