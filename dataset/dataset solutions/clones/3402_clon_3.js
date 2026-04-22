const InputProcessor = (() => {
    class InputReader {
        #allLines;
        #currentLineIndex;
        #lineTokensForReverseReading;
        #tokenIndexInReversedLine;

        constructor(sourceText) {
            this.#allLines = sourceText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

            this.#currentLineIndex = 0;
            this.#lineTokensForReverseReading = [];
            this.#tokenIndexInReversedLine = 0;
        }

        #prepareCurrentLineForReverseRetrieval() {
            if (this.#tokenIndexInReversedLine >= this.#lineTokensForReverseReading.length) {
                if (this.#currentLineIndex >= this.#allLines.length) {
                    return false;
                }

                const rawLine = this.#allLines[this.#currentLineIndex];
                this.#lineTokensForReverseReading = rawLine.split(/\s+/).reverse();
                this.#tokenIndexInReversedLine = 0;
            }
            return true;
        }

        retrieveNextElement(returnAsString = false) {
            if (!this.#prepareCurrentLineForReverseRetrieval()) {
                return undefined;
            }

            const token = this.#lineTokensForReverseReading[this.#tokenIndexInReversedLine++];

            if (this.#tokenIndexInReversedLine >= this.#lineTokensForReverseReading.length) {
                this.#currentLineIndex++;
                this.#lineTokensForReverseReading = [];
                this.#tokenIndexInReversedLine = 0;
            }

            return returnAsString ? token : Number(token);
        }

        fetchLineElements(returnAsString = false) {
            if (this.#currentLineIndex >= this.#allLines.length) {
                return [];
            }

            const rawLine = this.#allLines[this.#currentLineIndex];
            this.#currentLineIndex++;
            this.#lineTokensForReverseReading = [];
            this.#tokenIndexInReversedLine = 0;

            const tokens = rawLine.split(/\s+/).filter(t => t.length > 0);
            return returnAsString ? tokens : tokens.map(Number);
        }

        extractMatrix(numberOfLines, returnAsString = false) {
            const resultMatrix = [];
            for (let i = 0; i < numberOfLines; i++) {
                resultMatrix.push(this.fetchLineElements(returnAsString));
            }
            return resultMatrix;
        }

        collectSingleValueLines(numberOfLines, returnAsString = false) {
            const collectedValues = [];
            for (let i = 0; i < numberOfLines; i++) {
                const lineValues = this.fetchLineElements(returnAsString);
                if (lineValues.length > 0) {
                    collectedValues.push(lineValues[0]);
                } else {
                    collectedValues.push(returnAsString ? '' : NaN);
                }
            }
            return collectedValues;
        }
    }

    const createReaderInstance = (source) => new InputReader(source);
    return createReaderInstance;
})();

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const dataReader = InputProcessor(inputSource);

console.log(calculateMinimumPathRestriction());

function calculateMinimumPathRestriction() {
  const gridHeight = dataReader.retrieveNextElement();
  const gridWidth = dataReader.retrieveNextElement();
  const obstacleCount = dataReader.retrieveNextElement();

  const forbiddenCells = Array.from({ length: gridHeight + 1 }, () => ({}));

  for (let obstacleIndex = 0; obstacleIndex < obstacleCount; obstacleIndex++) {
    const obstacleCoordinates = dataReader.fetchLineElements();
    const currentObstacleColumn = obstacleCoordinates[0];
    const currentObstacleRow = obstacleCoordinates[1];

    if (currentObstacleColumn >= currentObstacleRow) {
      forbiddenCells[currentObstacleRow][currentObstacleColumn] = true;
    }
  }

  const rightBoundaryColumn = gridWidth + 1;
  for (let rowIterator = 1; rowIterator <= gridHeight; rowIterator++) {
    forbiddenCells[rowIterator][rightBoundaryColumn] = true;
  }

  const rowOneObstacleColumns = Object.keys(forbiddenCells[1]).map(Number).sort((a, b) => a - b);
  let minimumPathLimitColumn = gridWidth;
  if (rowOneObstacleColumns.length > 0) {
      minimumPathLimitColumn = rowOneObstacleColumns[0] - 1;
  }

  let currentTraversalColumn = 2;

  for (let currentRow = 2; currentRow <= minimumPathLimitColumn && currentRow <= gridHeight; currentRow++) {
    while (forbiddenCells[currentRow][currentTraversalColumn]) {
      currentTraversalColumn++;
    }

    const obstaclesInCurrentRow = Object.keys(forbiddenCells[currentRow]).map(Number).sort((a, b) => a - b);

    for (const obstacleColumn of obstaclesInCurrentRow) {
      if (currentTraversalColumn > obstacleColumn) {
        continue;
      }

      minimumPathLimitColumn = Math.min(minimumPathLimitColumn, obstacleColumn - 1);
      break;
    }

    currentTraversalColumn++;

    if (currentTraversalColumn > gridWidth) {
      break;
    }
  }

  return minimumPathLimitColumn;
}