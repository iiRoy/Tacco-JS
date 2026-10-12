function processInput(rawData) {
  // Split the entire input string into individual lines.
  const linesOfData = rawData.split('\n');

  // Parse the first line to get the number of items (n) and the top count (m).
  const firstLineParts = linesOfData[0].split(' ');
  const numItems = Number(firstLineParts[0]);
  const topCount = Number(firstLineParts[1]);

  // Initialize arrays to store sums for different sign combinations.
  // These represent x+y+z, x+y-z, x-y+z, etc.
  const posPosPos = [];
  const posPosNeg = [];
  const posNegPos = [];
  const posNegNeg = [];
  const negPosPos = [];
  const negNegPos = [];
  const negPosNeg = [];
  const negNegNeg = [];

  // Initialize arrays to hold the individual coordinate values.
  const xCoords = [];
  const yCoords = [];
  const zCoords = [];

  // Loop through each item's data, starting from the second line.
  for (let idx = 0; idx < numItems; idx++) {
    // Split the current line into its coordinate parts.
    const currentLineParts = linesOfData[idx + 1].split(' ');

    // Convert string parts to numbers and store them.
    xCoords[idx] = Number(currentLineParts[0]);
    yCoords[idx] = Number(currentLineParts[1]);
    zCoords[idx] = Number(currentLineParts[2]);

    // Calculate and store sums for all 8 sign combinations.
    posPosPos.push(xCoords[idx] + yCoords[idx] + zCoords[idx]);
    posPosNeg.push(xCoords[idx] + yCoords[idx] - zCoords[idx]);
    posNegPos.push(xCoords[idx] - yCoords[idx] + zCoords[idx]);
    posNegNeg.push(xCoords[idx] - yCoords[idx] - zCoords[idx]);
    negPosPos.push(-xCoords[idx] + yCoords[idx] + zCoords[idx]);
    negNegPos.push(-xCoords[idx] - yCoords[idx] + zCoords[idx]);
    negPosNeg.push(-xCoords[idx] + yCoords[idx] - zCoords[idx]);
    negNegNeg.push(-xCoords[idx] - yCoords[idx] - zCoords[idx]);
  }

  // Array to store the maximum sum obtained from each combination.
  const resultSums = [];

  // Calculate the sum of the top 'm' values for each combination array
  // and add it to the results.
  resultSums.push(computeSumOfTopM(posPosPos, topCount));
  resultSums.push(computeSumOfTopM(posPosNeg, topCount));
  resultSums.push(computeSumOfTopM(posNegPos, topCount));
  resultSums.push(computeSumOfTopM(posNegNeg, topCount));
  resultSums.push(computeSumOfTopM(negPosPos, topCount));
  resultSums.push(computeSumOfTopM(negNegPos, topCount));
  resultSums.push(computeSumOfTopM(negPosNeg, topCount));
  resultSums.push(computeSumOfTopM(negNegNeg, topCount));

  // Sort the result sums in ascending order and print the largest one.
  console.log(String(resultSums.sort().pop()));
}

/**
 * Computes the sum of the top 'limit' values in a given array.
 * @param {number[]} valueList - The array of numbers to process.
 * @param {number} limit - The number of top elements to sum.
 * @returns {number} The sum of the top 'limit' elements.
 */
function computeSumOfTopM(valueList, limit) {
  // Sort the array in descending order.
  return valueList.sort(function (valA, valB) {
    return valB - valA; // Descending sort
  })
  // Take only the first 'limit' elements (the largest ones).
  .slice(0, limit)
  // Sum these 'limit' elements.
  .reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0); // Initial accumulator value is 0.
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
