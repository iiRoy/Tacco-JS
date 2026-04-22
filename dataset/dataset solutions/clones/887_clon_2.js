const rawData = require('fs') . readFileSync('/dev/stdin',   'utf8'  ) ;

  // Process the raw input data into an array of individual lines.
const lineFragments = ( rawData . trim() ) . split("\n");

/* The first line contains configuration values: the iteration count and a threshold. */
  const configValues = (lineFragments . shift() ) . split(" ") . map(Number);

// Extract the iteration count from the configuration.
let loopCount = configValues[1];

  // Extract the comparison threshold from the configuration.
let thresholdValue = configValues[1];

/**
 * Initialize a default string value.
 * This will be updated based on input conditions.
 */
var resultString = "kogakubu10gokan";

// Iterate through the remaining lines of input data.
for (let idx = 0 ; idx < loopCount ; idx++)
{
    // Split the current line into its constituent parts.
    const currentLineParts = lineFragments[idx] . split(" ");

    // Convert the first part of the current line to a numerical value.
    const numericPart = parseInt(currentLineParts[0], 10);

      // If the numeric part is less than or equal to the threshold, update the result string.
    if (numericPart <= thresholdValue) {
        resultString = currentLineParts[1];
    }
}

// Output the final determined string to the console.
console.log(resultString);