function processInputData(rawTextContent) {
    /* This function takes raw text input, processes it, and prints a result. */

    const inputLines = rawTextContent.split('\n') ; // Split the entire input into individual lines.

    const elementCount = parseInt(inputLines[0], 10) ; // Parse the first line to get the number of elements.
    let numericValues = inputLines[1].split(' ') .map(strNum => parseInt(strNum, 10)) ; // Parse the second line into an array of integers.

    let tempCounter = 0; /* An auxiliary variable, currently not utilized in the main logic. */
    let finalSum = 0; // Initialize the variable that will store the computed sum.

    // Sort the array of numeric values in ascending order.
    numericValues = numericValues.sort((firstVal, secondVal) => firstVal - secondVal);

    if (elementCount === 1) {
        // Special case: if there's only one element, assign the second element (index 1) to the sum.
        // This assumes the input format or problem context ensures `numericValues[1]` is accessible.
        finalSum = numericValues[1] ;
    }
    else {
        // For multiple elements, iterate and sum specific elements based on the element count.
        for ( let loopIndex = elementCount; loopIndex <= ( (2 * elementCount) - 1 ) ; loopIndex++ ) {
            finalSum += numericValues[loopIndex] ; // Add the value at the current index to the running total.
        }
    }

    console.log(finalSum) ; // Output the calculated final sum.
}

// Read input from standard input and pass it to the processing function.
processInputData( require('fs') .readFileSync('/dev/stdin', 'utf8') ) ;