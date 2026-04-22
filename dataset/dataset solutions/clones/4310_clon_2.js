process.standardInput.continueStream();
process.standardInput.specifyEncoding('utf8'); // Establish the character encoding for input stream

let inputBuffer = ''; // Initialize a buffer to gather all incoming data

process.standardInput.attachEventHandler('dataReceived', function (dataChunk) {
  inputBuffer += dataChunk; // Concatenate each piece of data to the buffer
});

process.standardInput.attachEventHandler('streamEnd', function () {
  // Upon conclusion of the input stream, process the buffered data
  // by splitting it into individual lines and passing to the core function.
  ExecuteComparison(inputBuffer.split(/\r?\n/));
});

function ExecuteComparison (linesOfData) {
  // Extract and parse the first set of numbers
  const countOne = parseInt(linesOfData[0], 10);
  const stringValuesOne = linesOfData[1].split(' ');
  let numericValuesOne = new Array(countOne);
  for (let indexOne = 0; indexOne < countOne; indexOne++) {
    numericValuesOne[indexOne] = parseInt(stringValuesOne[indexOne], 10);
  }

  // Extract and parse the second set of numbers
  const countTwo = parseInt(linesOfData[2], 10);
  const stringValuesTwo = linesOfData[3].split(' ');
  let numericValuesTwo = new Array(countTwo);
  for (let indexOne = 0; indexOne < countTwo; indexOne++) {
    numericValuesTwo[indexOne] = parseInt(stringValuesTwo[indexOne], 10);
  }

  // Arrange the first collection in ascending order
  numericValuesOne.sort(function (valueA, valueB) {
    if (valueA < valueB) {
      return -1; // Indicate valueA comes before valueB
    }
    if (valueA > valueB) {
      return 1; // Indicate valueA comes after valueB
    }
    return 0; // Values are considered equal
  });

  // Arrange the second collection in ascending order
  numericValuesTwo.sort(function (valueA, valueB) {
    if (valueA < valueB) {
      return -1; // valueA should precede valueB
    }
    if (valueA > valueB) {
      return 1; // valueA should follow valueB
    }
    return 0; // valueA and valueB are identical
  });

  // Commence the element-by-element comparison between the two sorted arrays
  // This process checks if every element in 'numericValuesTwo' can be found
  // sequentially in 'numericValuesOne'.
  let matchFound = false;
  let indexTwo = 0; // Pointer for iterating through 'numericValuesOne'
  for (let indexOne = 0; indexOne < countTwo; indexOne++) {
    matchFound = false; // Reset the match flag for the current element of 'numericValuesTwo'
    // Search for the current element of 'numericValuesTwo' within 'numericValuesOne'
    // starting from the last successful match's position.
    for (; indexTwo < countOne; indexTwo++) {
      if (numericValuesTwo[indexOne] == numericValuesOne[indexTwo]) {
        matchFound = true; // A corresponding element was located
        indexTwo++; // Advance the pointer in 'numericValuesOne' to look for the next element
        break; // Exit the inner loop as a match for the current 'numericValuesTwo' element is found
      }
    }
    if (!matchFound) {
      // If no match was identified for the current element from 'numericValuesTwo',
      // the overall condition is not met, so terminate the process.
      break;
    }
  }

  // Present the outcome of the comparison
  if (matchFound) {
    console.log('YES');
  } else {
    console.log('NO');
  }

  return 0; // Signal successful operation completion
}