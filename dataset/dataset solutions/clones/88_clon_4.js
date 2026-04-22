const fileSystemAdapter = require('fs');
const standardInputLocation = '/dev/stdin';

const entireInputContent = fileSystemAdapter.readFileSync(standardInputLocation, 'utf8');

const processedInputLines = entireInputContent.trim().split('\n');

const totalCaseCount = Number(processedInputLines.shift());

const evaluateVectorAlignment = (lineDataString) => {
    const numericalComponents = lineDataString.split(' ').map(Number);

    const firstPointX = numericalComponents[0];
    const firstPointY = numericalComponents[1];
    const secondPointX = numericalComponents[2];
    const secondPointY = numericalComponents[3];
    const thirdPointX = numericalComponents[4];
    const thirdPointY = numericalComponents[5];
    const fourthPointX = numericalComponents[6];
    const fourthPointY = numericalComponents[7];

    const vectorADX = secondPointX - firstPointX;
    const vectorADY = secondPointY - firstPointY;
    const vectorBDX = fourthPointX - thirdPointX;
    const vectorBDY = fourthPointY - thirdPointY;

    const crossProductTermOne = (vectorADX * vectorBDY).toFixed(12);
    const crossProductTermTwo = (vectorBDX * vectorADY).toFixed(12);

    return crossProductTermOne === crossProductTermTwo ? 'YES' : 'NO';
};

const finalResults = processedInputLines.slice(0, totalCaseCount).map(evaluateVectorAlignment);

finalResults.forEach(outcomeMessage => console.log(outcomeMessage));