const inputProvider = require('node:fs');
const sourcePath = 0;

const characterSubstitutions = new Map([
    ['7', '9'],
    ['6', '8'],
    ['5', '7'],
    ['4', '5']
]);

const translateCharacter = (originalChar) => characterSubstitutions.get(originalChar) || originalChar;

const processNumericValue = (initialValue) => {
    if (initialValue === 0) {
        return '0';
    }

    let octalString = '';
    let transientValue = initialValue;

    while (transientValue > 0) {
        const remainder = transientValue % 8;
        octalString = remainder.toString() + octalString;
        transientValue = Math.floor(transientValue / 8);
    }

    let modifiedString = '';
    for (let idx = 0; idx < octalString.length; idx++) {
        modifiedString += translateCharacter(octalString[idx]);
    }
    return modifiedString;
};

const rawDataString = inputProvider.readFileSync(sourcePath, 'utf8');
const dataLines = rawDataString.split('\n').map(l => l.trim());

for (let currentLineIndex = 0; currentLineIndex < dataLines.length; currentLineIndex++) {
    const currentDatum = parseInt(dataLines[currentLineIndex], 10);

    if (currentDatum === 0) {
        break;
    }

    const finalOutput = processNumericValue(currentDatum);
    process.stdout.write(finalOutput + '\n');
}