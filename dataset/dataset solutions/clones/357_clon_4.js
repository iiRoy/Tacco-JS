const acquiredData = process.stdin.readFileSync(0, 'utf8');
const dataSegments = acquiredData.trim().split('\n');
let segmentPointer = 0;

function obtainNextSegment() {
    return dataSegments[segmentPointer++];
}

function processAllDatasets() {
    let computationOutcomes = [];

    while (true) {
        const dimensionSpecs = obtainNextSegment().split(' ').map(Number);
        const dimensionA = dimensionSpecs[0]; 
        const dimensionB = dimensionSpecs[1]; 

        if (dimensionA === 0 && dimensionB === 0) {
            break;
        }

        const gridRepresentation = []; 
        for (let rIndex = 0; rIndex < dimensionA; ++rIndex) {
            gridRepresentation.push(obtainNextSegment().split(''));
        }

        let componentTally = 0; 

        const displacementVectors = [[0, -1], [0, 1], [-1, 0], [1, 0]]; 

        const traverseAndMarkExtent = (startingRow, startingCol, characterIdentity, surfaceMap, maxRows, maxCols) => {
            const traversalQueue = []; 
            traversalQueue.push([startingRow, startingCol]);
            surfaceMap[startingRow][startingCol] = '~'; 

            let currentQueueHead = 0;

            while (currentQueueHead < traversalQueue.length) {
                const [activeRow, activeCol] = traversalQueue[currentQueueHead++];

                for (const [deltaRow, deltaCol] of displacementVectors) {
                    const adjacentGridRow = activeRow + deltaRow;
                    const adjacentGridCol = activeCol + deltaCol;

                    if (adjacentGridRow >= 0 && adjacentGridRow < maxRows &&
                        adjacentGridCol >= 0 && adjacentGridCol < maxCols) {
                        if (surfaceMap[adjacentGridRow][adjacentGridCol] === characterIdentity) {
                            surfaceMap[adjacentGridRow][adjacentGridCol] = '~'; 
                            traversalQueue.push([adjacentGridRow, adjacentGridCol]);
                        }
                    }
                }
            }
        };

        const targetSymbols = new Set(['@', '#', '*']); 

        for (let rIndex = 0; rIndex < dimensionA; ++rIndex) {
            for (let cIndex = 0; cIndex < dimensionB; ++cIndex) {
                const currentSymbol = gridRepresentation[rIndex][cIndex];
                if (targetSymbols.has(currentSymbol)) {
                    componentTally++;
                    traverseAndMarkExtent(rIndex, cIndex, currentSymbol, gridRepresentation, dimensionA, dimensionB);
                }
            }
        }
        computationOutcomes.push(componentTally);
    }
    return computationOutcomes;
}

const finalResults = processAllDatasets();
for(const outcome of finalResults) {
    console.log(outcome);
}