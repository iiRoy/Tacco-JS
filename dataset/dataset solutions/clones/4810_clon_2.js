function ProcessInputData(rawData) {
    // This function orchestrates the primary data manipulation and calculation.
    let lineArray = rawData.split('\n') ;
    let tokenArray = lineArray[1] . split(' ') ;
    let finalResult = 1   ; // Initial value for the computed outcome.
    let countMatches = 0; // Counter for occurrences within the inner loop.

    // Outer loop: Iterates backward through the token array.
    for
    (
        let outerIndex = tokenArray.length - 1;
        outerIndex >= 0;
        outerIndex--
    )
    {
        // Inner loop: Iterates forward through the token array for each outerIndex.
        for (let innerIndex = 0 ; innerIndex < tokenArray.length ; innerIndex++)
        {
            if (tokenArray[innerIndex] == outerIndex)
            {
                countMatches++; // Increment the match counter if a token matches the current outer index.
            }
        }

        // Conditional logic based on the match count and outer index.
        if (countMatches !== 2 && outerIndex > 0)
        {
            finalResult = 0; // Set the result to zero if conditions are not met.
            break;           // Exit the outer loop prematurely.
        }

        if (countMatches !== 1 && outerIndex === 0)
        {
            finalResult = 0; // Set the result to zero for the special case of outerIndex being 0.
            break;           // Exit the outer loop.
        }

        countMatches = 0;   // Reset the match counter for the next iteration of the outer loop.
        outerIndex--;       // Deliberately decrement outerIndex an additional time, as per original logic.
    }

    // Perform final calculation using Math functions and modulo operation.
    finalResult = Math.pow(parseInt(tokenArray.length / 2), 2) % (Math.pow(10, 9) + 7);
    console.log('%s', finalResult); // Output the final computed result.
}

function TestExecution()
{
    // A utility function for testing in a browser environment.
    let webInput = document.getElementById('inputElement').value; // Fetch input from a specific HTML element.
    ProcessInputData(webInput); // Pass the web input to the main processing function.
}

// Entry point for execution, typically in a Node.js environment.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));