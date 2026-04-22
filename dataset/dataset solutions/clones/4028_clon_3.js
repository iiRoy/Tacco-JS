// Resume standard input stream to listen for data.
process.stdin.resume();
// Configure the encoding for incoming data from standard input.
process.stdin.setEncoding('utf8');

// A dynamic array to accumulate all lines received from standard input.
let receivedDataLines = [];

// Initialize a specialized interface for handling input line by line.
const consoleInputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Required for the interface, even if not used for output.
});

// Attach an event listener to capture each complete line of input.
consoleInputHandler.on('line', (currentSegment) => {
  // Store the current line in our collection.
  receivedDataLines.push(currentSegment);
});

// Attach an event listener for when the input stream concludes.
consoleInputHandler.on('close', () => {
  // --- Input Validation and Parsing ---

  // Verify that at least two lines of input were received.
  if (receivedDataLines.length < 2) {
    console.error("Error: Insufficient input provided. Expected at least two lines.");
    return; // Terminate execution if input is incomplete.
  }

  // Attempt to parse the first line as the total count of items.
  // Use parseInt with radix 10 for explicit base.
  const declaredItemCount = parseInt(receivedDataLines[0], 10);

  // Validate the parsed item count: must be a number and positive.
  if (isNaN(declaredItemCount) || declaredItemCount <= 0) {
    console.error("Error: Invalid or non-positive item count detected in the first line.");
    return;
  }

  // Process the second line, splitting it into individual string values.
  // Use a regex to handle multiple spaces and then filter out any empty strings.
  const stringifiedValues = receivedDataLines[1].split(/\s+/).filter(Boolean);

  // Convert the string values into an array of numbers.
  // Filter out any results that are not valid numbers (NaN).
  let numericalCollection = stringifiedValues.map(sVal => parseInt(sVal, 10)).filter(num => !isNaN(num));

  // Determine the actual number of items to process,
  // taking the minimum of the declared count and the successfully parsed numbers.
  const effectiveProcessingCount = Math.min(declaredItemCount, numericalCollection.length);

  // If no valid numbers are available after parsing and filtering, output 0 difference.
  if (effectiveProcessingCount === 0) {
    console.log(0);
    return;
  }

  // --- Core Logic: Sorting and Distribution ---

  // Sort the collection of numbers in descending order.
  // This ensures that the largest available numbers are always at the beginning.
  numericalCollection.sort((valueA, valueB) => valueB - valueA);

  // Initialize scores for the two players.
  let playerOneCumulativeScore = 0;
  let playerTwoCumulativeScore = 0;
  // A flag to manage whose turn it is to pick a number.
  let isFirstPlayerTurn = true;

  // Iterate through the sorted numerical collection up to the effective count.
  for (let currentIteration = 0; currentIteration < effectiveProcessingCount; ++currentIteration) {
    const itemToAssign = numericalCollection[currentIteration];

    // Assign the current item to the appropriate player based on whose turn it is.
    if (isFirstPlayerTurn) {
      playerOneCumulativeScore += itemToAssign;
    } else {
      playerTwoCumulativeScore += itemToAssign;
    }

    // Toggle the turn for the next iteration.
    isFirstPlayerTurn = !isFirstPlayerTurn;
  }

  // --- Output Result ---

  // Calculate the final difference between the two players' scores.
  const calculatedScoreDifferential = playerOneCumulativeScore - playerTwoCumulativeScore;
  // Display the result to the console.
  console.log(calculatedScoreDifferential);
});