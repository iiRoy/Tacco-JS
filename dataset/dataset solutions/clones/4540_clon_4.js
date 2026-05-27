function processInputAndOutput(rawText) {
    const cleanedText = rawText.trim();
    const spacePosition = cleanedText.indexOf(' ');
    
    const firstNumStr = cleanedText.substring(0, spacePosition);
    const firstValue = Number(firstNumStr);

    const secondNumStr = cleanedText.substring(spacePosition + 1);
    const secondValue = Number(secondNumStr);

    const totalSum = firstValue + secondValue;

    if (totalSum < 10) {
        console.log(totalSum);
    } else {
        console.log("error");
    }
}

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
