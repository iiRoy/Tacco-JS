function processInput(rawData) {
    const cleanedData = rawData.replace(/^\s+|\s+$/g, '');
    const matches = cleanedData.match(/1/g);
    const totalOnes = matches ? matches.length : 0;
    console.info(totalOnes);
}

const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
processInput(fileContent);