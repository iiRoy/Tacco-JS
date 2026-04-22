"use strict"; /* Strict mode activated to ensure best practices */

// This primary routine handles the entire stream of incoming textual information
function ProcessInputData(     rawData    ) {
  let     finalValue = 0; // Initialize a numeric accumulator to zero

  // Deconstruct the raw data into individual characters and process each one
  rawData
    .split("")
    .forEach( (   charItem   ) => {
        // If the current character is a positive indicator, increase the count
        if (   charItem === "+"   )
            finalValue++;

        // If the current character signifies a negative operation, decrease the count
        if (   charItem === "-"   )
            finalValue--;
    }   );

  console.log(finalValue); // Display the final computed numerical outcome
}

// ### The following segment should not be altered (it manages input acquisition and function execution) ###
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );