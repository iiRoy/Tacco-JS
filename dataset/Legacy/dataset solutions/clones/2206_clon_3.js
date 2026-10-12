"use strict";

const parseValues = (values, asString) =>
  asString ? values : values.map((val) => +val);

class InputParser {
  constructor(sourceString) {
    this.sourceLines = sourceString.trim().split("\n");
    this.currentLineIndex = 0;
  }

  readNextValue(asString = false) {
    let currentLineData = this.sourceLines[this.currentLineIndex];
    if (typeof currentLineData === "string") {
      this.sourceLines[this.currentLineIndex] = currentLineData
        .split(" ")
        .reverse();
      currentLineData = this.sourceLines[this.currentLineIndex];
    }

    const extractedValue = currentLineData.pop();
    if (!currentLineData.length) {
      this.currentLineIndex++;
    }
    return asString ? extractedValue : +extractedValue;
  }

  readLineValues(asString = false) {
    const lineContent = this.sourceLines[this.currentLineIndex++].split(" ");
    return parseValues(lineContent, asString);
  }

  readMatrix(numRows, asString = false) {
    const startIdx = this.currentLineIndex;
    this.currentLineIndex += numRows;
    const matrixRows = this.sourceLines
      .slice(startIdx, this.currentLineIndex)
      .map((line) => line.split(" "));
    return asString
      ? matrixRows
      : matrixRows.map((row) => parseValues(row, asString));
  }

  readRows(numRows, asString = false) {
    const startIdx = this.currentLineIndex;
    this.currentLineIndex += numRows;
    const rows = this.sourceLines.slice(startIdx, this.currentLineIndex);
    return parseValues(rows, asString);
  }
}

const InputParserFactory = (sourceString) => new InputParser(sourceString);

const inputReader = InputParserFactory(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

function createMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimCount = dimensions.length;
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return ${initialValue};})`;
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

const programResult = executeLogic();
if (programResult !== undefined) console.log(programResult);

function executeLogic() {
  const numItems = inputReader.readNextValue();
  const distanceThreshold = inputReader.readNextValue();
  const attackPower = inputReader.readNextValue();
  const itemData = inputReader.readMatrix(numItems).sort((a, b) => a[0] - b[0]);

  let totalAttacks = 0;
  const activeAttacks = [];
  let activeAttacksStartIndex = 0;
  let currentDamageEffect = 0;

  const pruneExpiredAttacks = (currentItemPosition) => {
    const expirationPoint = currentItemPosition - distanceThreshold;
    while (activeAttacks.length > activeAttacksStartIndex) {
      const [attackEndTime, numAttacks] = activeAttacks[activeAttacksStartIndex];
      if (attackEndTime < expirationPoint) {
        currentDamageEffect -= numAttacks * attackPower;
        activeAttacksStartIndex++;
      } else {
        break;
      }
    }
  };

  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    const [currentItemPosition, currentItemHealth] = itemData[itemIndex];

    pruneExpiredAttacks(currentItemPosition);

    let remainingHealth = currentItemHealth - currentDamageEffect;

    if (remainingHealth <= 0) {
      continue;
    }

    const attacksRequired = Math.ceil(remainingHealth / attackPower);

    activeAttacks.push([currentItemPosition + distanceThreshold, attacksRequired]);
    totalAttacks += attacksRequired;
    currentDamageEffect += attacksRequired * attackPower;
  }
  return totalAttacks;
}
