// Define a primary function to handle the entire processing flow.
function processInputData(rawDataContent)
{
    // Break down the raw input string into individual text lines.
    let textLines = rawDataContent.split('\n');

    // Extract the primary quantity from the first line, which is the first numeric item.
    let primaryQuantity = Number(textLines[0].split(' ')[0]);

    // Obtain the secondary quantity from the same first line, the second numeric item.
    let secondaryQuantity = Number(textLines[0].split(' ')[1]);

    // Parse the second line into an array of integer values.
    // This variable maintains structural similarity to the original, though its value isn't used in the calculation.
    let numericalSeries = textLines[1].split(' ').map(strVal => Number(strVal));


    // Perform the core calculation based on the primary and secondary quantities.
    // This mathematical formula computes a specific outcome related to division and rounding up.
    let calculatedOutcome = Math.ceil((primaryQuantity - secondaryQuantity) / (secondaryQuantity - 1)) + 1;

    // Output the final computed value to the standard console.
    console.log(calculatedOutcome);
}


// Invoke the main processing function with data read from the standard input stream.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));