// Function to process a string of numerical values and evaluate a specific mathematical condition.
function processInputValues( inputStringData )
{
    // Divide the received string into an array of string components using space as a delimiter.
    let numericComponents = inputStringData.split(" ");

    // Iterate through the first three components of the array.
    // Convert each component from a string representation to an integer.
    for ( let idx = 0; idx < 3; idx++ )
    {
        numericComponents[idx] = parseInt(numericComponents[idx], 10); // Explicitly specify radix for parsing.
    }

    // Determine the largest numerical value among the three processed components.
    const maximumValue = Math.max(numericComponents[0], numericComponents[1], numericComponents[2]);

    // Compute the aggregate sum of all three numerical components.
    const totalSum = numericComponents[0] + numericComponents[1] + numericComponents[2];

    // Evaluate if twice the maximum value is strictly equal to the total sum.
    // Output "Yes" if the condition holds true, otherwise output "No".
    console.log((maximumValue * 2 === totalSum) ? "Yes" : "No");
}

// Acquire input data by reading the content of standard input synchronously,
// interpreted as a UTF-8 encoded string, and then invoke the processing function.
processInputValues( require('fs').readFileSync('/dev/stdin', 'utf8') );