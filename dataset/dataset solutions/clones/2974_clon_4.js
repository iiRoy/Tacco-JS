function processInputData(rawData) {
    let parsedTokens = [];
    let currentTokenBuffer = '';
    const tokenSeparator = ' ';

    for (let charIndex = 0; charIndex < rawData.length; charIndex++) {
        if (rawData[charIndex] === tokenSeparator) {
            parsedTokens.push(currentTokenBuffer);
            currentTokenBuffer = '';
        } else {
            currentTokenBuffer += rawData[charIndex];
        }
    }
    parsedTokens.push(currentTokenBuffer);

    console.log(parsedTokens);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
