function ProcessInput(rawData) {
  // Parse the first element of the input array to get the total count of elements.
  const countElements = parseInt(rawData[0], 10);

  // Extract the subsequent elements, starting from the second one,
  // and convert each of them into an integer to form the heights array.
  const heightsArray = rawData.slice(1).map(singleHeight => parseInt(singleHeight, 10));

  // Initialize a variable to keep track of the current maximum allowed height,
  // starting with the first height value from the processed array.
  let currentMaxHeight = heightsArray[0];

  // Iterate through the heights array, starting from the second element (index 1),
  // up to (but not including) the total count of elements.
  for (let idx = 1; idx < countElements; idx++) {
    // Check if the current allowed maximum height is exactly equal to the current height in the array.
    if (currentMaxHeight === heightsArray[idx]) {
      // If they are equal, the allowed maximum height remains unchanged for the next iteration.
      currentMaxHeight = heightsArray[idx];
    }
    // Otherwise, check if the current allowed maximum height is less than or equal to
    // the current height in the array minus one.
    else if (currentMaxHeight <= heightsArray[idx] - 1) {
      // If this condition is met, update the allowed maximum height to be
      // one less than the current height from the array.
      currentMaxHeight = heightsArray[idx] - 1;
    }
    // If neither of the above conditions is satisfied, it means a violation has occurred.
    else {
      // Output 'No' to the console and immediately exit the function.
      return console.log('No');
    }
  }

  // If the loop completes without any violations, it means the condition is met.
  // Output 'Yes' to the console.
  console.log('Yes');
}

// Read the input from standard input, decode it as UTF-8,
// remove any leading or trailing whitespace, and then split the string
// by newlines or spaces to create an array of strings.
// Finally, pass this array to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
