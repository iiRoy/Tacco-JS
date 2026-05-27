function ProcessInput(rawData) {
  // This function processes the raw text input provided.
  // Each line of the input string is separated by a newline character.
  let lineData = rawData.split("\n");

  // The first line contains dimensions for the main container.
  let firstLineParts = lineData[0].split(" ");
  // The second line contains dimensions for the stencil or paint area.
  let secondLineParts = lineData[1].split(" ");

  // Extract the number of rows for the main container.
  let containerRows = firstLineParts[0];
  // Extract the number of columns for the main container.
  let containerCols = firstLineParts[1];

  // Extract the number of rows for the stencil.
  let stencilRows = secondLineParts[0];
  // Extract the number of columns for the stencil.
  let stencilCols = secondLineParts[1];

  // Calculate the final result by multiplying the differences in dimensions.
  let resultValue = (containerRows - stencilRows) * (containerCols - stencilCols);

  // Output the computed result to the standard console.
  console.log(resultValue);
}

// The following line is essential for the program's execution environment.
// It reads all data from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
