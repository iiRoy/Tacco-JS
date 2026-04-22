function processPathfinding(inputData) {
    const lines = inputData.split('\n');
    const dimensions = lines[0].split(' ').map(Number);
    const gridRows = dimensions[0];
    const gridCols = dimensions[1];

    const fieldLayout = [];
    for (let r = 1; r <= gridRows; ++r) {
        fieldLayout.push(lines[r].split(''));
    }

    const traversableNodes = [];
    const nodeCoordToId = new Map();
    const nodeIdToCoord = [];

    for (let r = 0; r < gridRows; ++r) {
        for (let c = 0; c < gridCols; ++c) {
            if (fieldLayout[r][c] === '.') {
                const currentIdentifier = traversableNodes.length;
                traversableNodes.push([r, c]);
                nodeCoordToId.set(`${r},${c}`, currentIdentifier);
                nodeIdToCoord.push([r, c]);
            }
        }
    }

    const totalNodes = traversableNodes.length;
    let overallMaxPath = 0;

    const computeLongestPathFromSingleSource = (sourceCellCoords) => {
        const sourceCellIdentifier = nodeCoordToId.get(`${sourceCellCoords[0]},${sourceCellCoords[1]}`);
        const currentPathLengths = new Array(totalNodes).fill(-1);
        currentPathLengths[sourceCellIdentifier] = 0;

        const traversalQueue = [sourceCellIdentifier];
        let maxPathFromThisSource = 0;

        const movementVectors = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        let queueHeadPointer = 0;
        while (queueHeadPointer < traversalQueue.length) {
            const currentNumericId = traversalQueue[queueHeadPointer++];
            const currentGridLocation = nodeIdToCoord[currentNumericId];
            const currentPathValue = currentPathLengths[currentNumericId];

            maxPathFromThisSource = Math.max(maxPathFromThisSource, currentPathValue);

            for (const [deltaRow, deltaCol] of movementVectors) {
                const nextRowPosition = currentGridLocation[0] + deltaRow;
                const nextColPosition = currentGridLocation[1] + deltaCol;

                if (nextRowPosition >= 0 && nextRowPosition < gridRows &&
                    nextColPosition >= 0 && nextColPosition < gridCols &&
                    fieldLayout[nextRowPosition][nextColPosition] === '.') {

                    const nextLocationKey = `${nextRowPosition},${nextColPosition}`;
                    const nextNumericId = nodeCoordToId.get(nextLocationKey);

                    if (currentPathLengths[nextNumericId] === -1) {
                        currentPathLengths[nextNumericId] = currentPathValue + 1;
                        traversalQueue.push(nextNumericId);
                    }
                }
            }
        }
        return maxPathFromThisSource;
    };

    for (const startingNode of traversableNodes) {
        overallMaxPath = Math.max(overallMaxPath, computeLongestPathFromSingleSource(startingNode));
    }

    console.log(overallMaxPath);
    return overallMaxPath;
}
processPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));