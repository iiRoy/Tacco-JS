function ProcessInput(rawData) {
  // This function processes a string of space-separated numbers.
  // It converts them to integers and checks if they exceed a certain limit.

  // Split the input string by spaces and convert each part to an integer.
  // The '~~' operator is a concise way to perform a floor-like integer conversion.
  let parsedValues = rawData.split(" ").map(itemVal => ~~itemVal);

  // Check if the first number is greater than 8.
  if (parsedValues[0] > 8) {
    return ":("; // If it is, return a specific error message.
  }

  // Check if the second number is greater than 8.
  if (parsedValues[1] > 8) {
    return ":("; // If it is, return the same error message.
  }

  // If neither number exceeds 8, return a success message.
  return "Yay!";
}

// This immediately invoked function expression (IIFE) handles the execution context.
// It supports both Node.js (reading from stdin) and browser environments (using a default input).
((initialData, resultOutput, resultType) => {
  // Check if the 'require' function is defined, indicating a Node.js environment.
  if (typeof require !== "undefined") {
    // In Node.js, read the input from standard input using the 'fs' module.
    // Then, pass this input to the main processing function and log the result.
    console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // In a browser or non-Node.js environment, process the default input.
    // The default input string is trimmed to remove leading/trailing newlines.
    initialData = initialData.split("\n").slice(1, -1).join("\n");

    // Execute the main processing logic within a try-catch block.
    // This ensures that any errors during processing are caught and displayed.
    resultOutput = (function() {
      try {
        return ProcessInput(initialData);
      } catch (errorObj) {
        // If an error occurs, return its stack trace or message for debugging.
        return errorObj.stack || errorObj.message;
      }
    })(); // The anonymous function is immediately called.

    // Determine the data type of the processing result.
    resultType = typeof resultOutput;

    // If the result is not a string, convert it to a JSON string for display purposes.
    if (resultType !== "string") {
      resultOutput = JSON.stringify(resultOutput);
    }

    // This part uses jQuery (assuming it's loaded in the browser) to display the input and output.
    // It creates a form and appends textareas and line breaks to show the data.
    $("<form>")
      .append(
        [
          [10, initialData], 0, // Display initial data in a textarea with 10 rows.
          [1, resultType], 0, // Display result type in a textarea with 1 row.
          [10, resultOutput] // Display the final result in a textarea with 10 rows.
        ].map(elementConfig =>
          $(
            elementConfig ? "<textarea>" : "<br>", // If elementConfig exists, create textarea; otherwise, a line break.
            elementConfig && {
              rows: elementConfig[0], // Set rows based on the first array element.
              cols: 40, // Fixed column width.
              text: elementConfig[1] // Set textarea content from the second array element.
            }
          )
        )
      )
      .appendTo("body"); // Append the created form to the document body.
  }
})(
  // This is the default input string passed to the IIFE for non-Node.js environments.
  `
8 8
`
);
