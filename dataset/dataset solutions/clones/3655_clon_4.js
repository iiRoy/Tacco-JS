function checkMatch(firstPart, secondPart) {
    if (firstPart.length !== secondPart.length) {
        return false;
    }

    function performRecursiveComparison(leftIndex, rightIndex) {
        if (leftIndex >= firstPart.length) {
            return true;
        }

        if (firstPart.charAt(leftIndex) !== secondPart.charAt(rightIndex)) {
            return false;
        }

        return performRecursiveComparison(leftIndex + 1, rightIndex - 1);
    }

    return performRecursiveComparison(0, secondPart.length - 1);
}

function processExternalData(receivedInput) {
    const cleanedInput = receivedInput.trim();
    const dataParts = cleanedInput.split('\n');

    const alphaString = dataParts[0];
    const betaString = dataParts[1];

    if (checkMatch(alphaString, betaString)) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const systemIO = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';
const streamData = systemIO.readFileSync(standardInputPath, textEncoding);

processExternalData(streamData);