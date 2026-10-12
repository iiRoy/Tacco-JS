((rawData) => {
  // Process the raw input string into an array of lines.
  const linesArray = rawData.split('\n');

  // Extract the first line and split it into its constituent parts.
  const firstLineParts = linesArray[0].split(' ');

  // Convert the first part to a number for the left boundary.
  const leftBound = +firstLineParts[0];
  // Convert the second part to a number for the right boundary.
  const rightBound = +firstLineParts[1];

  // Check for a special condition where the minimum product modulo 2019 is guaranteed to be zero.
  // This occurs if the range [leftBound, rightBound] is wide enough to contain a multiple of 2019,
  // or if the difference between rightBound and leftBound is sufficiently large.
  if (rightBound - leftBound >= 2019 || leftBound - (leftBound % 2019) + 2019 <= rightBound) {
    console.log(0); // Output zero as the result.
    return; // Terminate execution early.
  }

  // Handle another special case where the range contains only two numbers.
  // In this scenario, the minimum product modulo 2019 is simply the leftBound modulo 2019.
  if (rightBound - leftBound === 1) {
    console.log(leftBound % 2019); // Output the modulo result.
    return; // Terminate execution.
  }

  // Initialize a variable to store the minimum product modulo 2019 found so far.
  // Start with positive infinity to ensure any valid product will be smaller.
  var minimumProductMod = Infinity;

  // Iterate through all possible 'idxA' values from leftBound up to rightBound - 1.
  for (var idxA = leftBound; idxA <= rightBound - 1; idxA += 1) {
    // For each 'idxA', iterate through all possible 'idxB' values from leftBound + 1 up to rightBound.
    for (var idxB = leftBound + 1; idxB <= rightBound; idxB += 1) {
      // Calculate the product of (idxA % 2019) and (idxB % 2019), then take the modulo 2019 of that product.
      // Update minimumProductMod if the newly calculated value is smaller.
      minimumProductMod = Math.min(minimumProductMod, (idxA % 2019) * (idxB % 2019) % 2019);
    }
  }

  // After checking all pairs, print the smallest product modulo 2019 found.
  console.log(minimumProductMod);
})(
  require("fs").readFileSync("/dev/stdin", "utf8") // Read input from standard input.
);
