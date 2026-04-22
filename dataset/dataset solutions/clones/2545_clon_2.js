/* This function orchestrates the processing of input data */
function processInput (  inputString )
{

    // Extract numerical parameters from the input string
    let totalElements = Number(inputString.split("\n")[0].split(" ")[0]); // The total count of elements in the main sequence
    let subArrayLength = Number(inputString.split("\n")[0].split(" ")[1]); // The desired length of the sliding sub-array

    // Parse the second line of the input into an array of integers
    const originalSequence = inputString.split("\n")[1].split(" ").map(elementValue => Number(elementValue)  );

    let transformedSequences = []; // This array will store the string representations of the modified sequences
    // Iterate through the original sequence, creating sliding windows for manipulation
    for (let startIndex = 0; startIndex < totalElements - subArrayLength + 1; startIndex++   )
    {
        // Extract the current segment (window) of the sequence based on the current starting index
        let currentWindow = originalSequence.slice(startIndex, startIndex + subArrayLength);

        // Sort this extracted segment in ascending numerical order
        currentWindow.sort(numericSorter);

        // Reconstruct the full sequence: prefix + sorted segment + suffix
        // Then convert the entire resultant array to a comma-separated string for later comparison
        transformedSequences[startIndex] = originalSequence.slice(0, startIndex)
                                       .concat(currentWindow)
                                       .concat(originalSequence.slice(startIndex + subArrayLength))
                                       .join(',');
    }


    // Utilize a Set data structure to efficiently count the number of unique sequences generated
    const distinctArrangements = new Set(transformedSequences);

    // Output the final count of unique arrangements to the console
    console.log(distinctArrangements.size);
}

// Function call to initiate the processing, reading input from the standard input stream
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));


/* A utility function designed for sorting numerical values in ascending order */
function numericSorter( valA, valB )
{ // Helper callback for array.sort() method
    return valA - valB; // Standard numerical comparison for ascending order
}