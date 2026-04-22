const fileSystemModule = require('fs');

const rawInputDataStream = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

let gridLinesRaw = rawInputDataStream.trim().split("\n");

const dimensionsHeaderString = gridLinesRaw.shift();

const computedDistancesGrid = [];

function calculateCloudProximityForRow(singleGridRow) {
    const rowCharactersArray = singleGridRow.split("");
    const rowDistancesOutput = [];
    let cloudProximityCounter = -1;

    for (let charIndexPosition = 0; charIndexPosition < rowCharactersArray.length; charIndexPosition++) {
        const currentGridCharacter = rowCharactersArray[charIndexPosition];

        if (currentGridCharacter === "c") {
            rowDistancesOutput.push(0);
            cloudProximityCounter = 1;
        } else if (currentGridCharacter === ".") {
            if (cloudProximityCounter === -1) {
                rowDistancesOutput.push(-1);
            } else {
                rowDistancesOutput.push(cloudProximityCounter);
                cloudProximityCounter++;
            }
        }
    }
    return rowDistancesOutput;
}

for (const [currentRowIndex, currentGridRowData] of gridLinesRaw.entries()) {
    if (!currentGridRowData || currentGridRowData.trim().length === 0) {
        continue;
    }

    const individualRowDistances = calculateCloudProximityForRow(currentGridRowData);
    computedDistancesGrid.push(individualRowDistances);
}

const formattedRowsForOutput = computedDistancesGrid.map(rowArray => rowArray.join(' '));
const finalDisplayString = formattedRowsForOutput.join('\n');

console.log(finalDisplayString);