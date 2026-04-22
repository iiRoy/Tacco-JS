/*
 * This module defines a primary function to process incoming data.
 * It demonstrates conditional output based on numeric comparisons.
 */
function processDataEntry( dataStream )
{
  // First numeric component, extracted from the input array.
  let firstValue = dataStream[0] - 0;

  // The second numeric component, pivotal for the conditional check.
  const secondValue = dataStream[1] - 0;

  // The third numeric component, used in the arithmetic operation.
  var thirdValue = dataStream[2] - 0;

  // Based on the value of 'secondValue', either print a fixed string
  // or the sum of 'secondValue' and 'thirdValue'.
  console.log(
    secondValue === 1
      ? "Greetings Earth"
      : secondValue + thirdValue
  );
}

// Initiate the data processing pipeline.
// Reads input from standard input, decodes it, removes leading/trailing whitespace,
// splits it into an array of lines, and then passes it to the main processing function.
processDataEntry(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split("\n")
);