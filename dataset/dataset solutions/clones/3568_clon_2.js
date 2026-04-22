/*
 * This module provides a utility function to compute the coordinates of two
 * additional vertices of a square, given the coordinates of two adjacent vertices.
 * The calculation assumes a counter-clockwise orientation for the vertices.
 */
function SolveGeometryTask(rawCoordinateData) {

    // Parse the input string into an array of integer values.
    // The bitwise NOT operator (~~) is used for efficient integer conversion.
    let parsedNumericValues = rawCoordinateData.split(" ").map(currentSegment => ~~currentSegment);

    // Extract the X and Y coordinates for the first two points from the array.
    const coordAX = parsedNumericValues.shift();
    const coordAY = parsedNumericValues.shift();
    const coordBX = parsedNumericValues.shift();
    const coordBY = parsedNumericValues.shift();

    // Calculate the coordinates of the third vertex (C).
    // This involves a 90-degree counter-clockwise rotation of vector AB
    // added to point B.
    let coordCX = coordBX - (coordBY - coordAY);
    let coordCY = coordBY + (coordBX - coordAX);

    // Calculate the coordinates of the fourth vertex (D).
    // This is equivalent to translating point C by the vector BA (or subtracting vector AB from C).
    let coordDX = coordCX - (coordBX - coordAX);
    let coordDY = coordCY - (coordBY - coordAY);

    // Combine the calculated coordinates into a space-separated string.
    return [coordCX, coordCY, coordDX, coordDY].join(" ");
}


// This section handles the execution environment, providing a test harness
// for both Node.js (command-line) and browser (web page) contexts.

((initialInputString, computationResult, resultCategory) => {

  // Check if the 'require' function is available, indicating a Node.js-like environment.
  if (typeof require !== "undefined") {
    // In Node.js, read input from stdin and print the result to console.
    console.log(SolveGeometryTask(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // In a browser environment, process the embedded input string and display results.

    // Clean up the initial input string (remove leading/trailing newlines).
    initialInputString = initialInputString.split("\n").slice(1, -1).join("\n");

    // Execute the main computation function within a try-catch block
    // to handle potential errors gracefully.
    computationResult = (() => {
      try {
        return SolveGeometryTask(initialInputString);
      } catch (errorObject) {
        // If an error occurs, return its stack trace or message.
        return errorObject.stack || errorObject.message;
      }
    })();

    // Determine the type of the computation result.
    resultCategory = typeof computationResult;

    // If the result is not already a string, convert it to JSON string representation.
    if (resultCategory !== "string") {
      computationResult = JSON.stringify(computationResult);
    }

    // Use jQuery (assuming it's loaded) to create a form with textareas
    // displaying the input string, result type, and the final computation result.
    $("<form>")
      .append(
          [
              [10, initialInputString], // Config for input textarea: 10 rows, content is initialInputString
              0,                         // A placeholder '0' to generate a <br>
              [1, resultCategory],      // Config for type textarea: 1 row, content is resultCategory
              0,                         // Another <br>
              [10, computationResult]   // Config for result textarea: 10 rows, content is computationResult
          ].map(
              displayItemConfig => $(
                  displayItemConfig ? "<textarea>" : "<br>", // Create textarea or br element
                  displayItemConfig && { // If it's a textarea config, set its attributes
                      rows: displayItemConfig[0],
                      cols: 40,
                      text: displayItemConfig[1]
                  }
              )
          )
      )
      .appendTo("body"); // Append the created form to the document body.
  }

})(
  `
31 -41 -59 26
`
);