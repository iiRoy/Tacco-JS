'use strict'

const analyzeNumericSeries = (inputString) => {
    const rawNumbers = inputString.match(/\d+/g);
    const alphaNum = parseInt(rawNumbers[0], 10);
    const betaNum = parseInt(rawNumbers[1], 10);

    const tally = Math.ceil(alphaNum / 2);

    return (tally > betaNum) ? 'YES' : 'NO';
};

const orchestrateExecution = (filePath) => {
    const fileContent = require('fs').readFileSync(filePath, 'utf8');
    const finalResult = analyzeNumericSeries(fileContent);
    console.log(finalResult);
};

orchestrateExecution('/dev/stdin');