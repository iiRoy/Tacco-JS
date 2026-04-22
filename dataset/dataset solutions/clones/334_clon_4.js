class DataStreamProcessor {
    constructor(rawContent) {
        this.lineSegments = rawContent.split("\n");
        this.segmentIndex = 0;
    }

    obtainSegment() {
        if (this.segmentIndex < this.lineSegments.length) {
            return this.lineSegments[this.segmentIndex++];
        }
        return null;
    }

    extractNumericValues(adjustmentRequested = false) {
        const currentSegment = this.obtainSegment();
        if (currentSegment === null || currentSegment.trim() === '') return [];
        
        const stringValues = currentSegment.split(' ');
        const numericalValues = stringValues.map(Number);
        
        return numericalValues;
    }
}

const reportOutcome = console.log;

function executeGridTraversal(sourceMaterial) {
    const dataSource = new DataStreamProcessor(sourceMaterial);

    const movementSchema = new Map([
        ['>', [1, 0]],
        ['v', [0, 1]],
        ['^', [0, -1]],
        ['<', [-1, 0]]
    ]);

    let spatialExtent;
    while ( (spatialExtent = dataSource.extractNumericValues()).length > 0 && spatialExtent[0] !== 0) {
        const rowCount = spatialExtent[0];

        const cartographicMatrix = Array.from({ length: rowCount }, () => 
            dataSource.obtainSegment().split('')
        );

        let horizontalPos = 0;
        let verticalPos = 0;
        const visitedCoordinates = new Set();

        while (true) {
            // Check for valid position within the grid boundaries
            if (verticalPos < 0 || verticalPos >= rowCount || horizontalPos < 0 || horizontalPos >= cartographicMatrix[0].length) {
                 // This condition should ideally not be met if the problem guarantees a path to '.' or 'a' within bounds
                 // For robustness, an error could be reported, but original code relies on valid paths.
                 break; 
            }

            const currentCellSymbol = cartographicMatrix[verticalPos][horizontalPos];
            const currentCoordinateKey = `${horizontalPos},${verticalPos}`;

            if (currentCellSymbol === '.') {
                reportOutcome(horizontalPos, verticalPos);
                break;
            }

            if (visitedCoordinates.has(currentCoordinateKey)) {
                reportOutcome("LOOP");
                break;
            }

            visitedCoordinates.add(currentCoordinateKey);

            const deltaCoordinates = movementSchema.get(currentCellSymbol);
            if (!deltaCoordinates) {
                // Should not occur with valid input
                reportOutcome("ERROR: Invalid grid symbol encountered.");
                break;
            }

            horizontalPos += deltaCoordinates[0];
            verticalPos += deltaCoordinates[1];
        }
    }
}

executeGridTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));