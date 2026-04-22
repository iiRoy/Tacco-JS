let collectedData = '';

const processIncomingText = (textualSource) => {
    const initialSegment = textualSource.split('\n')[0];
    const components = initialSegment.split(' ');
    const targetComponent = components[1];
    const resultingPhrase = String(targetComponent) + String(targetComponent);
    return resultingPhrase;
};

process.stdin.on('data', (inputPortion) => {
    collectedData += inputPortion.toString();
});

process.stdin.on('end', () => {
    const finalOutput = processIncomingText(collectedData);
    process.stdout.write(finalOutput + '\n');
});

process.stdin.resume();