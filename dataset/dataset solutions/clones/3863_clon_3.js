const inputParserFactory = (() => {
  const convertToNumbers = (stringArray) => stringArray.map(val => +val);

  class InputReader {
    constructor(sourceString) {
      this.sourceLines = sourceString.trim().split("\n");
      this.currentLineIndex = 0;
    }

    readSingleValue(returnAsString) {
      let lineContent = this.sourceLines[this.currentLineIndex];

      if (typeof lineContent === "string") {
        this.sourceLines[this.currentLineIndex] = lineContent.split(" ").reverse();
        lineContent = this.sourceLines[this.currentLineIndex];
      }

      const extractedValue = lineContent.pop();

      if (lineContent.length === 0) {
        this.currentLineIndex++;
      }

      return returnAsString ? extractedValue : +extractedValue;
    }

    readLineValues(returnAsStrings) {
      const lineData = this.sourceLines[this.currentLineIndex++].split(" ");
      return returnAsStrings ? lineData : convertToNumbers(lineData);
    }

    readMatrix(rowCount, returnAsStrings) {
      const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + rowCount)
        .map(line => line.split(" "));
      this.currentLineIndex += rowCount;
      return returnAsStrings ? matrixRows : matrixRows.map(row => convertToNumbers(row));
    }

    readRawLines(rowCount, returnAsStrings) {
      const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + rowCount);
      this.currentLineIndex += rowCount;
      return returnAsStrings ? rawLines : convertToNumbers(rawLines);
    }
  }

  return (inputString) => new InputReader(inputString);
})();

const inputReader = inputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateCombinations(count) {
  if (count < 2) {
    return 0;
  }
  return count * (count - 1) / 2;
}

function main() {
  const arrayLength = inputReader.readSingleValue();
  const dataArray = inputReader.readLineValues();

  const prefixSumCounts = new Map();
  prefixSumCounts.set(0, 1);

  let totalPairs = 0;
  let currentPrefixSum = 0;

  for (let idx = 0; idx < arrayLength; idx++) {
    currentPrefixSum += dataArray[idx];
    const existingCount = prefixSumCounts.get(currentPrefixSum) || 0;
    prefixSumCounts.set(currentPrefixSum, existingCount + 1);
  }

  for (const count of prefixSumCounts.values()) {
    totalPairs += calculateCombinations(count);
  }

  return totalPairs;
}

console.log(main());
