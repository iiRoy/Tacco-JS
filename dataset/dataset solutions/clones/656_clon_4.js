const entryPoint = process.stdin;
const exitPoint = process.stdout;

const initializeInput = (sourceStream) => sourceStream.resume();
const configureInputEncoding = (sourceStream, encodingType) => sourceStream.setEncoding(encodingType);
const attachEventProcessor = (sourceStream, eventName, processorFunction) => sourceStream.on(eventName, processorFunction);
const transmitOutput = (destinationStream, contentString) => destinationStream.write(contentString);

initializeInput(entryPoint);
configureInputEncoding(entryPoint, "utf8");

let inputAccumulator = '';

attachEventProcessor(entryPoint, "data", (incomingSegment) => {
    inputAccumulator += incomingSegment.toString();

    const processedLines = inputAccumulator.split('\n');
    inputAccumulator = processedLines.pop();

    processedLines.forEach(currentLine => {
        const numericalRecognizer = /(\d+) (\d+)/;
        const capturedElements = numericalRecognizer.exec(currentLine);

        if (capturedElements && capturedElements.length === 3) {
            const firstValue = +capturedElements[1];
            const secondValue = +capturedElements[2];

            transmitOutput(exitPoint, (firstValue + secondValue) + '\n');
        }
    });
});

attachEventProcessor(entryPoint, "end", () => {
    if (inputAccumulator.length > 0) {
        const numericalRecognizer = /(\d+) (\d+)/;
        const capturedElements = numericalRecognizer.exec(inputAccumulator);

        if (capturedElements && capturedElements.length === 3) {
            const firstValue = +capturedElements[1];
            const secondValue = +capturedElements[2];
            transmitOutput(exitPoint, (firstValue + secondValue) + '\n');
        }
    }
});