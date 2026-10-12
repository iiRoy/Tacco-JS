function processInput(rawData) {
  // Remove any leading or trailing whitespace from the input string.
  rawData = rawData.trim();

  // Parse the three space-separated integer values from the input.
  const valA = parseInt(rawData.split(" ")[0], 10); // The first integer value.
  const valB = parseInt(rawData.split(" ")[1], 10); // The second integer value.
  const valC = parseInt(rawData.split(" ")[2], 10); // The third integer value.

  // Calculate an initial difference based on valA and valC.
  var diffVal = valA - 2 * valC;

  // Determine a count by dividing the difference by the sum of valB and valC, then taking the floor.
  var countResult = Math.floor(diffVal / (valB + valC));

  // Evaluate a condition to decide the final output.
  if (diffVal - countResult * (valB + valC) >= valB) {
    // If the condition is met, increment the count and print it.
    console.log(countResult + 1);
  } else {
    // Otherwise, print the original count.
    console.log(countResult);
  }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
