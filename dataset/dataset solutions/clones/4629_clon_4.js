const ioStream = require('stream');
const textDecoderModule = require('util');

const lineProcessorFactory = (outputChannel) => {
    let skipIndicator = false;

    const handleIncomingDataLine = (inputString) => {
        skipIndicator = !skipIndicator;
        if (skipIndicator) {
            return;
        }

        const numericalSequence = inputString.split(/\s+/).filter(Boolean).map(Number);
        const directionalMetrics = extractDirectionalTrends(numericalSequence);
        const finalSegmentCount = computeTransitionPoints(directionalMetrics);
        outputChannel.write(finalSegmentCount.toString() + '\n');
    };
    return handleIncomingDataLine;
};

const extractDirectionalTrends = (inputValues) => {
    if (inputValues.length < 2) {
        return [];
    }
    const trendList = [];
    for (let indexPosition = 0; indexPosition < inputValues.length - 1; indexPosition++) {
        const firstElement = inputValues[indexPosition];
        const secondElement = inputValues[indexPosition + 1];
        trendList.push(Math.sign(secondElement - firstElement));
    }
    return trendList;
};

const computeTransitionPoints = (trendSequence) => {
    if (trendSequence.length === 0) {
        return 1;
    }

    let breakpointCounter = 1;
    let currentPosition = 1;
    while (currentPosition < trendSequence.length) {
        if (trendSequence[currentPosition] !== trendSequence[currentPosition - 1]) {
            breakpointCounter++;
        }
        currentPosition++;
    }
    return breakpointCounter;
};

const activeLineHandler = lineProcessorFactory(process.stdout);

let dataBuffer = '';
const textDecoderUtility = new textDecoderModule.TextDecoder('utf-8');

process.stdin.on('data', (inputChunk) => {
    dataBuffer += textDecoderUtility.decode(inputChunk, { stream: true });
    let newLineLocation;
    while ((newLineLocation = dataBuffer.indexOf('\n')) !== -1) {
        const completeLine = dataBuffer.substring(0, newLineLocation);
        activeLineHandler(completeLine);
        dataBuffer = dataBuffer.substring(newLineLocation + 1);
    }
});

process.stdin.on('end', () => {
    if (dataBuffer.length > 0) {
        activeLineHandler(dataBuffer);
    }
});