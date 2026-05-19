var InputParserFactory = (function(){
  function createParser(sourceString){
      return new InputParser(sourceString);
  }

  function InputParser(sourceString){
      this._sourceLines = sourceString.trim().split("\n");
      this._currentLineIndex = 0;
  }

  InputParser.prototype.readNextToken = function(returnAsString){
    let currentLineData = this._sourceLines[this._currentLineIndex];

    if (typeof currentLineData === "string") {
      currentLineData = currentLineData.split(" ");
      this._sourceLines[this._currentLineIndex] = currentLineData;
    }

    let tokenValue = currentLineData.shift();

    if (currentLineData.length === 0) {
      this._currentLineIndex++;
    }

    return returnAsString ? tokenValue : +tokenValue;
  };

  InputParser.prototype.readLineTokens = function(returnAsString){
    var currentLineParts = this._sourceLines[this._currentLineIndex++].split(" ");
    if (returnAsString) {
        return currentLineParts;
    } else {
        return currentLineParts.map(itemStr => +itemStr);
    }
  };

  InputParser.prototype.readMatrix = function(numRows, returnAsString){
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(rowStr => rowStr.split(" "));
    if (returnAsString) {
        return matrixRows;
    } else {
        return matrixRows.map(row => row.map(cellStr => +cellStr));
    }
  };

  InputParser.prototype.readLines = function(numLines, returnAsString){
    var selectedLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    if (returnAsString) {
        return selectedLines;
    } else {
        return selectedLines.map(lineStr => +lineStr);
    }
  };

  return createParser;
})();

function createMatrix(height, width){
    const initialValue = 0;
    return Array(height).fill(initialValue).map(() => Array(width).fill(initialValue));
}

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin","utf8"));
var moduloConstant = 1e9+7;

function calculateModuloProduct(currentValue, multiplier, modulus) {
    return (currentValue * multiplier) % modulus;
}

console.log(main());

function main(){
  var inputLength = inputReader.readNextToken();
  var stringS = inputReader.readNextToken(true);
  var stringT = inputReader.readNextToken(true);

  function getInitialState(charS0, charT0) {
      let state = {
          currentResult: 3,
          isLastMoveVertical: false,
          loopStartIndex: 1
      };
      if (charS0 !== charT0) {
          state.currentResult = 6;
          state.isLastMoveVertical = true;
          state.loopStartIndex = 2;
      }
      return state;
  }

  let initialState = getInitialState(stringS[0], stringT[0]);
  let resultCount = initialState.currentResult;
  let lastWasVertical = initialState.isLastMoveVertical;
  let currentIndex = initialState.loopStartIndex;

  for (; currentIndex < inputLength; currentIndex++) {
    const charS_current = stringS[currentIndex];
    const charT_current = stringT[currentIndex];

    if (charS_current === charT_current) {
      if (!lastWasVertical) {
        resultCount = calculateModuloProduct(resultCount, 2, moduloConstant);
      }
      lastWasVertical = false;
    } else {
      currentIndex++;
      if (lastWasVertical) {
        resultCount = calculateModuloProduct(resultCount, 3, moduloConstant);
      } else {
        resultCount = calculateModuloProduct(resultCount, 2, moduloConstant);
      }
      lastWasVertical = true;
    }
  }
  return resultCount;
}
