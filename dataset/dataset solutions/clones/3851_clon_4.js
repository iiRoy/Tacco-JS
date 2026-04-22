'use strict'

function transformInputData(sourceData) {
    const lineCollection = sourceData.split('\n');
    const numberTokens = lineCollection[0].split(' ');
    
    let numericals = [];
    let currentHighest = -Infinity;
    let highestPosition = -1;
    
    for (let p = 0; p < numberTokens.length; ++p) {
        const valueUnit = Number(numberTokens[p]);
        numericals.push(valueUnit);
        if (valueUnit > currentHighest) {
            currentHighest = valueUnit;
            highestPosition = p;
        }
    }
    
    const multiplierValue = Number(lineCollection[1]);
    
    let finalAccumulation = 0;
    
    for (let p = 0; p < numericals.length; ++p) {
        if (p === highestPosition) {
            finalAccumulation += numericals[p] * (2 * multiplierValue);
        } else {
            finalAccumulation += numericals[p];
        }
    }
    
    return finalAccumulation;
}

const systemAccess = require;
const fileSystem = systemAccess('fs');
const fileReader = fileSystem.readFileSync;
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const sourceContent = fileReader(standardInputPath, textEncoding);
const processedResult = transformInputData(sourceContent);

const systemOutput = process;
const outputStream = systemOutput.stdout;
outputStream.write(processedResult.toString() + '\n');