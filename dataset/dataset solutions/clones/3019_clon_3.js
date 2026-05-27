"use strict";

class InputParser {
  constructor(sourceString, parseFn) {
    this.sourceLines = sourceString.split("\n");
    this.currentColumn = 0;
    this.currentLine = 0;
    this.valueParser = parseFn || Number;
  }

  _advanceCursor(lineTokensLength) {
    this.currentColumn++;
    if (lineTokensLength === this.currentColumn) {
      this.currentColumn = 0;
      this.currentLine++;
    }
  }

  readNextAtom() {
    const currentLineContent = this.sourceLines[this.currentLine];
    if (!currentLineContent) {
      return undefined;
    }
    const lineTokens = currentLineContent.trim().split(" ");
    const atomValue = lineTokens[this.currentColumn];
    this._advanceCursor(lineTokens.length);
    return this.valueParser(atomValue);
  }

  readFullLine() {
    const currentLineContent = this.sourceLines[this.currentLine];
    if (!currentLineContent) {
      return undefined;
    }
    this.currentColumn = 0;
    this.currentLine++;
    const tokensOnLine = currentLineContent.split(" ");
    return tokensOnLine.map(this.valueParser);
  }
}

function processInput(rawInputString) {
  const dataParser = new InputParser(rawInputString, String);

  const inputLengthN = Number(dataParser.readNextAtom());
  const targetString = dataParser.readNextAtom();

  const calculateInitialWhiteDots = (str) => {
    let count = 0;
    for (const char of str) {
      if (char === ".") {
        count++;
      }
    }
    return count;
  };

  let currentWhiteDots = calculateInitialWhiteDots(targetString);
  let currentBlackDots = 0;

  let minimumRequiredChanges = currentWhiteDots;

  const updateCountsAndMinimum = (char, blackCount, whiteCount, minChanges) => {
    let newBlack = blackCount;
    let newWhite = whiteCount;

    if (char === "#") {
      newBlack++;
    } else {
      newWhite--;
    }

    const currentTotalChanges = newBlack + newWhite;
    const updatedMin = Math.min(minChanges, currentTotalChanges);

    return { newBlack, newWhite, updatedMin };
  };

  for (let charIndex = 0; charIndex < targetString.length; charIndex++) {
    const currentChar = targetString[charIndex];
    const updateResult = updateCountsAndMinimum(
      currentChar,
      currentBlackDots,
      currentWhiteDots,
      minimumRequiredChanges
    );
    currentBlackDots = updateResult.newBlack;
    currentWhiteDots = updateResult.newWhite;
    minimumRequiredChanges = updateResult.updatedMin;
  }

  console.log(minimumRequiredChanges);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
