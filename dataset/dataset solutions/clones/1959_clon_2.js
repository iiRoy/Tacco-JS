// This function is designed to ingest and process an array of textual entries.
function ProcessInput( dataLines ) {
  // Declare a local variable to store the primary numerical component.
  // The first element of the input array is parsed into a floating-point number.
  let numericValue = Number( dataLines[0] );

  // Output the result of a mathematical calculation involving the parsed value.
  // Specifically, it computes the circumference of a circle with 'numericValue' as its radius.
  console.log( numericValue * 2.0 * Math.PI );
}

// Invoke the main processing routine.
// The data is sourced from standard input, decoded as UTF-8,
// stripped of leading/trailing whitespace, and then segmented into individual lines.
ProcessInput(
  require("node:fs").
    readFileSync("/dev/stdin", "utf8").
    trim().
    split("\n")
);