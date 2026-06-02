function ProcessInput(rawData) {
  // Split the raw input string by space to get individual parts.
  const dataParts = rawData.split(' ');

  // Extract the first numerical value from the parsed data.
  const firstVal = dataParts[0];
  // Extract the second numerical value from the parsed data.
  const secondVal = dataParts[1];

  // Calculate the initial absolute difference between the two values.
  // This uses Math.pow(x, 2) for squaring and Math.sqrt for the square root.
  let currentDifference = Math.sqrt(Math.pow(firstVal - secondVal, 2));

  // Calculate the next difference based on the current difference and the second value.
  let nextDifference = Math.sqrt(Math.pow(currentDifference - secondVal, 2));

  // Loop continues as long as the newly calculated difference is greater than the current one.
  while (nextDifference > currentDifference) {
    // Update the current difference to the value of the next difference.
    currentDifference = nextDifference;
    // Recalculate the next difference using the updated current difference.
    nextDifference = Math.sqrt(Math.pow(currentDifference - secondVal, 2));
  }

  // Output the final calculated difference to the console.
  console.log(nextDifference);
}

// Read input from standard input using Node.js 'fs' module and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
