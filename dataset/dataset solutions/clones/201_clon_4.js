let inputChunks = [];

process.stdin.on('data', (dataPiece) => {
    inputChunks.push(dataPiece);
});

process.stdin.on('end', () => {
    let sourceText = Buffer.concat(inputChunks).toString('utf8');

    let processedOutput = "";
    let positionTracker = 0;
    const textLength = sourceText.length;
    
    const termOne = "apple";
    const termTwo = "peach";
    
    const lengthOne = termOne.length;
    const lengthTwo = termTwo.length;

    while (positionTracker < textLength) {
        if (sourceText.substring(positionTracker, positionTracker + lengthOne) === termOne) {
            processedOutput += termTwo;
            positionTracker += lengthOne;
        } 
        else if (sourceText.substring(positionTracker, positionTracker + lengthTwo) === termTwo) {
            processedOutput += termOne;
            positionTracker += lengthTwo;
        } 
        else {
            processedOutput += sourceText[positionTracker];
            positionTracker++;
        }
    }

    process.stdout.write(processedOutput);
});