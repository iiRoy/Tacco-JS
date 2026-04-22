// This function processes incoming textual data to perform a specific calculation.
function ProcessInputData(rawDataString)
{
    // First, split the entire input string into an array of individual lines.
    let linesArray = rawDataString.split("\n")  ;

    // Parse the first line to extract three integer values.
    // The first value represents the total count of elements.
    let totalElementsCount = parseInt(linesArray[0].split(" ")[0]);

    // The second value is an auxiliary parameter, perhaps for future use or another calculation branch.
    let zetaValue = parseInt(linesArray[0].split(" ")[1])   ;

    // The third value acts as a critical threshold or reference point for comparison.
    let omegaValue = parseInt(linesArray[0].split(" ")[2])     ;

    // Extract the second line, which contains space-separated numbers.
    const stringNumbersArray = linesArray[1].split(" ") ;

    // Initialize the variable that will store the ultimate computed outcome.
    let finalResult = 0 ;

    // Create a new array, pre-filled with zeros, to store parsed numerical data.
    let numericArray = new Array(totalElementsCount).fill(0) ;

    // Iterate through the string numbers and convert them to integers, populating the numeric array.
    for (let idx = 0 ; idx < totalElementsCount ; ++idx)
    {
        numericArray[idx] = parseInt(stringNumbersArray[idx])  ;
    }

    // Initialize variables to track the maximum and minimum values found in the numeric array.
    let currentMaximum = 0;
    let currentMinimum = 1000000000; // Using a sufficiently large number for initial minimum.

    // Loop through the array to determine its actual maximum and minimum elements.
    for (let idx = 0 ; idx < totalElementsCount ; ++idx)
    {
        currentMaximum = Math.max(currentMaximum, numericArray[idx]);
        currentMinimum = Math.min(currentMinimum, numericArray[idx]);
    }

    // Calculate the final result based on specific absolute differences.
    // This involves comparing the maximum element, the last element, and the minimum element with the omegaValue.
    finalResult = Math.max(Math.abs(currentMaximum - omegaValue),
                           Math.abs(currentMaximum - numericArray[totalElementsCount - 1]),
                           Math.abs(numericArray[totalElementsCount - 1] - currentMinimum))   ;

    // Output the calculated final result to the console.
    console.log('%s', finalResult) ;
}

// Invoke the primary processing function, reading input from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8")) ;