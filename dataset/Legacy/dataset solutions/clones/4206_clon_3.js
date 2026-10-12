const retrieveInput = (filePath) => {
    return require('fs').readFileSync(filePath, 'utf8');
};

function processInputString(rawInputData) {
    const processedString = rawInputData.trim();

    let frequencyArray = [0, 0, 0];
    let encounteredInvalidChar = false;

    for (const character of processedString) {
        const charCodeOffset = character.charCodeAt() - 'a'.charCodeAt();

        if (charCodeOffset >= 0 && charCodeOffset < 3) {
            frequencyArray[charCodeOffset]++;
        } else {
            encounteredInvalidChar = true;
        }
    }

    if (encounteredInvalidChar) {
        frequencyArray.push(NaN);
    }

    const maximumFrequency = Math.max(...frequencyArray);
    const minimumFrequency = Math.min(...frequencyArray);

    const frequencyDifference = maximumFrequency - minimumFrequency;

    if (frequencyDifference >= 2) {
        console.log('NO');
    } else {
        console.log('YES');
    }
}

processInputString(retrieveInput('/dev/stdin'));
