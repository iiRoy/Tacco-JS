function processInput(inputString) {
    const inputLines = inputString.split("\n");

    const firstLine = inputLines.shift();
    const remainingLines = inputLines;

    const [heightVal, widthVal] = parseNumericArray(firstLine);

    const prepareSegmentData = (lines) => {
        const matrix = lines.map(line => line.split(' ').map(s => parseInt(s, 10)));
        matrix.unshift(null); // Make it 1-indexed for y
        return matrix;
    };
    const segmentData = prepareSegmentData(remainingLines);

    let minPathCounts = new Array(heightVal).fill(-1);

    const checkPathClearBelow = (currentX, currentY, data) => {
        const [segmentStart, segmentEnd] = data[currentY];
        return !(segmentStart <= currentX && currentX <= segmentEnd);
    };

    for (let startColumn = 1; startColumn <= widthVal; startColumn++) {
        let currentX = startColumn;
        let currentY = 1;
        let pathLength = 0;

        pathTraversalLoop: while (true) {
            pathLength++;

            if (checkPathClearBelow(currentX, currentY, segmentData)) {
                currentY++;
                const targetRowIndex = currentY - 2; // Convert 1-indexed y (after increment) to 0-indexed array index

                if (targetRowIndex >= 0 && targetRowIndex < heightVal) {
                    if (minPathCounts[targetRowIndex] === -1 || pathLength < minPathCounts[targetRowIndex]) {
                        minPathCounts[targetRowIndex] = pathLength;
                    }
                }
            } else {
                currentX++;
            }

            if (currentX > widthVal) {
                break pathTraversalLoop;
            }
        }
    }

    console.log(minPathCounts);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function parseNumericArray(inputString, delimiter = ' ') {
    return inputString.split(delimiter).map(s => parseInt(s, 10));
}
