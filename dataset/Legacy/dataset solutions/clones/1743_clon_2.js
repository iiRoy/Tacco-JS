process.stdin.resume(); // Initiates reading from standard input.
process.stdin.setEncoding("utf8"); // Sets the character encoding for input data.

// Event listener for incoming data chunks from standard input.
process.stdin.on("data", (rawData) => {
  // Process the raw input string to extract relevant numerical data.
  const parsedData = processIncomingData(rawData);

  // Calculate the final outcome based on the extracted K and Pk values.
  const finalOutcome = determineFinalValue(parsedData.selectionCount, parsedData.priceList);

  // Output the computed result to the console.
  console.log(finalOutcome);
});

/**
 * Parses the raw input string into structured data.
 * @param {string} inputString - The raw string received from stdin.
 * @returns {object} An object containing N, K, and an array of Pk values.
 */
const processIncomingData = (inputString) => {
  // Split the input into individual lines.
  const inputLines = inputString.split("\n");

  // Split the first line by spaces to get N and K.
  const firstLineParts = inputLines[0].split(" ");
  // Split the second line by spaces to get the Pk values.
  const secondLineParts = inputLines[1].split(" ");

  // Extract N (not used in calculation, but part of input).
  const itemCount = firstLineParts[0];
  // Extract K, the number of items to select.
  const selectionLimit = firstLineParts[1];

  // Convert the string Pk values to numbers.
  const priceArray = secondLineParts.map((strNum) => Number(strNum));

  // Return the structured data.
  return {
    itemCount: itemCount,
    selectionCount: selectionLimit,
    priceList: priceArray,
  };
};

/**
 * Calculates the sum of the smallest 'k' elements from an array 'pk'.
 * @param {number} selectionLimit - The number of smallest elements to sum.
 * @param {number[]} priceArray - An array of numbers (prices).
 * @returns {number} The sum of the 'selectionLimit' smallest numbers.
 */
const determineFinalValue = (selectionLimit, priceArray) => {
  // Sort the array of prices in ascending order.
  priceArray.sort((valA, valB) => {
    if (valA > valB) return 1; // valA comes after valB
    if (valA < valB) return -1; // valA comes before valB
    return 0; // valA and valB are equal
  });

  // Take the first 'selectionLimit' elements (which are now the smallest)
  // and sum them up using the reduce method.
  const totalSum = priceArray.slice(0, selectionLimit).reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0); // Initialize sum with 0.

  return totalSum;
};
