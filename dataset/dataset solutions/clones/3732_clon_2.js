var parseInteger = (valueString) => parseInt(valueString, 10);

var parseIntegerArray = (stringCollection) => stringCollection.map((itemString) => parseInteger(itemString));

function findMinimum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var indexCounter = 1; indexCounter < argumentList.length; indexCounter++) {
    if (argumentList[indexCounter] < currentValue) {
      currentValue = argumentList[indexCounter];
    }
  }
  return currentValue;
}

function findMaximum() {
  var argumentList = arguments;
  var currentValue = argumentList[0];
  for (var indexCounter = 1; indexCounter < argumentList.length; indexCounter++) {
    if (argumentList[indexCounter] > currentValue) {
      currentValue = argumentList[indexCounter];
    }
  }
  return currentValue;
}

// Entry point for the application
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));

function executeProgram(programInput) {
  // Extract the first line as the limit
  var limitValue = programInput.split('\n')[0];
  var currentNumber = 1;
  var ninesCount = 0;
  var resultString; // Variable to hold the generated string

  // Loop from 1 up to the limit value
  for (var outerLoopIndex = 1; outerLoopIndex <= limitValue; outerLoopIndex++) {
    // Convert the current number to a string
    resultString = currentNumber.toString();

    // Append '9's based on the ninesCount
    for (var innerLoopIndex = 0; innerLoopIndex < ninesCount; innerLoopIndex++) {
      resultString += '9';
    }

    // Output the generated string
    console.log(resultString);

    // Increment the number for the next iteration
    currentNumber++;

    // If the number reaches 10, reset it to 1 and increment the count of '9's
    if (currentNumber === 10) {
      currentNumber = 1;
      ninesCount++;
    }
  }
}
