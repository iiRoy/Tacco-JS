const evaluateSequence = (initialVal, divisorVal, remainderVal) => {
    let currentTestVal = initialVal;
    const maximumBound = 10000;

    while (currentTestVal <= maximumBound) {
        if (currentTestVal % divisorVal === remainderVal) {
            return true;
        }
        currentTestVal += initialVal;
    }
    return false;
};

const processInputData = (incomingTextContent) => {
    let currentReadPos = 0;
    let spaceLoc = -1;
    
    spaceLoc = incomingTextContent.indexOf(' ', currentReadPos);
    const firstStrValue = incomingTextContent.substring(currentReadPos, spaceLoc);
    currentReadPos = spaceLoc + 1;

    spaceLoc = incomingTextContent.indexOf(' ', currentReadPos);
    const secondStrValue = incomingTextContent.substring(currentReadPos, spaceLoc);
    currentReadPos = spaceLoc + 1;

    const lineEndPos = incomingTextContent.indexOf('\n', currentReadPos);
    const thirdStrValue = incomingTextContent.substring(currentReadPos, lineEndPos !== -1 ? lineEndPos : incomingTextContent.length);

    const valOne = Number(firstStrValue);
    const valTwo = Number(secondStrValue);
    const valThree = Number(thirdStrValue);

    if (evaluateSequence(valOne, valTwo, valThree)) {
        process.stdout.write('YES\n');
    } else {
        process.stdout.write('NO\n');
    }
};

const fileAccessModule = require('node:fs');
const inputReader = fileAccessModule.readFileSync;

const standardInputContent = inputReader('/dev/stdin', { encoding: 'utf8' });

processInputData(standardInputContent);