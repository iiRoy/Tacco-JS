function processInputData(rawDataString) {
    // This function processes raw input text to determine the original positions
    // of elements in a sequence, effectively calculating an inverse permutation.

    // Step 1: Divide the raw input string into individual lines,
    // filtering out any empty lines that might result from extra newlines.
    const allInputLines = rawDataString.split('\n').filter(lineContent => lineContent.trim() !== '');

    // Guard clause: Ensure we have at least two lines of input (count + sequence).
    if (allInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        return;
    }

    // Step 2: Parse the first line to get the total number of elements in the sequence.
    // We trim whitespace and convert it directly to a numeric value.
    const sequenceCount = Number(allInputLines[0].trim());

    // Guard clause: Validate the parsed sequence count.
    if (isNaN(sequenceCount) || sequenceCount <= 0) {
        console.error("Error: Invalid or non-positive sequence count found.");
        return;
    }

    // Step 3: Parse the second line, which contains the sequence of elements.
    // We split by space, convert each part to a number, and prepend a null
    // to make the array 1-indexed for easier alignment with problem logic.
    const originalSequence = [null, ...allInputLines[1].split(' ').map(Number)];

    // Validation: Check if the number of elements in the parsed sequence matches the declared count.
    if (originalSequence.length - 1 !== sequenceCount) {
        console.error("Error: The number of elements in the sequence does not match the declared count.");
        return;
    }

    // Step 4: Initialize an array to store the inverse mapping.
    // It's sized `sequenceCount + 1` to accommodate 1-based indexing for values
    // up to `sequenceCount`, and filled with 0 for consistent initialization.
    const inverseMapping = new Array(sequenceCount + 1).fill(0);

    // Step 5: Iterate through the original sequence to build the inverse mapping.
    // `currentPos` represents the 1-based position in the input sequence.
    for (let currentPos = 1; currentPos <= sequenceCount; currentPos++) {
        // Extract the person's ID (value) at the current position.
        const personId = originalSequence[currentPos];

        // Validation: Check if the personId is a valid number within the expected range.
        if (isNaN(personId) || personId < 1 || personId > sequenceCount) {
            console.error(`Error: Invalid person ID '${personId}' encountered at position ${currentPos}.`);
            return;
        }

        // The value `personId` is the index in the `inverseMapping` array,
        // and its value will be the `currentPos` (original 1-based position).
        inverseMapping[personId] = currentPos;
    }

    // Step 6: Format the result for output.
    // We slice the array from index 1 to exclude the dummy null/0 at index 0,
    // then join the elements with a space.
    console.log(inverseMapping.slice(1).join(' '));
}

// Do not modify this line; it handles reading input from stdin and passing it to the function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));