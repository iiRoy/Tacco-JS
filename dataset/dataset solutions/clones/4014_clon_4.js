function processData(rawData) {
    const inputLines = rawData.split("\n");

    const [gridRowsStr, gridColsStr, incrementSizeStr] = inputLines[0].split(" ");
    const gridRows = Number(gridRowsStr);
    const gridCols = Number(gridColsStr);
    const incrementSize = Number(incrementSizeStr);

    const coordinateRegistry = new Map();
    for (let rIndex = 0; rIndex < gridRows; rIndex++) {
        const rowContent = inputLines[rIndex + 1].split(" ");
        for (let cIndex = 0; cIndex < rowContent.length; cIndex++) {
            const cellIdentifier = Number(rowContent[cIndex]);
            coordinateRegistry.set(cellIdentifier, [rIndex + 1, cIndex + 1]);
        }
    }

    const queryCount = Number(inputLines[gridRows + 1]);
    const pathSpecifications = [];
    for (let qIndex = 0; qIndex < queryCount; qIndex++) {
        const [originValStr, destinationValStr] = inputLines[gridRows + 2 + qIndex].split(" ");
        pathSpecifications.push({
            startPointValue: Number(originValStr),
            endPointValue: Number(destinationValStr)
        });
    }

    const computedDistances = pathSpecifications.map(pathSpec => {
        const { startPointValue, endPointValue } = pathSpec;
        let currentSegmentStart = startPointValue;
        const traversedValues = [];
        while (currentSegmentStart <= endPointValue) {
            traversedValues.push(currentSegmentStart);
            currentSegmentStart += incrementSize;
        }

        const totalPathLength = traversedValues.slice(0, -1).reduce((accumulatedLength, segmentBeginValue, idx) => {
            const segmentEndValue = traversedValues[idx + 1];

            const beginCoordinates = coordinateRegistry.get(segmentBeginValue);
            const endCoordinates = coordinateRegistry.get(segmentEndValue);

            const segmentLength = Math.abs(endCoordinates[0] - beginCoordinates[0]) + Math.abs(endCoordinates[1] - beginCoordinates[1]);
            return accumulatedLength + segmentLength;
        }, 0);

        return totalPathLength;
    });

    console.log(computedDistances.join("\n"));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
