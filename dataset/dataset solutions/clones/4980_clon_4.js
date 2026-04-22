class DataAcquirer {
    static acquiredDataSegment = "";
    static lineCollection = [];
    static currentLinePosition = 0;

    static initiateDataStream() {
        process.stdin.resume();
        process.stdin.setEncoding('utf8'); 
        process.stdin.on('data', (chunk) => {
            DataAcquirer.acquiredDataSegment += chunk;
        });
        process.stdin.on('end', () => {
            DataAcquirer.lineCollection = DataAcquirer.acquiredDataSegment.split("\n");
            executePrimaryLogic(); 
        });
        process.on('SIGINT', () => {
            DataAcquirer.lineCollection = DataAcquirer.acquiredDataSegment.split("\n");
            executePrimaryLogic();
            process.exit(0);
        });
    }

    static retrieveNextSegment() {
        return DataAcquirer.lineCollection[DataAcquirer.currentLinePosition++];
    }
}

async function executePrimaryLogic() {
    const gridParameters = DataAcquirer.retrieveNextSegment().split(" ").map(Number);
    const totalRows = gridParameters[0];
    const totalColumns = gridParameters[1];
    const totalPoints = gridParameters[2];

    const pointLocations = [];
    for (let pointIndex = 0; pointIndex < totalPoints; pointIndex++) {
        pointLocations.push(DataAcquirer.retrieveNextSegment().split(" ").map(Number));
    }

    const frequencyResult = analyzeGridOverlaps(totalRows, totalColumns, pointLocations);

    for (let distributionKey = 0; distributionKey < 10; distributionKey++) {
        console.log((frequencyResult.get(distributionKey) || 0).toString());
    }
}

function analyzeGridOverlaps(rowsDimension, columnsDimension, pointSet) {
    const squareTally = new Map(); 

    pointSet.forEach(currentPoint => {
        const pointRow = currentPoint[0];
        const pointColumn = currentPoint[1];

        for (let rowShift = 0; rowShift <= 2; rowShift++) {
            for (let columnShift = 0; columnShift <= 2; columnShift++) {
                const squareTopRow = pointRow - rowShift;
                const squareTopColumn = pointColumn - columnShift;

                if (squareTopRow >= 1 && squareTopRow <= rowsDimension - 2 && 
                    squareTopColumn >= 1 && squareTopColumn <= columnsDimension - 2) {
                    
                    const squareId = `${squareTopRow},${squareTopColumn}`;
                    squareTally.set(squareId, (squareTally.get(squareId) || 0) + 1);
                }
            }
        }
    });

    const finalCountDistribution = new Map();
    const overallPossibleSquares = (rowsDimension - 2) * (columnsDimension - 2);
    let countedSquares = 0;

    squareTally.forEach(occurrenceCount => {
        finalCountDistribution.set(occurrenceCount, (finalCountDistribution.get(occurrenceCount) || 0) + 1);
        countedSquares++;
    });

    finalCountDistribution.set(0, (finalCountDistribution.get(0) || 0) + (overallPossibleSquares - countedSquares));

    return finalCountDistribution;
}

DataAcquirer.initiateDataStream();