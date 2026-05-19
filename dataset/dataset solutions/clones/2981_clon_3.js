class InputParser {
  constructor(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  readSingleValue(isString) {
    let currentLineData = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineData === "string") {
      this._sourceLines[this._currentLineIndex] = currentLineData.split(" ").reverse();
    }
    let resultValue = this._sourceLines[this._currentLineIndex].pop();
    if (!this._sourceLines[this._currentLineIndex].length) {
      this._currentLineIndex++;
    }
    return isString ? resultValue : +resultValue;
  }

  readLineValues(isString) {
    const lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    return isString ? lineContent : lineContent.map(val => +val);
  }

  readMatrix(numRows, isString) {
    const matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map(line => line.split(" "));
    return isString ? matrixRows : matrixRows.map(row => row.map(val => +val));
  }

  readRawLines(numLines, isString) {
    const rawLines = this._sourceLines.slice(this._currentLineIndex, (this._currentLineIndex += numLines));
    return isString ? rawLines : rawLines.map(line => +line);
  }
}

const createInputParser = (sourceString) => new InputParser(sourceString);

const parserInstance = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
  const args = arguments;
  let argCount = args.length;
  let evalString = `Array(args[${--argCount}]).fill(0).map(x=>{return ${initialValue};})`;
  while (--argCount) {
    evalString = `Array(args[${argCount}]).fill(0).map(x=>${evalString})`;
  }
  return eval(evalString);
}

console.log(processInputAndCalculate());

function countABPairsInString(targetString) {
  let abCount = 0;
  if (targetString.length < 2) {
    return abCount;
  }
  for (let charIndex = 0; charIndex < targetString.length - 1; charIndex++) {
    if (targetString[charIndex] === "A" && targetString[charIndex + 1] === "B") {
      abCount++;
    }
  }
  return abCount;
}

function processInputAndCalculate() {
  const numberOfInputStrings = parserInstance.readSingleValue();
  const stringCollection = parserInstance.readRawLines(numberOfInputStrings, true);

  let countEndsWithA = 0;
  let countStartsB = 0;
  let countStartsBEndsA = 0;
  let totalABConnections = 0;

  for (let stringIndex = 0; stringIndex < numberOfInputStrings; stringIndex++) {
    const currentString = stringCollection[stringIndex];
    const currentStringLength = currentString.length;

    totalABConnections += countABPairsInString(currentString);

    const firstCharacter = currentString[0];
    const lastCharacter = currentString[currentStringLength - 1];

    if (firstCharacter === "B") {
      if (lastCharacter === "A") {
        countStartsBEndsA++;
      } else {
        countStartsB++;
      }
    } else if (lastCharacter === "A") {
      countEndsWithA++;
    }
  }

  const minBoundaryCount = Math.min(countEndsWithA, countStartsB);
  const maxBoundaryCount = Math.max(countEndsWithA, countStartsB);

  if (maxBoundaryCount > 0) {
    totalABConnections += minBoundaryCount;
    if (countStartsBEndsA > 0) {
      totalABConnections += countStartsBEndsA;
    }
  } else {
    totalABConnections += countStartsBEndsA - 1;
  }

  return totalABConnections;
}
