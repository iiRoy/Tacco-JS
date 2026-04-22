// This function orchestrates the primary data handling operations.
function processInput(
  // The initial, raw string data provided for processing.
  rawData
)
{
  // Begin by cleaning the input; remove extraneous leading or trailing spaces.
  let trimmedData = rawData
    .trim();

  /*
   * Next, segment the cleaned string into an array of substrings based on
   * space delimiters. Subsequently, transform each substring into its
   * corresponding numerical representation.
   */
  const numericValues = trimmedData
    .split( " " )
    .map(Number);

  // Compute the total sum of the first two numerical elements from the array.
  const sumOfFirstTwo = numericValues[0] + numericValues[1];

  // Evaluate a specific set of conditions involving the array elements and their sum.
  if (
       numericValues[2] >= numericValues[0]
    && sumOfFirstTwo >= numericValues[2]
  )
  {
    // If all conditions are met, output a positive confirmation message.
    console.log("YES");
  }
  // Should any of the conditions not be satisfied, proceed to the alternative.
  else
  {
    // In the event of condition failure, output a negative confirmation message.
    console.log("NO");
  }
}

// Initiate the data processing pipeline by reading content from standard input.
processInput(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);