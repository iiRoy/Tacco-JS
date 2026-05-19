/*
 * This module defines a primary function for coordinate processing
 * and an execution block that adapts to different JavaScript environments.
 */
function ProcessCoordinates(rawData) {
  // The input string is parsed into an array of integer values.
  let numericValues = rawData.split(" ").map(valStr => ~~valStr);

  // Extract the initial two pairs of coordinates from the processed array.
  const firstX = numericValues.shift();
  const firstY = numericValues.shift();
  const secondX = numericValues.shift();
  const secondY = numericValues.shift();

  // Calculate the coordinates for a third point based on a geometric rotation/translation.
  const thirdX = secondX - (secondY - firstY);
  const thirdY = secondY + (secondX - firstX);

  // Determine the coordinates for a fourth point, completing a specific geometric figure.
  const fourthX = thirdX - (secondX - firstX);
  const fourthY = thirdY - (secondY - firstY);

  // Return the four calculated coordinates as a single space-separated string.
  return [thirdX, thirdY, fourthX, fourthY].join(" ");
}

// This immediately invoked function expression (IIFE) manages
// the input acquisition and output display, depending on the runtime environment.
((initialData, operationResult, resultType) => {
  // Check if the 'require' function is available, indicating a Node.js environment.
  if (typeof require !== "undefined") {
    // In Node.js, read input from stdin, pass it to the processing function,
    // and print the returned result to the console.
    console.log(ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // For browser-like environments, process the embedded data string.
    initialData = initialData.split("\n").slice(1, -1).join("\n");
    operationResult = (() => {
      try {
        // Attempt to execute the coordinate processing function.
        return ProcessCoordinates(initialData);
      } catch (errorDetails) {
        // If an error occurs, capture its stack trace or message.
        return errorDetails.stack || errorDetails.message;
      }
    })();
    resultType = typeof operationResult;

    // Ensure the operation result is a string for display purposes.
    if (resultType !== "string") {
      operationResult = JSON.stringify(operationResult);
    }

    // Utilize jQuery to dynamically create and append a form with text areas
    // to the document's body, displaying the input, result type, and output.
    $("<form>")
      .append(
        [
          [10, initialData],
          0,
          [1, resultType],
          0,
          [10, operationResult]
        ].map(item =>
          item
            ? $("<textarea>", {
                rows: item[0],
                cols: 40,
                text: item[1]
              })
            : $("<br>")
        )
      )
      .appendTo("body");
  }
})(
  `
31 -41 -59 26
`
);
