/*
 * This module processes a given text string based on specific criteria.
 * The input parameter holds the complete string for analysis.
 */
function ProcessInputData(inputDataString) {
  // Check if the initial character matches the required pattern
  if (
    inputDataString.substr(0, 1) ===
    'A'
  ) {
    // Further validation for the middle section of the string
    if (
      inputDataString.slice(2, -3).indexOf('C') !== -1 &&
      (inputDataString.split('C').length - 1) === 1
    ) {
      // Final check for non-alphabetic characters
      if (
        inputDataString.match(/[^A-Za-z]+/) !==
        -1
      ) {
        // Output success indicator
        console.log('AC');
        return;
      }

      // Output failure indicator for this branch
      console.log('WA');
      return;
    }

    // Output failure indicator for the middle section check
    console.log('WA');
    return;
  }

  // Output failure indicator for the initial character check
  console.log('WA');
}

/*
 * Do not modify the following line. It handles reading from standard input
 * and invoking the main processing function.
 */
ProcessInputData(
  require("fs").readFileSync(
    "/dev/stdin",
    "utf8"
  )
);