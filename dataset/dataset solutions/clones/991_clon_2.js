const fileSystem = require('fs');

const numericMeasurements = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const structureCount = numericMeasurements[0];
const columnSizes = numericMeasurements.slice(
    1,
    structureCount + 1
);

let largestPanel = 0;

for (
    let startingColumn = 0;
    startingColumn < columnSizes.length;
    startingColumn++
) {
    let limitingSize = Infinity;

    for (
        let endingColumn = startingColumn;
        endingColumn < columnSizes.length;
        endingColumn++
    ) {
        limitingSize = Math.min(
            limitingSize,
            columnSizes[endingColumn]
        );

        const panelWidth =
            endingColumn - startingColumn + 1;

        const panelArea =
            limitingSize * panelWidth;

        largestPanel = Math.max(
            largestPanel,
            panelArea
        );
    }
}

console.log(largestPanel);