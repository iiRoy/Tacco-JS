const fileSystemUtility = require('node:fs');
const inputDataSource = '/dev/stdin';

function extractInputSections() {
    const rawDataBuffer = fileSystemUtility.readFileSync(inputDataSource, 'utf8');
    return rawDataBuffer.split('\n').map(entry => entry.trim()).filter(Boolean);
}

function processGeometricData() {
    const allInputSegments = extractInputSections();

    for (const currentInputLine of allInputSegments) {
        const valueComponents = currentInputLine.split(' ');
        const verticalDimension = Number(valueComponents[0]);
        const horizontalDimension = Number(valueComponents[1]);

        if (verticalDimension === 0 && horizontalDimension === 0) {
            break;
        }

        const characterRow = '#'.repeat(horizontalDimension);
        const structureLines = Array(verticalDimension).fill(characterRow);
        const finalDisplayContent = structureLines.join('\n') + '\n';

        process.stdout.write(finalDisplayContent);
    }
}

processGeometricData();