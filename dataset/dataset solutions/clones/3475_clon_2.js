function parseInteger (valueString) {
    // Converts a given string value into its integer representation.
    return parseInt(valueString);
}


function calculateAbsoluteDifferenceSum (numberSequence) {
    let totalDifference = 0; // Accumulates the absolute differences between consecutive numbers.

    for (let idx = 0; idx < numberSequence.length - 1; idx++) {
        totalDifference += Math.abs(numberSequence[idx] - numberSequence[idx + 1]);
    }

    return totalDifference;
}


function arrangeCollection (processingMode, sourceCollection, targetSize) {
    let processedList = []; // This list will store the elements arranged according to the logic.

    while (processedList.length < targetSize) {

        if (processingMode === 'min') {
            // Logic for 'min' mode processing, typically taking from the start of sourceCollection.
            if (processedList.length === 0) {
                // If the target list is empty, simply add the first element from the source.
                processedList.push(sourceCollection[0]);
                sourceCollection.shift();
            } else {
                // Compare the absolute difference of the first and last elements in the processed list
                // with the current first element of the source collection.
                if (Math.abs(processedList[0] - sourceCollection[0]) > Math.abs(processedList[processedList.length - 1] - sourceCollection[0])) {
                    processedList.unshift(sourceCollection.shift()); // Add to the beginning.
                    if (processedList.length !== targetSize) {
                        processedList.push(sourceCollection.shift()); // Fill remaining slot if not yet full.
                    }
                } else {
                    processedList.push(sourceCollection.shift()); // Add to the end.
                    if (processedList.length !== targetSize) {
                        processedList.unshift(sourceCollection.shift()); // Fill remaining slot if not yet full.
                    }
                }
            }
            processingMode = 'max'; // Switch the mode for the next iteration.
        }
        else { // processingMode === 'max'
            // Logic for 'max' mode processing, typically taking from the end of sourceCollection.
            if (processedList.length === 0) {
                // If the target list is empty, add the last element from the source.
                processedList.push(sourceCollection.pop());
            } else {
                // Compare the absolute difference of the first and last elements in the processed list
                // with the current last element of the source collection.
                if (Math.abs(processedList[0] - sourceCollection[sourceCollection.length - 1]) > Math.abs(processedList[processedList.length - 1] - sourceCollection[sourceCollection.length - 1])) {
                    processedList.unshift(sourceCollection.pop()); // Add to the beginning.
                    if (processedList.length !== targetSize) {
                        processedList.push(sourceCollection.pop()); // Fill remaining slot if not yet full.
                    }
                } else {
                    processedList.push(sourceCollection.pop()); // Add to the end.
                    if (processedList.length !== targetSize) {
                        processedList.unshift(sourceCollection.pop()); // Fill remaining slot if not yet full.
                    }
                }
            }
            processingMode = 'min'; // Switch the mode for the next iteration.
        }
    }
    return processedList; // Return the final constructed list.
}


function ExecuteProgram (rawData) {
    // Split the input string by newlines and convert each line to an integer.
    const parsedNumbers = rawData.split("\n").map(parseInteger);

    // The first element of the input determines the number of subsequent elements to process.
    const countElements = parsedNumbers[0];

    // Create a new array containing only the numeric data, excluding the initial count.
    const numericArray = [];
    for (let iterator = 0; iterator < countElements; iterator++) {
        numericArray.push(parsedNumbers[iterator + 1]);
    }

    // Sort the collected numeric data in ascending order to ensure proper processing.
    numericArray.sort((a, b) => a - b);

    // Calculate the first result using the 'min' arrangement strategy.
    // A shallow copy of the numericArray is passed to prevent modification of the original.
    let firstResult = calculateAbsoluteDifferenceSum(arrangeCollection('min', [].concat(numericArray), countElements));

    // Calculate the second result using the 'max' arrangement strategy.
    // Another shallow copy is used for this calculation.
    let secondResult = calculateAbsoluteDifferenceSum(arrangeCollection('max', [].concat(numericArray), countElements));

    // Print the larger of the two calculated results to the console.
    if (firstResult > secondResult) {
        console.log(firstResult);
    } else {
        console.log(secondResult);
    }
}

// Read input from standard input and initiate the program execution.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));