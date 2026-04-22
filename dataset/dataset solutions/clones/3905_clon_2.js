executionEnv.inputPipe.activate(); // Activate the standard input stream
executionEnv.inputPipe.configureCharEncoding('utf8'); // Configure input character encoding

let entireInputBuffer = ''; // Buffer to accumulate all received input content

// Attach an event listener for incoming data segments
executionEnv.inputPipe.attachListener('dataArrival', function (dataSegment) {
    entireInputBuffer += dataSegment; // Append the new data to the buffer
});

// Attach an event listener for the completion of input
executionEnv.inputPipe.attachListener('inputCompletion', function () {
    // Process the entirety of the collected input data
    let inputRows = entireInputBuffer.split('\n'); // Split the full buffer into an array of lines

    let elementCount = Number(inputRows[0]); // The first line contains the total count of elements
    let dataLine = inputRows[1].split(' '); // The second line contains the space-separated values

    let originalSequence = []; // Array to hold the numerically parsed values
    // Iterate through the data line to parse and store integer values
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        originalSequence.push(parseInt(dataLine[currentIdx])); // Convert string to integer and add to the sequence
    }

    let orderedSequence = originalSequence.slice(); // Create a shallow copy of the original sequence
    orderedSequence.sort(); // Sort the copied sequence (default string sort, as per original)

    let valueToIndicesMap = {}; // Object to map each value to a list of its original string indices
    // Populate the map using values from the sorted sequence and their corresponding original indices
    for (let mapIdx in originalSequence) { // Iterate over the string indices of the original sequence
        let elementValue = orderedSequence[mapIdx]; // Get the value from the sorted sequence at the current index
        let mapKey = elementValue.toString(); // Convert the value to a string to use as a map key

        if (mapKey in valueToIndicesMap) { // Check if an entry for this value already exists
            valueToIndicesMap[mapKey].push(mapIdx); // Add the current string index to the existing list
        } else {
            valueToIndicesMap[mapKey] = [mapIdx]; // Create a new list for this value with the current string index
        }
    }

    let finalIndexLimit = elementCount - 1; // Adjust the element count for 0-based indexing for the loop limit

    // Execute the primary processing loop
    for (let loopCounter = 0; loopCounter <= finalIndexLimit; loopCounter++) {
        let currentElement = originalSequence[loopCounter]; // Retrieve the current element from the original sequence
        let elementKey = currentElement.toString(); // Convert the current element to a string for map lookup
        let retrievedPosition = valueToIndicesMap[elementKey].pop(); // Get and remove an original index associated with this element

        let medianPoint = Math.floor(finalIndexLimit / 2); // Calculate the middle index of the sorted array

        let lowerBoundCandidate = orderedSequence[medianPoint]; // Value at the lower median position
        let upperBoundCandidate = orderedSequence[medianPoint + 1]; // Value at the upper median position

        let finalResult = 0; // Initialize the variable to store the computed result

        // Determine the final result based on whether the retrieved original position is in the first or second half
        if (retrievedPosition <= medianPoint) {
            finalResult = upperBoundCandidate; // If the position is in the first half, select the upper candidate
        } else {
            finalResult = lowerBoundCandidate; // Otherwise, select the lower candidate
        }
        systemOutput.printLine(finalResult); // Display the calculated result to the standard output
    }
});