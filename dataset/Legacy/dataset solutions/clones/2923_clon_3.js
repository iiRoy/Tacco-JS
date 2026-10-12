const InputParser = (function() {
    const convertToNumber = (value, asString) => asString ? value : +value;

    class ParserState {
        constructor(sourceContent) {
            this._sourceLines = sourceContent.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readNextValue(asStringFlag) {
            let currentLine = this._sourceLines[this._currentLineIndex];
            if (typeof currentLine === "string") {
                this._sourceLines[this._currentLineIndex] = currentLine.split(" ").reverse();
            }
            let value = this._sourceLines[this._currentLineIndex].pop();
            if (!this._sourceLines[this._currentLineIndex].length) {
                this._currentLineIndex++;
            }
            return convertToNumber(value, asStringFlag);
        }

        readLineValues(asStringFlag) {
            const line = this._sourceLines[this._currentLineIndex++].split(" ");
            return asStringFlag ? line : line.map(val => +val);
        }

        readMatrix(rowCount, asStringFlag) {
            const rows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount)
                                         .map(line => line.split(" "));
            return asStringFlag ? rows : rows.map(row => row.map(val => +val));
        }

        readRawLines(count, asStringFlag) {
            const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
            return asStringFlag ? lines : lines.map(line => +line);
        }
    }

    return function createParser(sourceContent) {
        return new ParserState(sourceContent);
    };
})();

const inputReader = InputParser(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    const args = [initialValue, ...dimensions];
    let dimCount = args.length;

    const initialValueLiteralString = `${initialValue}`;

    let arrayCreationString = `Array(args[${--dimCount}]).fill(0).map(x => ${initialValueLiteralString})`;

    while (dimCount > 0) {
        arrayCreationString = `Array(args[${--dimCount}]).fill(0).map(x => ${arrayCreationString})`;
    }

    return eval(arrayCreationString);
}

console.log(solveProblem());

function solveProblem(){
  const arraySize = inputReader.readNextValue();
  const dataArray = inputReader.readLineValues();
  let maxSum = 0;
  const halfSize = arraySize >> 1;

  const processStepLogic = (currentStep) => {
    const visitedIndices = new Set();
    let currentIterationSum = 0;
    for (let currentIndex = currentStep; currentIndex < arraySize; currentIndex += currentStep) {
      const symmetricIndex = arraySize - currentIndex - 1;

      const isIndexVisited = visitedIndices.has(currentIndex) || visitedIndices.has(symmetricIndex);
      const areIndicesIdentical = currentIndex === symmetricIndex;

      if (isIndexVisited || areIndicesIdentical) {
        break;
      }

      currentIterationSum += dataArray[currentIndex] + dataArray[symmetricIndex];
      maxSum = Math.max(maxSum, currentIterationSum);

      visitedIndices.add(currentIndex);
      visitedIndices.add(symmetricIndex);
    }
  };

  for (let step = 1; step < halfSize; step++) {
    processStepLogic(step);
  }

  return maxSum;
}
