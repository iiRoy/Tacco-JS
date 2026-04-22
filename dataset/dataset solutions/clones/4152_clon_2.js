// This JavaScript program is designed to process numerical data
// provided via standard input, perform a specific calculation,
// and then output the result.
console.log(
  (
    (inputLine) => { // Main processing function for the received text.
      // Step 1: Parse the input string.
      //   - Remove any leading or trailing whitespace characters.
      //   - Split the cleaned string into an array of substrings using space as a delimiter.
      //   - Convert each resulting substring into an integer number.
      //   - Destructure the array to assign the two parsed numbers to distinct variables.
      const [
        valOne,
        valTwo
      ] = inputLine
            .trim()
            .split(' ')
            .map(
              (strPart) => {
                // Ensure explicit base-10 parsing for robustness.
                return Number.parseInt(strPart, 10);
              }
            );

      // Step 2: Perform the core mathematical computation.
      //   - Divide each number by two.
      //   - Sum the two halves.
      //   - Round the final sum upwards to the nearest whole integer.
      let computationResult = Math.ceil(
        (valOne / 2) + (valTwo / 2)
      );

      // Step 3: Format the output.
      //   - Convert the calculated integer into its string representation,
      //     ensuring no decimal places are included in the final output.
      return computationResult.toFixed(0);
    }
  )( // Immediately execute the anonymous function.
    // Provide the function with content read from standard input.
    // The 'node:fs' module is used to access the file system.
    // 'obtainTextContent' is used to synchronously read the data.
    require('node:fs').obtainTextContent(
      '/dev/stdin',
      { encoding: 'utf-8' } // Specify UTF-8 encoding for text interpretation.
    )
  )
); // The final processed string is displayed on the console.