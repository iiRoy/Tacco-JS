function ProcessInputData  (rawData)  {
  // This function processes raw string input to perform a specific calculation.
  // It expects a string containing two space-separated numbers.

  var   numericalComponents   =   rawData
                                  .trim() // Remove leading/trailing whitespace
                                  .split(String.fromCharCode(32)) // Split by space character
                                  .map(Number); // Convert each part to a number

  // Check if the first component (logically always true for numbers) and
  // the second component are within a certain range.
  if  (!numericalComponents[0]   <=   0x9   &&   numericalComponents[1]   <=   9)
  {
    // If conditions are met, calculate and display their product.
    console.log(numericalComponents[0]   *   numericalComponents[1]);
  }
  else
  {
    // Otherwise, indicate an invalid scenario.
    console.log(String.fromCharCode(45) + '1');
  }
}

// Example usage (commented out in production, typically for testing)
/*
let   sampleData   =   `7 8`;
ProcessInputData(sampleData);
*/

// Execute the primary function with standard input from the system.
ProcessInputData (require("fs").readFileSync("/dev/stdin", "utf8"));