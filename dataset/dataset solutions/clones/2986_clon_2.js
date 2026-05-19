var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  sourceData: rawData,
  currentPosition: 0,
  maximumElements: rawData.length,
  hasMoreItems: function() {
    return (this.currentPosition < this.maximumElements);
  },
  retrieveNext: function() {
    if (!this.hasMoreItems()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var itemToReturn = this.sourceData[this.currentPosition];
    this.currentPosition++;
    return itemToReturn;
  }
};

ExecuteProgram();

function fetchNext() {
  return dataStream.retrieveNext();
}

function fetchInteger() {
  return transformInput(fetchNext(), 1);
}

function fetchStringArray() { // Splits by half-width space
  return transformInput(fetchNext(), 2);
}

function fetchIntegerArray() { // Splits by half-width space and converts to numbers
  return transformInput(fetchNext(), 4);
}

function fetchCharacterArray() { // Splits into individual characters
  return transformInput(fetchNext(), 6);
}

function checkMoreItems() {
  return dataStream.hasMoreItems();
}

function printOutput(content) { // Outputs to standard console
  console.log(content);
}

function printError(message) { // Outputs to standard error console
  console.error(message);
}

function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function ExecuteProgram() {
  var inputNumber = fetchInteger();

  // printError(calculateDivisors(inputNumber));
  var divisorCollection = calculateDivisors(inputNumber).sort(function(valA, valB) {
    return valB - valA;
  });

  var finalResult = 0;
  for (var loopCounter = 0; loopCounter < Math.floor(divisorCollection.length / 2); loopCounter++) {
    finalResult += divisorCollection[loopCounter] - 1;
    // printError(finalResult);
  }
  printOutput(finalResult);
}

function calculateDivisors(targetValue) {
  var divisorList = [];
  for (var divisorCandidate = 1; divisorCandidate * divisorCandidate <= targetValue; divisorCandidate++) {
    if (targetValue % divisorCandidate === 0) {
      divisorList.push(divisorCandidate);
      if (divisorCandidate * divisorCandidate !== targetValue) {
        divisorList.push(targetValue / divisorCandidate);
      }
    }
  }
  divisorList.sort(function(valA, valB) {
    return valA - valB;
  });
  return divisorList;
}
