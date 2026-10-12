function ProcessData(incomingData) {
  // Remove leading/trailing whitespace from the raw input string.
  incomingData = incomingData.trim();

  // Split the string by spaces and convert each part into a number.
  incomingData = incomingData.split(" ").map(Number);

  /**
   * Defines a comparison function for sorting numbers in ascending order.
   * @param {number} firstVal - The first value for comparison.
   * @param {number} secondVal - The second value for comparison.
   * @returns {number} A negative value if firstVal < secondVal,
   *                   zero if firstVal == secondVal,
   *                   or a positive value if firstVal > secondVal.
   */
  function numericalOrder(firstVal, secondVal) {
    return firstVal - secondVal;
  }

  // Sort the array of numbers using the custom comparison function.
  incomingData.sort(numericalOrder);

  // Calculate and print the result: (smallest number * second smallest number) / 2.
  console.log(incomingData[0] * incomingData[1] / 2);
}

// Read input from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
