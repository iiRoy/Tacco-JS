'use strict';

const acquireData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const transformInput = (rawString) => {
    const linesOfText = rawString.trim().split('\n');
    const totalElementsCount = parseInt(linesOfText[0], 10);
    const numericalSequence = linesOfText[1].split(' ').map(val => parseInt(val, 10)).sort((a, b) => a - b);
    return {
        count: totalElementsCount,
        sequence: numericalSequence
    };
};

const computeSolutions = (dataObject) => {
    const { count: len, sequence: values } = dataObject;
    let validCombinations = 0;

    for (let currentFirstIndex = 0; currentFirstIndex < len - 2; currentFirstIndex++) {
        let currentThirdIndex = currentFirstIndex + 2; 
        
        for (let currentSecondIndex = currentFirstIndex + 1; currentSecondIndex < len - 1; currentSecondIndex++) {
            while (currentThirdIndex < len && values[currentFirstIndex] + values[currentSecondIndex] > values[currentThirdIndex]) {
                currentThirdIndex++;
            }
            
            validCombinations += (currentThirdIndex - currentSecondIndex - 1);
        }
    }
    return validCombinations;
};

const presentResult = (finalCount) => {
    console.log(finalCount);
};

const orchestrateExecution = () => {
    const rawData = acquireData();
    const processedData = transformInput(rawData);
    const finalResult = computeSolutions(processedData);
    presentResult(finalResult);
};

orchestrateExecution();