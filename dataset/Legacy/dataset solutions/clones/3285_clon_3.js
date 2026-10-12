var InputParser = (function () {
    function createParser(sourceString) {
        return new ParserInstance(sourceString);
    }

    class ParserInstance {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readAtom(asString) {
            let currentLineTokens = this._sourceLines[this._currentLineIndex];
            if (typeof currentLineTokens === "string") {
                currentLineTokens = currentLineTokens.split(" ").reverse();
                this._sourceLines[this._currentLineIndex] = currentLineTokens;
            }

            const extractedToken = currentLineTokens.pop();

            if (currentLineTokens.length === 0) {
                this._currentLineIndex++;
            }

            return asString ? extractedToken : +extractedToken;
        }

        readLine(asString) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const tokens = lineContent.split(" ");
            return asString ? tokens : tokens.map(val => +val);
        }

        readMatrix(numRows, asString) {
            const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
            this._currentLineIndex += numRows;
            const parsedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
            return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
        }

        readRows(numRows, asString) {
            const rows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
            this._currentLineIndex += numRows;
            return asString ? rows : rows.map(val => +val);
        }
    }

    return createParser;
})();

var inputData = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processGrid());

function processGrid() {
    const height = inputData.readAtom();
    const width = inputData.readAtom();

    const gridMap = inputData.readRows(height, true);

    const visitedComponents = Array.from({ length: height }, () => Array(width).fill(0));

    let componentCount = 0;

    function exploreComponent(startRow, startCol, currentComponentId) {
        const queue = [[startRow, startCol]];
        visitedComponents[startRow][startCol] = currentComponentId;

        const deltaRows = [-1, 1, 0, 0];
        const deltaCols = [0, 0, -1, 1];

        let queueHead = 0;
        while (queueHead < queue.length) {
            const [currentRow, currentCol] = queue[queueHead++];
            
            for (let k = 0; k < 4; k++) {
                const nextRow = currentRow + deltaRows[k];
                const nextCol = currentCol + deltaCols[k];

                if (nextRow >= 0 && nextRow < height && nextCol >= 0 && nextCol < width) {
                    if (visitedComponents[nextRow][nextCol] === 0 && gridMap[currentRow][currentCol] !== gridMap[nextRow][nextCol]) {
                        visitedComponents[nextRow][nextCol] = currentComponentId;
                        queue.push([nextRow, nextCol]);
                    }
                }
            }
        }
    }

    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        for (let colIdx = 0; colIdx < width; colIdx++) {
            if (visitedComponents[rowIdx][colIdx] === 0) {
                componentCount++;
                exploreComponent(rowIdx, colIdx, componentCount);
            }
        }
    }

    const componentStats = Array.from({ length: componentCount + 1 }, () => [0, 0]);

    let totalPairs = 0;

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const currentComponentId = visitedComponents[row][col];
            if (gridMap[row][col] === ".") {
                componentStats[currentComponentId][0]++;
            } else {
                componentStats[currentComponentId][1]++;
            }
        }
    }

    for (let compId = 1; compId <= componentCount; compId++) {
        totalPairs += componentStats[compId][0] * componentStats[compId][1];
    }

    return totalPairs;
}
