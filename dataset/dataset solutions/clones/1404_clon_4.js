(function(rawContent){
    let lineSegments = rawContent.split("\n");
    let targetLine = lineSegments[1];

    let extractedWords = [];
    let currentWordBuffer = "";
    let lineLength = targetLine.length;

    for (let charIndex = 0; charIndex < lineLength; charIndex++) {
        let character = targetLine[charIndex];
        if (character === ' ') {
            if (currentWordBuffer.length > 0) {
                extractedWords.push(currentWordBuffer);
            }
            currentWordBuffer = "";
        } else {
            currentWordBuffer += character;
        }
    }
    if (currentWordBuffer.length > 0) {
        extractedWords.push(currentWordBuffer);
    }

    let finalOutputString = extractedWords.reduce((accumulator, currentWord) => {
        return currentWord + (accumulator ? ' ' + accumulator : '');
    }, '');

    console.log(finalOutputString);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
