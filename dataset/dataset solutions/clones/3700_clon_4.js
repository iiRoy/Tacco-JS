let inputBuffer = '';

const dataCollector = new Promise(resolve => {
    process.stdin.on('readable', () => {
        let chunkSegment;
        while (null !== (chunkSegment = process.stdin.read())) {
            inputBuffer += chunkSegment;
        }
    });

    process.stdin.on('end', () => {
        resolve(inputBuffer);
    });
});

dataCollector.then(rawTransmission => {
    const signalChunks = rawTransmission.trim().split('\n');
    const dataPoints = signalChunks[1].split(' ').map(digitToken => parseInt(digitToken, 10));

    const peakMagnitude = Math.max(...dataPoints);
    const troughMagnitude = Math.min(...dataPoints);

    const amplitudeSpan = peakMagnitude - troughMagnitude;

    process.stdout.write(amplitudeSpan + '\n');
});