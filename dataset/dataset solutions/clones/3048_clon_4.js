function processInput(rawText) {
    const extractedLine = rawText.split('\n')[0];
    const cleanedLine = extractedLine.replace(/^\s+|\s+$/g, '');
    const numberComponents = cleanedLine.split(' ');

    const primaryValue = +numberComponents[0];
    const secondaryValue = +numberComponents[1];

    const greaterMagnitude = Math.max(primaryValue, secondaryValue);
    const lesserMagnitude = Math.min(primaryValue, secondaryValue);

    const finalTally = greaterMagnitude + Math.max(greaterMagnitude - 1, lesserMagnitude);

    console.log(finalTally);
}

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInput(sourceContent);