process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedContent = '';

process.stdin.on('data', (dataChunk) => {
    collectedContent += dataChunk;
});

process.stdin.on('end', () => {
    let initialSegment = '';
    const firstBreak = collectedContent.indexOf('\n');

    if (firstBreak !== -1) {
        initialSegment = collectedContent.substring(0, firstBreak);
    } else {
        initialSegment = collectedContent;
    }

    let invertedSegment = '';
    for (let charIndex = initialSegment.length - 1; charIndex >= 0; charIndex--) {
        invertedSegment += initialSegment[charIndex];
    }

    console.log(invertedSegment);
});
