function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const numNodes = Number(firstLineParts[0]);
    const numConstraints = Number(firstLineParts[1]);

    const leftNodeIndices = [];
    const rightNodeIndices = [];
    const distanceValues = [];

    for (let i = 1; i <= numConstraints; i++) {
        const constraintParts = inputLines[i].split(" ");
        const currentL = Number(constraintParts[0]);
        const currentR = Number(constraintParts[1]);
        const currentD = Number(constraintParts[2]);

        if (currentL === currentR) {
            console.log('No');
            return;
        }

        leftNodeIndices.push(currentL);
        rightNodeIndices.push(currentR);
        distanceValues.push(currentD);
    }

    const nodeCoordinates = [];
    let overallResult = undefined;
    let highestCoordinateReached = 1;
    let inconsistencyDetected = false;

    for (let constraintIdx = 0; constraintIdx < numConstraints; constraintIdx++) {
        const lNode = leftNodeIndices[constraintIdx];
        const rNode = rightNodeIndices[constraintIdx];
        const dist = distanceValues[constraintIdx];

        const lNodeZeroIdx = lNode - 1;
        const rNodeZeroIdx = rNode - 1;

        if (constraintIdx === 0) {
            if (nodeCoordinates[lNodeZeroIdx] === undefined) {
                nodeCoordinates[lNodeZeroIdx] = 1;
            }
        }

        const leftNodeCoord = nodeCoordinates[lNodeZeroIdx];

        if (leftNodeCoord === undefined) {
            overallResult = 'No';
            inconsistencyDetected = true;
            break;
        }

        const expectedRightNodeCoord = leftNodeCoord + dist;
        highestCoordinateReached = Math.max(highestCoordinateReached, expectedRightNodeCoord);

        if (nodeCoordinates[rNodeZeroIdx] === undefined) {
            nodeCoordinates[rNodeZeroIdx] = expectedRightNodeCoord;
        } else {
            if (nodeCoordinates[rNodeZeroIdx] !== expectedRightNodeCoord) {
                overallResult = 'No';
                inconsistencyDetected = true;
                break;
            }
        }
    }

    if (inconsistencyDetected) {
        console.log(overallResult);
        return;
    }

    if (highestCoordinateReached > 1000000002) { // Equivalent to max-1 > 1000000001
        overallResult = 'No';
    }

    if (overallResult === undefined) {
        overallResult = 'Yes';
    }

    console.log(overallResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
