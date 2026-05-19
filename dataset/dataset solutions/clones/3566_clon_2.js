function ProcessCoordinates(incomingData) {
  // Split the raw input string into an array of lines.
  incomingData = incomingData.split("\n");

  // Parse the initial coordinates from the first line of input.
  // The coordinates are space-separated.
  let coordinateParts = incomingData[0].split(" ");
  let firstXCoord = parseInt(coordinateParts[0]);
  let firstYCoord = parseInt(coordinateParts[1]);
  let secondXCoord = parseInt(coordinateParts[2]);
  let secondYCoord = parseInt(coordinateParts[3]);

  // Initialize a variable for the final output string.
  // This variable will be overwritten later with the calculated coordinates.
  let resultString = 0;

  // Calculate the coordinates of the third point (x3, y3)
  // based on the geometric transformation.
  let thirdXCoord = secondXCoord - (secondYCoord - firstYCoord);
  let thirdYCoord = secondYCoord + (secondXCoord - firstXCoord);

  // Calculate the coordinates of the fourth point (x4, y4)
  // using a similar transformation.
  let fourthXCoord = firstXCoord - (secondYCoord - firstYCoord);
  let fourthYCoord = firstYCoord + (secondXCoord - firstXCoord);

  // Construct the final output string by concatenating the calculated coordinates.
  resultString = thirdXCoord + " " + thirdYCoord + " " + fourthXCoord + " " + fourthYCoord;

  // Print the resulting string to the console.
  console.log('%s', resultString);
}

// Read input from standard input and pass it to the main processing function.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
