function processInputData(rawData) {
    const lineSegments = rawData.split('\n');

    const firstLineCharacters = lineSegments[0].split('');
    const secondLineCharacters = lineSegments[1].split('');
    const thirdLineCharacters = lineSegments[2].split('');

    const targetCharFromFirstLine = firstLineCharacters[0];
    const targetCharFromSecondLine = secondLineCharacters[1];
    const targetCharFromThirdLine = thirdLineCharacters[2];

    const concatenatedResult = targetCharFromFirstLine + targetCharFromSecondLine + targetCharFromThirdLine;

    console.log(concatenatedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
