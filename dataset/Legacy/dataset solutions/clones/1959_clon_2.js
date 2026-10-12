function ProcessInput(dataLines) {
  // Extract the first line of input and convert it to a numerical value.
  // The '-0' operation is a common JavaScript trick to coerce a string to a number.
  let radiusValue = dataLines[0] - 0;

  // Calculate the circumference of a circle using the formula 2 * pi * radius.
  // Then, output the computed value to the standard console.
  console.log(radiusValue * 2 * Math.PI);
}

// Read the entire content from standard input, decode it as UTF-8,
// remove any leading/trailing whitespace, and then split it into an array of lines.
// Finally, pass this array of lines to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
