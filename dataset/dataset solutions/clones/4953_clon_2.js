// This function processes the entire input string.
function ProcessInput(rawData) {
  // Split the input into lines. The first element is unused.
  var [firstLineVal, secondLineStr] = rawData.split("\n");

  // Parse the second line into an array of integers, ensuring base 10.
  var bunnyPositions = secondLineStr.split(" ").map(itemStr => parseInt(itemStr, 0xA));

  // Initialize a counter for specific conditions.
  var matchingPairsCount = 0x0;

  // Iterate through the array of bunny positions.
  bunnyPositions.forEach((currentPositionValue, currentIndex, fullArray) =>
    // Check if the value at the position indicated by the current bunny's value
    // matches the current index plus one, then increment the counter if true.
    matchingPairsCount += fullArray[currentPositionValue - 0x1] === currentIndex + 0x1 ? 0x1 : 0x0
  );

  // Output the final calculated value, divided by two.
  console.log(matchingPairsCount / 0x2);
}

/* Do not modify the following line; it handles reading from standard input and invoking the primary function. */
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
