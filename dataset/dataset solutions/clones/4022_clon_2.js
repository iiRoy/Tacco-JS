/*
 * This module is responsible for analyzing numerical input.
 * It checks if a derived value meets a specified threshold.
 */
function processInput(    inputDataString    ) {
  // Obtain the primary numeric value from the first line of the input.
  const itemCost = Number.parseInt(    inputDataString.split("\n")[0]    );
  // Extract the secondary numeric constraint from the second line.
  const allowedDelta = Number.parseInt(    inputDataString.split("\n")[1]    );

  // Perform a comparison: Is the remainder of itemCost divided by 500 less than or equal to allowedDelta?
  console.info(    (itemCost % 500) <= allowedDelta ? "AFFIRMATIVE" : "NEGATIVE"    );
}

// Initiate the processing by reading content from standard input.
processInput(    require('node:fs').readFileSync('/dev/stdin', 'utf8')    );