function processInput(rawData) {
    const linesOfText = rawData.split(/\n/);
    const firstLineValue = linesOfText[0],
          numberStrings = linesOfText.slice(1, linesOfText.length - 1);

    console.log(numberStrings.filter((currentStr, currentIndex) => numberStrings.indexOf(currentStr) === currentIndex).length);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
