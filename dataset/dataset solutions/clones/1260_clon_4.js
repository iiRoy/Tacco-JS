const acquiredContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const rawTextLines = acquiredContent.split('\n');

const stopMarkerIndex = rawTextLines.findIndex(segment => segment.trim() === '0 0');
const actionableLines = rawTextLines.slice(0, stopMarkerIndex === -1 ? rawTextLines.length : stopMarkerIndex);

const constructedOutputBlocks = actionableLines.map(lineValue => {
    const numericalComponents = lineValue.split(' ').map(component => parseInt(component, 10));
    
    let blockHeightDimension = numericalComponents[0];
    let blockWidthDimension = numericalComponents[1];

    if (isNaN(blockHeightDimension) || blockHeightDimension < 0) {
        blockHeightDimension = 0;
    }
    if (isNaN(blockWidthDimension) || blockWidthDimension < 0) {
        blockWidthDimension = 0;
    }

    const singleRowPattern = '*'.repeat(blockWidthDimension) + '\n';
    const completeBlockStructure = singleRowPattern.repeat(blockHeightDimension);

    return completeBlockStructure + '\n';
});

console.log(constructedOutputBlocks.join(''));