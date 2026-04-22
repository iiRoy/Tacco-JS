let collectedBytes = '';
const inputSource = process.stdin;
const outputDestination = process.stdout;

inputSource.setEncoding('utf8');

inputSource.on('data', (incomingSegment) => {
    collectedBytes += incomingSegment;
});

inputSource.on('end', () => {
    const processedString = collectedBytes.trim();
    const numericalInterpretation = Number(processedString);

    const cubicResult = Math.pow(numericalInterpretation, 3);

    outputDestination.write(String(cubicResult) + '\n');
});

inputSource.resume();