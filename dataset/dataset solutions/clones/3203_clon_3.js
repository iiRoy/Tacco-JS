"use strict";

class InputParser {
  constructor(sourceString, parseFunction) {
    this._sourceData = sourceString;
    this._currentTokenIndex = 0;
    this._currentLineIndex = 0;
    this._valueParser = parseFunction || Number;
    this._linesCache = this._sourceData.split("\n");
  }

  readNextToken() {
    const currentLine = this._linesCache[this._currentLineIndex];
    
    if (!currentLine) { 
        return undefined;
    }

    const tokensOnLine = currentLine.trim().split(" ");
    const currentToken = tokensOnLine[this._currentTokenIndex];
    this._currentTokenIndex++;

    if (tokensOnLine.length === this._currentTokenIndex) {
      this._currentTokenIndex = 0;
      this._currentLineIndex++;
    }

    return this._valueParser(currentToken);
  }

  readNextLine() {
    const lineContent = this._linesCache[this._currentLineIndex];
    this._currentTokenIndex = 0; 
    this._currentLineIndex++;

    return lineContent.split(" ").map(this._valueParser);
  }
}

const INITIAL_ARRAY_SIZE = 4;
const NUMBER_OF_PAIRS = 3;
const EXPECTED_RESULT_STRING = "1 1 2 2";

function processInput(rawInputData) {
  const parserInstance = new InputParser(rawInputData);

  const frequencyArray = Array(INITIAL_ARRAY_SIZE).fill(0);

  for (let loopCounter = 0; loopCounter < NUMBER_OF_PAIRS; loopCounter++) {
    const firstValue = parserInstance.readNextToken();
    const secondValue = parserInstance.readNextToken();
    
    frequencyArray[firstValue - 1]++;
    frequencyArray[secondValue - 1]++;
  }

  const currentResultString = frequencyArray.sort((valA, valB) => valA - valB).join(" ");

  if (currentResultString === EXPECTED_RESULT_STRING) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
