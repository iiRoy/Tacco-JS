"use strict";

class InputParser {
    constructor(sourceText, parseFunction) {
        this.lines = sourceText.split("\n");
        this.currentColumn = 0;
        this.currentLine = 0;
        this.defaultParseFn = parseFunction || Number;
    }

    _getCurrentLineTokens() {
        const lineContent = this.lines[this.currentLine];
        if (lineContent === undefined) {
            return undefined;
        }
        return lineContent.trim().split(" ");
    }

    readNextToken(customParseFn) {
        const effectiveParseFn = customParseFn || this.defaultParseFn;
        let tokensOnCurrentLine = this._getCurrentLineTokens();

        if (tokensOnCurrentLine === undefined) {
            return undefined;
        }

        const currentTokenValue = tokensOnCurrentLine[this.currentColumn];
        this.currentColumn++;

        if (tokensOnCurrentLine.length === this.currentColumn) {
            this.currentColumn = 0;
            this.currentLine++;
        }

        return effectiveParseFn(currentTokenValue);
    }

    readLineTokens(lineParseFn) {
        const lineContent = this.lines[this.currentLine];
        if (lineContent === undefined) {
            return undefined;
        }
        this.currentColumn = 0;
        this.currentLine++;
        const effectiveParseFn = lineParseFn || this.defaultParseFn;
        return lineContent.split(" ").map(effectiveParseFn);
    }
}

module.exports = InputParser;

function processInput(inputData) {
  const dataParser = new InputParser(inputData);

  const mValue = dataParser.readNextToken();
  const kValue = dataParser.readNextToken();

  const EXPECTED_K_VALUE = 0;

  if (kValue === EXPECTED_K_VALUE) {
    const generateSymmetricSequence = (exponent) => {
      let sequenceElements = [];
      const sequenceUpperLimit = Math.pow(2, exponent);

      for (let index = 0; index < sequenceUpperLimit; index++) {
        sequenceElements.push(index);
      }

      for (let index = sequenceUpperLimit - 1; index >= 0; index--) {
        sequenceElements.push(index);
      }
      return sequenceElements;
    };

    const finalResultArray = generateSymmetricSequence(mValue);
    console.log(finalResultArray.join(" "));
  } else {
    console.log("-1");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
