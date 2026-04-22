const fileSystemInterface = require('fs');

const retrievedData = fileSystemInterface.readFileSync(0).toString().split(/\r?\n/);

let processingIndex = 0;
while (processingIndex < retrievedData.length) {
    const currentEntry = retrievedData[processingIndex++];
    
    const numericalValues = currentEntry.split(' ').map(Number);
    const matrixHeight = numericalValues[0];
    const matrixWidth = numericalValues[1];

    if (!matrixHeight && !matrixWidth) {
        break;
    }

    const constructedMatrix = Array.from({ length: matrixHeight }, (_, rowIndex) => {
        return Array.from({ length: matrixWidth }, (_, colIndex) => {
            return (rowIndex % 2 === colIndex % 2) ? '#' : '.';
        }).join('');
    });

    process.stdout.write(constructedMatrix.join('\n') + '\n');
}