function processGridConnections(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const dimensionLine = inputLines[0];
    const dimensionParts = dimensionLine.split(" ");
    const gridHeight = parseInt(dimensionParts[0], 10);
    const gridWidth = parseInt(dimensionParts[1], 10);

    const gridMatrix = [];
    const foundConnections = [];

    const OBSTACLE_CHAR = "#";
    const PATH_CHAR = ".";

    for (let rowIter = 0; rowIter < gridHeight; rowIter++) {
        const currentRowChars = inputLines[rowIter + 1].split("");
        gridMatrix.push(currentRowChars);
    }

    const isValidCoordinate = (r, c) => {
        return r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;
    };

    for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
        for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
            if (gridMatrix[currentRow][currentCol] !== OBSTACLE_CHAR) {
                continue;
            }

            const neighborOffsets = [
                [-1, 0],
                [0, -1],
                [1, 0],
                [0, 1]
            ];

            for (const [dr, dc] of neighborOffsets) {
                const neighborRow = currentRow + dr;
                const neighborCol = currentCol + dc;

                if (isValidCoordinate(neighborRow, neighborCol) && gridMatrix[neighborRow][neighborCol] === PATH_CHAR) {
                    foundConnections.push([
                        [currentRow, currentCol],
                        [neighborRow, neighborCol]
                    ]);
                }
            }
        }
    }

    console.log(foundConnections.length);
}

processGridConnections(require("fs").readFileSync("/dev/stdin", "utf8"));
