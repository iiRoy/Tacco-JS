function ProcessCalculations(rawInputStr) {
  // Deconstruct the input string into numerical bounds and a divisor
  const [ startValue, endValue, divider ] = rawInputStr
    .split(/\s+/) // Split by any whitespace characters
    .map(val => parseInt(val, 10)); // Convert string parts to base-10 integers

  // Initialize a counter for numbers divisible by the specified divider
  let totalMatches = 0;

  // Iterate through the range from the starting value to the ending value, inclusive
  for (let currentIteration = startValue; currentIteration <= endValue; currentIteration += 1) {
    // Check if the current number in the iteration is perfectly divisible by the divider
    if ( (currentIteration % divider) === 0 ) {
      // If divisible without a remainder, increment the match counter
      totalMatches = totalMatches + 1;
    }
  }

  // Output the final accumulated count to the standard console
  console.log(totalMatches);
}

// Invoke the primary processing function with data obtained from standard input
ProcessCalculations(
  require("fs")
    .readFileSync("/dev/stdin", { encoding: "utf8" }) // Read the entire file content as a UTF-8 string
);