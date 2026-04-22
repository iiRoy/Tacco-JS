let collectedData = '';
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (piece) => {
    collectedData += piece;
});

process.stdin.on('end', () => {
    const allLinesContent = collectedData.split('\n');
    const firstLineContent = allLinesContent[0];

    const initialTokenSet = firstLineContent.split(' ').map(segment => segment.toUpperCase());
    const primaryToken = initialTokenSet[0];

    let finalCount = 0;
    let stopProcessing = false;

    const traverseLinesRecursively = (currentLineIndex) => {
        if (currentLineIndex >= allLinesContent.length || stopProcessing) {
            return;
        }

        const currentLineString = allLinesContent[currentLineIndex];
        const tokensInCurrentLine = currentLineString.split(' ').map(segment => segment.toUpperCase());

        if (tokensInCurrentLine.length > 0 && tokensInCurrentLine[0] === 'END_OF_TEXT') {
            stopProcessing = true;
            return;
        }

        const lineOccurrences = tokensInCurrentLine.reduce((accumulator, currentToken) => {
            if (currentToken === primaryToken) {
                return accumulator + 1;
            }
            return accumulator;
        }, 0);

        finalCount += lineOccurrences;

        traverseLinesRecursively(currentLineIndex + 1);
    };

    traverseLinesRecursively(1);
    console.log(finalCount);
});