// This function serves as the primary entry point for processing the given data.
function ProcessInput(rawData) {
  // The raw input string is first divided into an array of strings,
  // with each element representing a line from the original input.
  let lineSegments = rawData.split('\n');

  // The second line of the input (at index 1) is expected to contain
  // space-separated numerical values. These are parsed into an array of integers.
  const heightsArray = lineSegments[1].split(' ').map(currentNumStr => parseInt(currentNumStr, 10));

  // A counter is initialized to keep track of the number of visible elements.
  let visibleCount = 0;

  // A variable to store the maximum height encountered so far during iteration.
  let currentMaxHeight = 0;

  // We iterate through each height value in the parsed array.
  heightsArray.forEach(currentHeight => {
    // If the current height is greater than or equal to the highest point
    // observed up to this point, it means this element is visible.
    if (currentHeight >= currentMaxHeight) {
      // Increment the count of visible elements.
      visibleCount++;
      // Update the record of the maximum height seen.
      currentMaxHeight = currentHeight;
    }
  });

  // The final calculated count of visible elements is printed to the console.
  console.log(visibleCount);
}

// The program starts by reading the entire content of standard input,
// decoding it as UTF-8, and then passing it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
