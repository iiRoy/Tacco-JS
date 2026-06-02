function ProcessInput(rawData) {
  // The rawData parameter contains the entire input string.
  // We first split the input string into an array of lines.
  let lines = rawData.split("\n");

  // The first line contains the count of elements.
  // We split the first line by space and convert the first part to a number.
  const firstLineParts = lines[0].split(" ");
  const elementCount = Number(firstLineParts[0]);

  // The second line contains the space-separated numbers.
  // We split this line into an array of strings.
  let numberArray = lines[1].split(" ");

  // Convert each string element in the array to a number.
  for (let idx = 0; idx < elementCount; idx++) {
    numberArray[idx] = Number(numberArray[idx]);
  }

  // Initialize a counter for elements that have become zero (or the current minimum).
  let zeroedElements = 0;

  // Continue the process until all elements in the array are equal to the final GCD.
  while (zeroedElements !== elementCount) {
    // Reset the counter for each iteration of the outer loop.
    zeroedElements = 0;

    // Find the minimum value among the current elements in the array.
    const currentMin = Math.min(...numberArray);

    // Iterate through the array to apply the Euclidean algorithm step.
    for (let idx = 0; idx < elementCount; idx++) {
      // Calculate the remainder when the current element is divided by the minimum.
      const remainder = numberArray[idx] % currentMin;

      // If the remainder is not zero, update the element with the remainder.
      if (remainder !== 0) {
        numberArray[idx] = remainder;
      } else {
        // If the remainder is zero, it means the current element is a multiple of currentMin.
        // In this case, replace the element with currentMin, and increment the zeroedElements counter.
        numberArray[idx] = currentMin;
        zeroedElements++;
      }
    }
  }

  // After the loop terminates, all elements in numberArray will be equal to their greatest common divisor.
  // We can just output the minimum (which will be the GCD).
  console.log(Math.min(...numberArray));
}

// This part handles reading from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
