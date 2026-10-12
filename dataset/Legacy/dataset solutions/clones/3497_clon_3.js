class InputParser {
  constructor(inputString) {
    this._sourceLines = inputString.split("\n");
    this._currentLineIndex = 0;
  }

  readToken(asString) {
    const lines = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let resultToken;

    if (typeof lines[lineIdx] === "string") {
      lines[lineIdx] = lines[lineIdx].split(" ").reverse();
    }

    if (Array.isArray(lines[lineIdx])) {
        resultToken = lines[lineIdx].pop();
        if (!lines[lineIdx].length) {
            this._currentLineIndex++;
        }
    } else {
        resultToken = undefined;
    }

    return asString ? resultToken : +resultToken;
  }

  _parseLineContent(lineContent, asString) {
    const tokens = lineContent.split(" ");
    return asString ? tokens : tokens.map(value => +value);
  }

  readLineTokens(asString) {
    const lineContent = this._sourceLines[this._currentLineIndex++];
    return this._parseLineContent(lineContent, asString);
  }

  readMultipleLines(count, asString) {
    const resultsArray = [];
    const lines = this._sourceLines;
    const startingLineIndex = this._currentLineIndex;

    for (let i = 0; i < count; i++) {
      const lineContent = lines[startingLineIndex + i];
      resultsArray[i] = this._parseLineContent(lineContent, asString);
    }
    this._currentLineIndex += count;
    return resultsArray;
  }
}

const inputReader = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function findDivisorsUpToSquareRoot(numberToFactor) {
  const divisorMap = {};
  for (let currentDivisor = 1; currentDivisor * currentDivisor <= numberToFactor; currentDivisor++) {
    if (numberToFactor % currentDivisor === 0) {
      divisorMap[currentDivisor] = numberToFactor / currentDivisor;
    }
  }
  return divisorMap;
}

console.log(solveProblem());
function solveProblem() {
  const targetN = inputReader.readToken();
  const targetM = inputReader.readToken();

  const allDivisorPairs = findDivisorsUpToSquareRoot(targetM);

  let maxValidDivisor = 1;

  for (const divisorKey of Object.keys(allDivisorPairs)) {
    const currentDivisor = +divisorKey;
    const correspondingFactor = allDivisorPairs[divisorKey];

    if (correspondingFactor >= targetN) {
      if (currentDivisor > maxValidDivisor) {
        maxValidDivisor = currentDivisor;
      }
    }
  }
  return maxValidDivisor;
}
