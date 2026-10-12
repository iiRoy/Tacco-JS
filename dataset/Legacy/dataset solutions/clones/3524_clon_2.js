function ProcessNumbers(incomingData) {
  // Split the incoming string by spaces to get individual number strings.
  incomingData = incomingData.split(" ");

  // Convert each string to an integer and sort them in descending order.
  incomingData = incomingData.map(currentElement => ~~currentElement).sort((x, y) => y - x);

  // Calculate the final value based on the sorted numbers.
  return incomingData[0] * 10 + incomingData[1] + incomingData[2];
}

// This immediately invoked function expression handles execution environment differences.
((initialPayload, computedResult, resultType) => {
  // Check if running in a Node.js environment by looking for the 'require' function.
  if (typeof require !== "undefined") {
    // If in Node.js, read input from stdin, process it, and log the output.
    console.log(ProcessNumbers(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // Otherwise, assume a browser-like environment or a test harness.
    // Process the embedded string data by removing leading/trailing newlines.
    initialPayload = initialPayload.split("\n").slice(1, -1).join("\n");

    // Execute the main processing logic within a try-catch block to handle potential errors.
    computedResult = (() => {
      try {
        return ProcessNumbers(initialPayload);
      } catch (errorObject) {
        // If an error occurs, return its stack trace or message.
        return errorObject.stack || errorObject.message;
      }
    })();

    // Determine the type of the computed result.
    resultType = typeof computedResult;

    // If the result is not a string, convert it to a JSON string for display purposes.
    if (resultType !== "string") {
      computedResult = JSON.stringify(computedResult);
    }

    // Dynamically create and append HTML elements to display the input, type, and result.
    $("<form>")
      .append(
        [
          [10, initialPayload], // Input data in a textarea
          0,                    // A line break
          [1, resultType],      // Result type in a textarea
          0,                    // Another line break
          [10, computedResult]  // Computed result in a textarea
        ].map(itemDescriptor =>
          $(
            itemDescriptor ? "<textarea>" : "<br>", // Create textarea or br based on descriptor
            itemDescriptor && {
              rows: itemDescriptor[0], // Set rows for textarea
              cols: 40,                // Set columns for textarea
              text: itemDescriptor[1]  // Set text content for textarea
            }
          )
        )
      )
      .appendTo("body"); // Append the form to the document body
  }
})(`
5 2 1
`);
