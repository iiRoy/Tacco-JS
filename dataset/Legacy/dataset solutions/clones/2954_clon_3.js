"use strict";
function InputParser(sourceText, parseFunction){
    this._lines = sourceText.split("\n");
    this._columnIndex = 0;
    this._lineIndex = 0;
    this._defaultParseFunction = parseFunction || Number;
}

InputParser.prototype._advanceCursor = function(tokensOnCurrentLineLength) {
    this._columnIndex++;
    if (this._columnIndex === tokensOnCurrentLineLength) {
        this._columnIndex = 0;
        this._lineIndex++;
    }
};

InputParser.prototype.readNextToken = function(customParseFunction){
    var currentLineContent = this._lines[this._lineIndex];
    if(currentLineContent){
        var tokensOnLine = currentLineContent.trim().split(" ");
        var currentTokenValue = tokensOnLine[this._columnIndex];
        
        this._advanceCursor(tokensOnLine.length);
        
        return customParseFunction ? customParseFunction(currentTokenValue) : this._defaultParseFunction(currentTokenValue);
    }
    return undefined;
};

InputParser.prototype.readLineTokens = function(tokenParseFunction){
    var lineContent = this._lines[this._lineIndex];
    if(lineContent){
        this._columnIndex = 0;
        this._lineIndex++;
        return lineContent.split(" ").map(tokenParseFunction || this._defaultParseFunction);
    }
    return undefined;
};

module.exports = InputParser;

function isMonthValueValid(value) {
    const MIN_MONTH_VALUE = 1;
    const MAX_MONTH_VALUE = 12;
    return value >= MIN_MONTH_VALUE && value <= MAX_MONTH_VALUE;
}

function main(inputContent) {
  var dataParser = new InputParser(inputContent);

  var rawInputNumber = dataParser.readNextToken();
  
  if (rawInputNumber === undefined || isNaN(rawInputNumber)) {
      console.log("NA");
      return;
  }

  var firstTwoDigits = Math.floor(rawInputNumber / 100);
  var lastTwoDigits = rawInputNumber % 100;

  var isFirstPartAMonth = isMonthValueValid(firstTwoDigits);
  var isSecondPartAMonth = isMonthValueValid(lastTwoDigits);

  if (isFirstPartAMonth && isSecondPartAMonth) {
    console.log("AMBIGUOUS");
  } else if (isFirstPartAMonth) {
    console.log("MMYY");
  } else if (isSecondPartAMonth) {
    console.log("YYMM");
  } else {
    console.log("NA");
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
