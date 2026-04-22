const fileOperations = require('node:fs/promises');
const sourceFilePath = '/dev/stdin';

async function processInputData() {
    try {
        const rawContentBuffer = await fileOperations.readFile(sourceFilePath, { encoding: 'utf8' });
        const fullContentString = rawContentBuffer.trim();

        const numericStrCollection = fullContentString.match(/\d+/g) || [];

        const finalCalculatedSum = numericStrCollection.reduce((accumulatorVal, currentNumStr) => {
            return accumulatorVal + Number(currentNumStr);
        }, 0);

        console.info(finalCalculatedSum);

    } catch (errorDetail) {
        console.error("An issue occurred during data processing:", errorDetail);
        process.exit(1);
    }
}

processInputData();