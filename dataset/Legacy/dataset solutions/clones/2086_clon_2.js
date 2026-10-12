var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  "sourceLines" : rawData,
  "currentIdx" : 0,
  "totalLines" : rawData.length,

  "hasMore" : function() {
    return (this.currentIdx < this.totalLines);
  },

  "fetchNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var lineContent = this.sourceLines[this.currentIdx];
    this.currentIdx++;
    return lineContent;
  }
};

ExecuteProgram();

function getNextLine() {
  return dataStream.fetchNext();
}

function getNextInt() {
  return dataConverter(getNextLine(), 1);
}

function getNextStrArr() {
  return dataConverter(getNextLine(), 2);
}

function getNextIntArr() {
  return dataConverter(getNextLine(), 4);
}

function getNextCharArr() {
  return dataConverter(getNextLine(), 6);
}

function hasMore() {
  return dataStream.hasMore();
}

function printOutput(content) {
  console.log(content);
}

function printError(errorMessage) {
  console.error(errorMessage);
}

function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((item) => Number(item));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((item) => Number(item));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (err) {
    return inputValue;
  }
}

function ExecuteProgram() {
  var firstLineData = getNextIntArr();
  var fridgeCount = firstLineData[0];
  var microwaveCount = firstLineData[1];
  var discountOffers = firstLineData[2];

  var fridgePrices = getNextIntArr();
  var microwavePrices = getNextIntArr();

  var minimumCost = Math.min.apply(null, fridgePrices) + Math.min.apply(null, microwavePrices);

  for (var offerIndex = 0; offerIndex < discountOffers; offerIndex++) {
    var currentOffer = getNextIntArr();
    var offerAdjustedCost = fridgePrices[currentOffer[0] - 1] + microwavePrices[currentOffer[1] - 1] - currentOffer[2];
    minimumCost = Math.min(offerAdjustedCost, minimumCost);
  }

  printOutput(minimumCost);
}
