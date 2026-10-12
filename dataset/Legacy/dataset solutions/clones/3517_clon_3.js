class InputReader {
  #sourceLines;
  #currentLineIndex;

  constructor(inputString) {
    this.#sourceLines = inputString.split("\n");
    this.#currentLineIndex = 0;
  }

  static #parseToNumber(value) {
    return +value;
  }

  readAtom(returnAsString = false) {
    let currentLineParts = this.#sourceLines[this.#currentLineIndex];
    if (typeof currentLineParts === "string") {
      this.#sourceLines[this.#currentLineIndex] = currentLineParts.split(" ").reverse();
      currentLineParts = this.#sourceLines[this.#currentLineIndex];
    }

    const extractedValue = currentLineParts.pop();
    if (!currentLineParts.length) {
      this.#currentLineIndex++;
    }
    return returnAsString ? extractedValue : InputReader.#parseToNumber(extractedValue);
  }

  readLine(returnAsString = false) {
    const lineContent = this.#sourceLines[this.#currentLineIndex++];
    const parts = lineContent.split(" ");
    return returnAsString ? parts : parts.map(InputReader.#parseToNumber);
  }

  readMatrix(rowCount, returnAsString = false) {
    const matrixResult = [];
    const startingLineIndex = this.#currentLineIndex;
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const lineParts = this.#sourceLines[startingLineIndex + rowIdx].split(" ");
      matrixResult[rowIdx] = returnAsString ? lineParts : lineParts.map(InputReader.#parseToNumber);
    }
    this.#currentLineIndex += rowCount;
    return matrixResult;
  }
}

const inputHandler = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeMainLogic());

function executeMainLogic() {
  const numPoints = inputHandler.readAtom();
  const coordinates = inputHandler.readMatrix(numPoints);

  const calculateSumParity = (valA, valB) => (valA + valB) & 1;

  const initialParity = calculateSumParity(coordinates[0][0], coordinates[0][1]);

  for (let pointIndex = 1; pointIndex < numPoints; pointIndex++) {
    const currentPoint = coordinates[pointIndex];
    const currentParity = calculateSumParity(currentPoint[0], currentPoint[1]);
    if (currentParity !== initialParity) {
      return -1;
    }
  }

  const numDirections = 32 - initialParity;
  const directionMagnitudes = new Array(numDirections);

  directionMagnitudes[0] = 1 << 30; // Equivalent to 1073741824

  for (let magnitudeIndex = 1; magnitudeIndex < numDirections; magnitudeIndex++) {
    directionMagnitudes[magnitudeIndex] = directionMagnitudes[magnitudeIndex - 1] >> 1;
  }

  if (numDirections === 32) {
    directionMagnitudes[31] = 1;
  }

  const generateMovementSequence = (pointCoords, magnitudes) => {
    let currentX = pointCoords[0];
    let currentY = pointCoords[1];
    let sequence = "";

    for (const magnitudeStep of magnitudes) {
      const absoluteX = Math.abs(currentX);
      const absoluteY = Math.abs(currentY);

      if (absoluteX > absoluteY) {
        if (currentX > 0) {
          currentX -= magnitudeStep;
          sequence += "R";
        } else {
          currentX += magnitudeStep;
          sequence += "L";
        }
      } else {
        if (currentY > 0) {
          currentY -= magnitudeStep;
          sequence += "U";
        } else {
          currentY += magnitudeStep;
          sequence += "D";
        }
      }
    }
    return sequence;
  };

  const moveSequences = coordinates.map(point => generateMovementSequence(point, directionMagnitudes));

  return `${numDirections}\n${directionMagnitudes.join(" ")}\n${moveSequences.join("\n")}`;
}
