const sourceReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const acquiredData = [];

sourceReader.on('line', (rowText) => {
    acquiredData.push(rowText);
});

sourceReader.on('close', () => {
    (async () => {
        const [firstSegment, secondSegment, ...excessSegments] = acquiredData;
        
        const primaryNumber = parseInt(firstSegment, 10);
        const secondaryNumber = parseInt(secondSegment, 10);

        const computedValue = (secondaryNumber * 2) - primaryNumber;

        console.log(computedValue);
    })().catch(err => {
        console.error("An error occurred during processing:", err);
        process.exit(1);
    });
});