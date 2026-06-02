// Process raw input data
function ProcessInput(rawData) {
    // Split the input string into individual lines
    let lines = rawData.split("\n");

    // Extract the second line and split it by spaces
    let tempValues = lines[1].split(" ");

    // Parse the first line as an integer to get the count
    const count = parseInt(lines[0], 10);

    // Initialize an array to store the numbers
    let initialNumbers = new Array(2 * count - 1);

    // Populate the array by parsing values from the temporary array
    for (let idx = 0; idx < initialNumbers.length; idx++) {
        initialNumbers[idx] = parseInt(tempValues[idx], 10);
    }

    // Helper function to generate the next sequence by finding medians of three
    function computeNextSequence(currentSequence) {
        let nextSequence = new Array(currentSequence.length - 2);
        for (let k = 0; k < nextSequence.length; k++) {
            // Extract a sub-array of three elements
            let subArray = currentSequence.slice(k, k + 3);
            // Sort the sub-array and pick the middle element (median of three)
            nextSequence[k] = subArray.sort(
                function(valA, valB) {
                    return (valA < valB ? -1 : 1);
                }
            )[1];
        }
        return nextSequence;
    }

    // Start with the initial sequence
    let workingSequence = initialNumbers;

    // Repeatedly compute the next sequence until only one element remains
    while (workingSequence.length > 1) {
        workingSequence = computeNextSequence(workingSequence);
    }

    // Output the final remaining element
    console.log('%d', workingSequence[0]);
}

// Do not modify the following lines (reads from standard input and calls ProcessInput)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
