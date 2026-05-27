function ProcessInput(rawData) {
  // The input string is split into an array of lines.
  rawData = rawData.split("\n");

  // The first line is parsed as a number, but this variable is not used further in the logic.
  const initialCount = rawData[0] - 0;

  // Declare variables that will be used to store parts of the current line and intermediate calculations.
  var currentLineParts;
  var currentT, currentA;
  var multiplier;

  // Initialize 'currentT' and 'currentA' using values from the second line of input.
  currentT = rawData[1].split(" ")[0] - 0;
  currentA = rawData[1].split(" ")[1] - 0;

  // Loop through the remaining lines of the input, starting from the third line (index 2).
  for (var idx = 2; idx < rawData.length; idx++) {
    // Split the current line into an array of strings.
    currentLineParts = rawData[idx].split(" ");

    // Convert the first two elements of 'currentLineParts' to numbers.
    [0, 1].forEach(elementIndex => {
      currentLineParts[elementIndex] -= 0;
    });

    // This variable is declared and assigned but not utilized in the subsequent logic.
    var loopIterationCounter = 1;

    // Calculate the smallest integer 'multiplier' such that 'currentT' and 'currentA'
    // can be scaled up to be at least 'currentLineParts[0] * multiplier' and 'currentLineParts[1] * multiplier' respectively.
    multiplier = Math.ceil(Math.max(currentT / currentLineParts[0], currentA / currentLineParts[1]));

    // Update 'currentT' and 'currentA' by scaling them with the calculated 'multiplier'.
    currentT = currentLineParts[0] * multiplier;
    currentA = currentLineParts[1] * multiplier;
  }

  // Output the sum of the final 'currentA' and 'currentT' values to the console.
  console.log(currentA + currentT);
}

// This section is responsible for reading input from standard input and invoking the main processing function.
// It should remain unchanged to ensure proper execution in the given environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
