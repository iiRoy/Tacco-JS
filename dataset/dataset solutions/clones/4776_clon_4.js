let inputAccumulator = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    inputAccumulator += dataChunk;
});

process.stdin.on('end', () => {
    const firstLineEndPosition = inputAccumulator.indexOf('\n');
    const initialTextSegment = firstLineEndPosition === -1 
        ? inputAccumulator 
        : inputAccumulator.slice(0, firstLineEndPosition);

    let resultBuffer = '';
    for (let characterPosition = 0; characterPosition < initialTextSegment.length; characterPosition++) {
        const currentSymbol = initialTextSegment[characterPosition];
        if (currentSymbol === ',') {
            resultBuffer += ' ';
        } else {
            resultBuffer += currentSymbol;
        }
    }
    process.stdout.write(resultBuffer + '\n');
});

process.stdin.on('error', (streamError) => {
    process.stderr.write('Input processing failed: ' + streamError.message + '\n');
    process.exit(1);
});