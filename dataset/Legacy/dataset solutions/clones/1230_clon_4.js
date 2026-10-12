process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (inputChunk) {
    const sourceLines = inputChunk.toString().split('\n');
    
    const processedNumbers = sourceLines.map(lineText => parseInt(lineText, 10));

    processedNumbers.forEach((currentNumber, lineIndex) => {
        if (currentNumber !== 0) {
            console.log(`Case ${lineIndex}: ${currentNumber}`);
        }
    });
});
