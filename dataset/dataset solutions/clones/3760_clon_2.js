// This function serves as the primary entry point for processing input data.
function processInputData ( rawText ) {
  // Split the entire input string into individual lines for easier parsing.
  const inputLines = rawText.split('\n');

  // Parse the first line to extract global parameters:
  // numItems: the total count of data points to process.
  // targetCount: the number of top values to consider for summation.
  const firstLineParts = inputLines[0].split(' ');
  const numItems = Number(firstLineParts[0]);
  const targetCount = Number(firstLineParts[1]);

  // Initialize eight distinct arrays to store sums based on different sign combinations
  // of the three coordinate values (x, y, z).
  const val_xPyPz = [];    // Represents sums of (+x +y +z)
  const val_xPyMz = [];    // Represents sums of (+x +y -z)
  const val_xMyPz = [];    // Represents sums of (+x -y +z)
  const val_xMyMz = [];    // Represents sums of (+x -y -z)
  const val_MxPyPz = [];   // Represents sums of (-x +y +z)
  const val_MxMyPz = [];   // Represents sums of (-x -y +z)
  const val_MxPyMz = [];   // Represents sums of (-x +y -z)
  const val_MxMyMz = [];   // Represents sums of (-x -y -z)

  // Initialize separate arrays to hold the individual coordinate values (x, y, z)
  // for each data point.
  const xCoordinates = [];
  const yCoordinates = [];
  const zCoordinates = [];

  // Iterate through each data item, starting from the second line of input.
  // The loop runs 'numItems' times to process all data points.
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    // Split the current input line into its three coordinate components.
    const currentLineParts = inputLines[itemIndex + 1].split(' ');

    // Convert the string components to numbers and store them in their respective
    // coordinate arrays at the current item's index.
    xCoordinates[itemIndex] = Number(currentLineParts[0]);
    yCoordinates[itemIndex] = Number(currentLineParts[1]);
    zCoordinates[itemIndex] = Number(currentLineParts[2]);

    // Calculate and populate the eight sum arrays for the current data item.
    // Each push operation adds a new sum to its corresponding array.
    val_xPyPz.push(xCoordinates[itemIndex] + yCoordinates[itemIndex] + zCoordinates[itemIndex]);
    val_xPyMz.push(xCoordinates[itemIndex] + yCoordinates[itemIndex] - zCoordinates[itemIndex]);
    val_xMyPz.push(xCoordinates[itemIndex] - yCoordinates[itemIndex] + zCoordinates[itemIndex]);
    val_xMyMz.push(xCoordinates[itemIndex] - yCoordinates[itemIndex] - zCoordinates[itemIndex]);
    val_MxPyPz.push(-xCoordinates[itemIndex] + yCoordinates[itemIndex] + zCoordinates[itemIndex]);
    val_MxMyPz.push(-xCoordinates[itemIndex] - yCoordinates[itemIndex] + zCoordinates[itemIndex]);
    val_MxPyMz.push(-xCoordinates[itemIndex] + yCoordinates[itemIndex] - zCoordinates[itemIndex]);
    val_MxMyMz.push(-xCoordinates[itemIndex] - yCoordinates[itemIndex] - zCoordinates[itemIndex]);
  }

  // An array to collect the maximum sum obtained from each of the eight combination types.
  const resultScores = [];

  // For each of the eight sum arrays, calculate the sum of its top 'targetCount' elements
  // and store the result in the 'resultScores' array.
  resultScores.push(calculateTopSum(val_xPyPz, targetCount));
  resultScores.push(calculateTopSum(val_xPyMz, targetCount));
  resultScores.push(calculateTopSum(val_xMyPz, targetCount));
  resultScores.push(calculateTopSum(val_xMyMz, targetCount));
  resultScores.push(calculateTopSum(val_MxPyPz, targetCount));
  resultScores.push(calculateTopSum(val_MxMyPz, targetCount));
  resultScores.push(calculateTopSum(val_MxPyMz, targetCount));
  resultScores.push(calculateTopSum(val_MxMyMz, targetCount));

  // Sort the 'resultScores' array in ascending numerical order.
  // Then, retrieve the last element (which is the maximum value after sorting)
  // and print it to the console as a string.
  console.log(String(resultScores.sort((first, second) => first - second).pop()));
}


// This helper function sorts a given list of scores in descending order,
// extracts a specified number of top elements, and returns their sum.
function calculateTopSum ( scoreList, takeCount ) {
  // Sort the provided 'scoreList' in descending order (largest values first).
  return scoreList.sort(function (valA, valB) {
    return valB - valA; // Custom comparison for descending sort
  })
  // Create a new array containing only the first 'takeCount' elements
  // from the sorted list.
  .slice(0, takeCount)
  // Reduce the sliced array to a single value by summing all its elements.
  .reduce(function (accumulator, currentValue) {
    return accumulator + currentValue; // Summing logic
  }, 0); // The initial value for the accumulator is set to zero.
}


// Initiate the program by calling the main processing function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string to serve as input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));