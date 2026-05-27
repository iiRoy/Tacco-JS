"use strict";

class InputProcessor {
  constructor(sourceTextContent, defaultParsingFunction = Number) {
    this._sourceLines = sourceTextContent.split("\n");
    this._currentWordIndex = 0;
    this._currentLineIndex = 0;
    this._defaultParser = defaultParsingFunction;
  }

  readNextToken(customParserFunction) {
    const currentLineContent = this._sourceLines[this._currentLineIndex];

    if (currentLineContent === undefined) {
      return undefined;
    }

    const lineTokens = currentLineContent.trim().split(" ");
    const tokenToProcess = lineTokens[this._currentWordIndex];

    this._currentWordIndex++;

    const advanceToNextLineIfNeeded = () => {
      if (this._currentWordIndex === lineTokens.length) {
        this._currentWordIndex = 0;
        this._currentLineIndex++;
      }
    };
    advanceToNextLineIfNeeded();

    const effectiveParser = customParserFunction || this._defaultParser;
    const parsedValue = effectiveParser(tokenToProcess);
    return parsedValue;
  }

  readLineTokens(lineTokenParserFunction) {
    const currentLineData = this._sourceLines[this._currentLineIndex];

    if (currentLineData === undefined) {
      return undefined;
    }

    this._currentWordIndex = 0;
    this._currentLineIndex++;

    const effectiveLineParser = lineTokenParserFunction || this._defaultParser;
    const processedTokens = currentLineData.split(" ").map(effectiveLineParser);
    return processedTokens;
  }
}

module.exports = InputProcessor;

function processInputAndCalculate(rawInputText) {
  const inputReader = new InputProcessor(rawInputText);

  const firstNumericValue = inputReader.readNextToken();
  const secondNumericValue = inputReader.readNextToken();

  const performCalculation = (val1, val2) => {
    const difference = val1 - val2;
    const finalResult = difference + 1;
    return finalResult;
  };

  const calculatedOutput = performCalculation(firstNumericValue, secondNumericValue);
  console.log(calculatedOutput);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
