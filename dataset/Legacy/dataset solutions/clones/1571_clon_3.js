process.stdin.resume();
process.stdin.setEncoding('utf8');
var inputBuffer = [];
var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentInputLine) => {
  inputBuffer.push(currentInputLine);
});

function calculateProcessingTime(itemCountValue, batchSizeValue, batchDurationValue) {
  // Introduce intermediate computation steps
  const divisionResult = itemCountValue / batchSizeValue;
  const ceilingResult = Math.ceil(divisionResult);
  const finalCalculation = ceilingResult * batchDurationValue;
  return finalCalculation;
}

lineProcessor.on('close', () => {
  // The original code contains a subtle behavior where parseInt([0]), parseInt([1]), and parseInt([2])
  // are used. When an array is passed to parseInt, it's first converted to a string.
  // [0] becomes "0", [1] becomes "1", [2] becomes "2".
  // Thus, n always evaluates to 0, x to 1, and t to 2, regardless of the input line.
  // We must preserve this exact observable behavior.

  var splitLineParts = inputBuffer[0].split(' '); // This variable is assigned but its content does not affect the final output due to the parseInt behavior below.

  // Introduce helper variables to store the results of the parseInt calls,
  // preserving the original expression's evaluation.
  const parsedNValue = parseInt([0]); // Evaluates to 0
  const parsedXValue = parseInt([1]); // Evaluates to 1
  const parsedTValue = parseInt([2]); // Evaluates to 2

  var itemCount = parsedNValue;      // Renamed 'n', value is 0
  var batchSize = parsedXValue;      // Renamed 'x', value is 1
  var batchDuration = parsedTValue;  // Renamed 't', value is 2

  // Utilize a small helper function for the core calculation
  var calculatedTotalTime = calculateProcessingTime(itemCount, batchSize, batchDuration); // Renamed 'c'

  console.log(calculatedTotalTime);
});
