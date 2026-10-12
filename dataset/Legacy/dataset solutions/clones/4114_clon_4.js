function extractNumericPrefix(textualData) {
    let currentNumericValue = 0;
    let signFactor = 1;
    let position = 0;
    const dataLength = textualData.length;
    let digitEncountered = false;

    while (position < dataLength && /\s/.test(textualData[position])) {
        position++;
    }

    if (position < dataLength && textualData[position] === '-') {
        signFactor = -1;
        position++;
    } else if (position < dataLength && textualData[position] === '+') {
        position++;
    }

    while (position < dataLength) {
        const character = textualData[position];
        if (character >= '0' && character <= '9') {
            currentNumericValue = currentNumericValue * 10 + (character.charCodeAt(0) - '0'.charCodeAt(0));
            digitEncountered = true;
            position++;
        } else {
            break;
        }
    }

    if (!digitEncountered) {
        return NaN;
    }

    return currentNumericValue * signFactor;
}

function processInputAndCalculate(sourceContent) {
    const numericRepresentation = extractNumericPrefix(sourceContent);
    const finalResult = -(numericRepresentation - 48);
    console.log(finalResult);
}

const fileSystemModule = require('fs');
const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInputAndCalculate(rawInputString);
