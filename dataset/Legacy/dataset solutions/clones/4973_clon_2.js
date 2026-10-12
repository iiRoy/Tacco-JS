function calculatePatternSum() {
  // If only one argument is provided, return it directly as per the original logic.
  if (arguments.length === 1) {
    return arguments[0];
  }

  // Compute an initial numerical value based on the count of input arguments.
  let initialValue = Math.ceil(((arguments.length - 1) * (arguments.length - 1)) / 2);

  // Initialize a dynamic multiplier for the hash calculation.
  let multiplierBase = 2;

  // Accumulator for the weighted sum of elements.
  let cumulativeHash = 0;

  // Iterate through each supplied argument to build the cumulative hash.
  for (const currentElement of arguments) {
    cumulativeHash += multiplierBase * currentElement; // Add the product of multiplier and current element.
    multiplierBase = multiplierBase * 5 + 1; // Update the multiplier for the next iteration.
  }

  // The final result is the product of the initial value and the cumulative hash.
  return initialValue * cumulativeHash;
}

function flipString(inputString) {
  // Initialize an empty string to store the reversed result.
  let reversedString = "";

  // Loop backwards from the last character to the first.
  for (let idx = inputString.length - 1; idx >= 0; idx--) {
    reversedString += inputString[idx]; // Append the character at the current index to the new string.
  }

  // Return the fully reversed string.
  return reversedString;
}

// Ensure standard input stream is active.
process.stdin.resume();
// Set the encoding for incoming data from standard input.
process.stdin.setEncoding("UTF-8");

// Attach an event listener for 'data' events on standard input.
process.stdin.on("data", function(inputDataChunk) {
  // Process the incoming data chunk:
  // 1. Reverse the input string using the custom flipString function.
  // 2. Split the reversed string into an array of individual characters.
  // 3. Map each character to its integer representation using parseInt.
  // 4. Apply these parsed integers as arguments to the calculatePatternSum function.
  // 5. Convert the final numerical result back to a string.
  // 6. Write the resulting string to standard output.
  process.stdout.write(
    calculatePatternSum.apply(
      null,
      flipString(inputDataChunk)
        .split("")
        .map(function(digitChar) {
          return parseInt(digitChar, 10);
        })
    ).toString()
  );
});
