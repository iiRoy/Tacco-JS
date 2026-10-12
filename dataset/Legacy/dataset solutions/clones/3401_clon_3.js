const InputParserFactory = (function() {
    function createInputParser(sourceText) {
        return new InputParser(sourceText);
    }

    class InputParser {
        constructor(sourceText) {
            this.sourceLines = sourceText.trim().split("\n");
            this.currentLineIndex = 0;
        }

        _ensureLineTokens() {
            if (typeof this.sourceLines[this.currentLineIndex] === "string") {
                this.sourceLines[this.currentLineIndex] = this.sourceLines[this.currentLineIndex].split(" ").reverse();
            }
        }

        readNextToken(returnAsString = false) {
            this._ensureLineTokens();
            const currentLineTokens = this.sourceLines[this.currentLineIndex];
            const token = currentLineTokens.pop();

            if (currentLineTokens.length === 0) {
                this.currentLineIndex++;
            }
            return returnAsString ? token : Number(token);
        }

        readLineTokens(returnAsStrings = false) {
            const line = this.sourceLines[this.currentLineIndex++];
            const tokens = line.split(" ");
            return returnAsStrings ? tokens : tokens.map(Number);
        }

        readMatrix(numRows, returnAsStrings = false) {
            const startIdx = this.currentLineIndex;
            this.currentLineIndex += numRows;
            const matrixRows = this.sourceLines.slice(startIdx, this.currentLineIndex).map(line => line.split(" "));
            return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(Number));
        }

        readLines(numLines, returnAsStrings = false) {
            const startIdx = this.currentLineIndex;
            this.currentLineIndex += numLines;
            const lines = this.sourceLines.slice(startIdx, this.currentLineIndex);
            return returnAsStrings ? lines : lines.map(Number);
        }
    }

    return createInputParser;
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
    const height = inputReader.readNextToken();
    const width = inputReader.readNextToken();
    const numObstacles = inputReader.readNextToken();

    const obstacleMap = Array.from({
        length: height + 1
    }, () => ({}));

    for (let i = 0; i < numObstacles; i++) {
        const obstacleCoords = inputReader.readLineTokens();
        const obstacleRow = obstacleCoords[0];
        const obstacleCol = obstacleCoords[1];

        if (obstacleRow < obstacleCol) {
            continue;
        }
        obstacleMap[obstacleCol][obstacleRow] = 1;
    }

    const boundaryCol = width + 1;
    for (let rowIdx = 1; rowIdx <= height; rowIdx++) {
        obstacleMap[rowIdx][boundaryCol] = 1;
    }

    let minSafeWidth = Number(Object.keys(obstacleMap[1])[0]) - 1;
    let currentPathCol = 2;

    const findNextClearColumn = (rowObstacles, startCol) => {
        let col = startCol;
        while (rowObstacles[col]) {
            col++;
        }
        return col;
    };

    for (let rowIdx = 2; rowIdx <= height && rowIdx <= minSafeWidth; rowIdx++) {
        currentPathCol = findNextClearColumn(obstacleMap[rowIdx], currentPathCol);

        const currentRowObstacles = obstacleMap[rowIdx];
        for (const obstacleColKey of Object.keys(currentRowObstacles)) {
            const obstacleCol = Number(obstacleColKey);

            if (currentPathCol >= obstacleCol) {
                continue;
            }

            const potentialNewMinSafeWidth = obstacleCol - 1;
            if (potentialNewMinSafeWidth < minSafeWidth) {
                minSafeWidth = potentialNewMinSafeWidth;
            }
            break;
        }

        currentPathCol++;
        if (currentPathCol > width) {
            break;
        }
    }

    return minSafeWidth;
}
