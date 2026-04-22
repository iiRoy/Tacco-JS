const filesystemModule = require('node:fs');
const standardEntryPath = '/dev/stdin';

function computeResult(dataSource) {
    let cleanedData = dataSource.replace(/^\s+|\s+$/g, '');

    const separatorIndex = cleanedData.indexOf(' ');
    const firstSegment = cleanedData.substring(0, separatorIndex);
    const secondSegment = cleanedData.substring(separatorIndex + 1);

    const initialQuantity = parseInt(firstSegment, 10);
    const auxiliaryQuantity = parseInt(secondSegment, 10);

    let combinedTotal = initialQuantity;
    combinedTotal += auxiliaryQuantity;

    const divisorValue = 24;
    let finalEvaluation = combinedTotal - Math.floor(combinedTotal / divisorValue) * divisorValue;

    process.stdout.write(finalEvaluation.toString() + '\n');
}

const rawTransmission = filesystemModule.readFileSync(standardEntryPath, 'utf8');
computeResult(rawTransmission);