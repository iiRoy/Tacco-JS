function ProcessInput(inputString) {
  // The input string is expected to contain multiple lines.
  // We split it into an array where each element is a line.
  let inputLines = inputString.split('\n');

  // The second line (index 1) contains space-separated numbers.
  // We parse these into an array of actual numeric values.
  const originalNumbers = inputLines[1].split(' ').map(numStr => +numStr);

  // The first line (index 0) provides the total count of numbers.
  const countElements = +inputLines[0];

  // Create a duplicate of the numbers array and sort it in ascending order.
  let sortedNumbers = [...originalNumbers].sort((val1, val2) => val1 - val2);

  // For an even number of elements, we identify the two middle values.
  // These are often referred to as the lower and upper medians in this context.
  let lowerMedian = sortedNumbers[countElements / 2 - 1];
  let upperMedian = sortedNumbers[countElements / 2];

  // Iterate through each number in the original, unsorted sequence.
  for (let idx = 0; idx < countElements; ++idx) {
    // Based on a comparison with the lower median, print either the upper or lower median.
    // If the current number is less than or equal to the lower median, print the upper median.
    // Otherwise, print the lower median.
    console.log(originalNumbers[idx] <= lowerMedian ? upperMedian : lowerMedian);
  }
}

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, pass this content to our processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
