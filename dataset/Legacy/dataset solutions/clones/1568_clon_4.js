function parseInputData(inputTxt) {
    const lines = inputTxt.split("\n");
    const [heightDimension, widthDimension] = lines[0].split(' ').map(Number);

    const allowedTraversalGrid = Array(heightDimension + 1).fill(null).map(() => Array(widthDimension + 1).fill(true));

    lines.slice(1, heightDimension + 1).forEach((lineSegment, rowIndex) => {
        const currentGridRow = rowIndex + 1;
        const [blockStartColumn, blockEndColumn] = lineSegment.split(' ').map(Number);
        for (let colIndex = blockStartColumn; colIndex <= blockEndColumn; colIndex++) {
            allowedTraversalGrid[currentGridRow][colIndex] = false;
        }
    });

    return { gridHeight: heightDimension, gridWidth: widthDimension, traversalAllowance: allowedTraversalGrid };
}

function calculatePathMetrics(processedData) {
    const { gridHeight: h, gridWidth: w, traversalAllowance: allowed } = processedData;
    const minimumTraversalCounts = Array(h).fill(Infinity);

    Array.from({ length: w }, (_, i) => i + 1).forEach(initialColumn => {
        const traversePath = (currentXPosition, currentYPosition, currentPathLength) => {
            if (currentXPosition > w) return;

            const nextPathLength = currentPathLength + 1;
            const previousYPosition = currentYPosition;

            let nextXPosition = currentXPosition;
            let nextYPosition = currentYPosition;

            const canMoveToNextRow = (currentYPosition <= h && allowed[currentYPosition][currentXPosition]);

            if (canMoveToNextRow) {
                nextYPosition++;
            } else {
                nextXPosition++;
            }

            if (nextYPosition !== previousYPosition && nextYPosition >= 2 && nextYPosition <= h + 1) {
                const targetResultIndex = nextYPosition - 2;
                minimumTraversalCounts[targetResultIndex] = Math.min(
                    minimumTraversalCounts[targetResultIndex],
                    nextPathLength
                );
            }

            traversePath(nextXPosition, nextYPosition, nextPathLength);
        };

        traversePath(initialColumn, 1, 0);
    });

    return minimumTraversalCounts.map(value => (value === Infinity ? -1 : value));
}

function executeSimulation(rawInputData) {
    const processedInput = parseInputData(rawInputData);
    const finalMetrics = calculatePathMetrics(processedInput);
    console.log(finalMetrics);
}

executeSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
