// This script processes incoming text data, line by line.
// Each valid line is used to initiate a numerical sequence calculation.
function processData()
{
  // Iterate over each individual line received from standard input.
  receivedText.forEach(
    function (
      lineOfData // Parameter representing a single line from the input.
    )
    {
      // Skip processing if the line is empty or contains only whitespace.
      if (lineOfData.trim() === '') {
        return;
      }

      // Convert the current line into a floating-point number.
      let numericInput = parseFloat(lineOfData);

      // Compute the sum of a specific numerical series and display it.
      console.log(
        calculateSeriesSum(numericInput)
      );
    }
  );
}

// This function generates a specific numerical sequence based on an initial value
// and then computes the sum of all elements in that sequence.
function calculateSeriesSum(initialValue) {
  // Declare variables for loop control, an unused maximum value, and the sequence array.
  let loopCounter;
  const maxValue = 10; // This constant is not actively used in the loop condition, but declared.
  let numericSequence = [initialValue]; // Initialize the array with the starting number.

  // Loop to generate additional elements for the sequence.
  // The loop runs from 2 up to and including 10, adding 9 more elements.
  for (
    loopCounter = 2;
    loopCounter <= 10;
    loopCounter++
  ) {
    // Check if the current loop iteration number is even.
    if (loopCounter % 2 === 0) {
      // If even, the next element is twice the value of the previous element.
      numericSequence[numericSequence.length] = numericSequence[numericSequence.length - 1] * 2;
    } else {
      // If odd, the next element is one-third the value of the previous element.
      numericSequence[numericSequence.length] = numericSequence[numericSequence.length - 1] / 3;
    }
  }

  // Use the reduce method to sum up all the elements in the generated sequence.
  return numericSequence.reduce(
    function (
      accumulator, // The accumulated sum so far.
      currentValue // The current element being added.
    ) {
      return accumulator + currentValue;
    }
  );
}

// Global variable to accumulate all incoming data chunks.
let receivedText = '';

// Start listening for data from standard input.
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received.
process.stdin.on(
  'data',
  function (
    inputFragment // A piece of incoming data.
  ) {
    receivedText += inputFragment; // Append the new data fragment to the accumulated text.
  }
);

// Event listener for when the standard input stream ends.
process.stdin.on(
  'end',
  function () {
    // Split the accumulated text into an array of lines, based on newline characters.
    receivedText = receivedText.split('\n');

    // Initiate the main data processing routine.
    processData();
  }
);