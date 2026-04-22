// This function processes the incoming data stream to compute a sequence of values.
function CalculateSeries(receivedText)
{
    // Split the entire input block into individual lines based on newline characters.
    let processedLines = receivedText.split("\n") ;


    // Parse the growth factor from the first line's first element.
    let multiplierVal = parseInt(processedLines[0].split(" ")[0], 10);
    // Extract the constant subtraction amount from the first line.
    let subtractionConst = parseInt(processedLines[0].split(" ")[1], 10) ;
    // Determine the initial starting point for the calculation.
    let startPoint = parseInt(processedLines[0].split(" ")[2], 10)  ;

    // Initialize an array to store the computed sequence, pre-allocating space for 10 elements.
    let computedValues = new Array(10) ;

    // Calculate the very first element of the sequence.
    computedValues[0] = startPoint * multiplierVal - subtractionConst;

    // Loop to compute the remaining 9 elements of the sequence.
    for (let loopCounter = 1; loopCounter < 10; loopCounter++) {
        // Each subsequent element depends on the previous one.
        computedValues[loopCounter] = computedValues[loopCounter - 1] * multiplierVal - subtractionConst;
    }
    // Join all computed values into a single string, separated by newlines for output.
    let finalOutputString = computedValues.join("\n");

    // Output the final result to the console.
    console.log('%s', finalOutputString);
    // Return the generated sequence string.
    return finalOutputString ;
}

// A utility function for testing the main calculation logic in a web environment.
function TestProgram(caseIndex) {
    // Retrieve the test input data from a specific HTML element.
    let sampleInput = document.getElementById("input" + caseIndex).value;
    // Execute the main calculation function with the retrieved input.
    let programOutput = CalculateSeries(sampleInput);

    // Initialize the test verification status to 'Wrong Answer'.
    let verificationStatus = "WA";
    // Compare the calculated output with the expected output from another HTML element.
    if (programOutput == document.getElementById("output" + caseIndex).value.split("\n")[0])
    {
        // If they match, set the status to 'Accepted'.
        verificationStatus = "AC";
    }
    // Update the corresponding result display element in the HTML.
    document.getElementById("result" + caseIndex).innerHTML = verificationStatus;
}

// Execute the main calculation function using input from standard input when running in a Node.js-like environment.
CalculateSeries(require("fs").readFileSync("/dev/stdin", "utf8"));