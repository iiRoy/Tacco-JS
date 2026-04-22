let entireInputBuffer = '';
process.stdin.on('data', (chunkOfData) => {
    entireInputBuffer += chunkOfData.toString();
});

process.stdin.on('end', () => {
    let allInputLines = entireInputBuffer.trim().split('\n');
    let currentLineIndex = 0;

    const retrieveNextLine = () => allInputLines[currentLineIndex++];

    while (true) {
        let initialConfigLine = retrieveNextLine();
        if (initialConfigLine === "0 0") break;

        let [cubeDimension, ruleCount] = initialConfigLine.split(" ").map(Number);

        let fixedXPlaneCoordinates = new Set(); // Stores 'y,z' for points (x, y, z) where x varies
        let fixedYPlaneCoordinates = new Set(); // Stores 'x,z' for points (x, y, z) where y varies
        let fixedZPlaneCoordinates = new Set(); // Stores 'x,y' for points (x, y, z) where z varies

        for (let ruleIndex = 0; ruleIndex < ruleCount; ++ruleIndex) {
            let ruleDefinition = retrieveNextLine().split(" ");
            let ruleType = ruleDefinition[0];
            let firstValue = parseInt(ruleDefinition[1], 10);
            let secondValue = parseInt(ruleDefinition[2], 10);

            if (ruleType === "xy") { // Defines a plane where x=firstValue, y=secondValue, z is variable (rod parallel to Z-axis)
                fixedZPlaneCoordinates.add(`${firstValue},${secondValue}`);
            } else if (ruleType === "xz") { // Defines a plane where x=firstValue, z=secondValue, y is variable (rod parallel to Y-axis)
                fixedYPlaneCoordinates.add(`${firstValue},${secondValue}`);
            } else if (ruleType === "yz") { // Defines a plane where y=firstValue, z=secondValue, x is variable (rod parallel to X-axis)
                fixedXPlaneCoordinates.add(`${firstValue},${secondValue}`);
            }
        }

        let nonOccupiedSpaceCount = 0;

        for (let xCoord = 1; xCoord <= cubeDimension; ++xCoord) {
            for (let yCoord = 1; yCoord <= cubeDimension; ++yCoord) {
                for (let zCoord = 1; zCoord <= cubeDimension; ++zCoord) {
                    let isCurrentSpotOccupied = false;

                    // Check if (xCoord, yCoord, zCoord) is covered by a rule fixing Y and Z
                    if (fixedXPlaneCoordinates.has(`${yCoord},${zCoord}`)) {
                        isCurrentSpotOccupied = true;
                    }

                    // Check if (xCoord, yCoord, zCoord) is covered by a rule fixing X and Z
                    if (!isCurrentSpotOccupied && fixedYPlaneCoordinates.has(`${xCoord},${zCoord}`)) {
                        isCurrentSpotOccupied = true;
                    }

                    // Check if (xCoord, yCoord, zCoord) is covered by a rule fixing X and Y
                    if (!isCurrentSpotOccupied && fixedZPlaneCoordinates.has(`${xCoord},${yCoord}`)) {
                        isCurrentSpotOccupied = true;
                    }

                    if (!isCurrentSpotOccupied) {
                        nonOccupiedSpaceCount++;
                    }
                }
            }
        }
        console.log(nonOccupiedSpaceCount);
    }
});