// This JavaScript module performs a specific validation check on a sequence of numerical values.
// The primary goal is to determine if a series of height adjustments is feasible under given constraints.
function ExecuteVerification(  inputDataRows  )
{
  // First, extract the total number of items from the initial line of input.
  // The base for parsing is decimal (10).
  let elementCount =  Number.parseInt( inputDataRows[0],   10   );

  /*
   * Next, process the subsequent lines of the input array.
   * These lines represent the individual height measurements.
   * The .slice(1) method creates a new array starting from the second element,
   * effectively skipping the count.
   * The .map() function then converts each string measurement into an integer.
   */
  const heightMeasurements = inputDataRows.slice(1).map(  ( singleMeasurementString  ) =>
    Number.parseInt(  singleMeasurementString,  10  )
  );

  // Initialize a variable to track the maximum allowed height at the current position.
  // It starts with the value of the very first height measurement.
  let currentPermissibleHeight = heightMeasurements[0];

  // Commence an iterative process through the height measurements,
  // beginning from the second element (index 1) up to, but not including, the total count.
  for (  let loopIndex = 1; loopIndex < elementCount; loopIndex++  )
  {
    // Condition 1: Check if the present allowed height is exactly equal to the next measured height.
    if (  currentPermissibleHeight === heightMeasurements[loopIndex]  )
    {
      // If they are identical, the allowed height remains unchanged for the next step.
      currentPermissibleHeight = heightMeasurements[loopIndex];
    }
    // Condition 2: If not identical, check if the present allowed height is less than or equal to
    // the next measured height minus one. This represents a permissible downward adjustment.
    else if (  currentPermissibleHeight <= heightMeasurements[loopIndex] - 1  )
    {
      // If this condition is met, the allowed height is adjusted to be one less than the current measurement.
      currentPermissibleHeight = heightMeasurements[loopIndex] - 1;
    }
    // Condition 3: If neither of the above conditions is satisfied, it implies an invalid sequence.
    else
    {
      // Output a 'Failure' message to the console and immediately exit the function,
      // as the sequence is determined to be non-compliant.
      return console.info('Failure');
    }
  }

  // Should the loop complete without encountering any invalid conditions,
  // it signifies that the entire sequence of height adjustments is permissible.
  // In this case, a 'Success' message is outputted to the console.
  console.info('Success');
}


// This section handles the program's entry point and input acquisition.

// First, obtain a reference to the Node.js 'fs' (file system) module.
const fileSystemModule = require("fs");

// Read the content from standard input synchronously.
// The content is expected to be UTF-8 encoded.
// After reading, leading and trailing whitespace are removed from the entire string.
// Finally, the string is split into an array of substrings using one or more
// newline, carriage return, tab, or space characters as delimiters.
const processedInputContent = fileSystemModule.readFileSync(
  "/dev/stdin", // Specifies the standard input stream path in Unix-like systems.
  "utf-8"       // Defines the character encoding for the input data.
)
.trim()         // Removes any whitespace characters from the start and end of the string.
.split(  /[\n\r\t ]+/  ); // Splits the string into an array by any combination of whitespace.

// Invoke the main processing function, passing the prepared array of input strings.
ExecuteVerification(processedInputContent);