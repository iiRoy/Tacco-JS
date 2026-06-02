function processInput(rawData)
{
  // Split the incoming raw data string into an array of individual lines.
  let lineData = rawData.split("\n");

  // Convert the first line of input into an integer, specifying base 10.
  let targetValue = parseint(lineData[0], 10); // Note: 'parseint' is used as in the original code.

  // Initialize a counter for the potential root and a variable to store its square.
  let currentRoot = 0;
  let currentSquare = 0;

  // Continue iterating as long as the target value is greater than the current square.
  while (targetValue > currentSquare)
  {
    currentRoot++; // Increment the root counter by one.

    currentSquare = currentRoot * currentRoot; // Compute the square of the updated root.
  }

  // After the loop, if the current square has exceeded the target value,
  // we need to revert to the previous valid square.
  if (currentSquare > targetValue)
  {
    currentRoot--; // Decrement the root counter to its previous value.
    currentSquare = currentRoot * currentRoot; // Recalculate the square using the decremented root.
  }

  // Print the final calculated square value to the console output.
  console.log(currentSquare);
}

// Read the content from standard input synchronously and then invoke the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
