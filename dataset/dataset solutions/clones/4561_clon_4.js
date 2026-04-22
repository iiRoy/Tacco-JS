const obtainInput = require('fs').readFileSync;
const inputPath = 0;
const textEncoding = 'utf8';

const processContent = (fullText) => {
    const allLines = fullText.trim().split('\n');

    const firstLine = allLines[0];
    const subsequentLines = allLines.slice(1);

    let parsedDimensions = [];
    let currentNumberString = '';
    for (let char of firstLine) {
        if (char === ' ') {
            parsedDimensions.push(Number(currentNumberString));
            currentNumberString = '';
        } else {
            currentNumberString += char;
        }
    }
    parsedDimensions.push(Number(currentNumberString));

    const contentRows = parsedDimensions[0];
    const contentColumns = parsedDimensions[1];

    const frameCharacter = '#';
    const frameLength = contentColumns + 2;
    const boundaryString = Array.from({ length: frameLength }, () => frameCharacter).join('');

    const transformedBody = subsequentLines
        .slice(0, contentRows)
        .map(lineItem => frameCharacter + lineItem + frameCharacter);

    const finalOutputSegments = [boundaryString, ...transformedBody, boundaryString];

    return finalOutputSegments.join('\n');
};

const outputResult = console.log;

outputResult(processContent(obtainInput(inputPath, textEncoding)));