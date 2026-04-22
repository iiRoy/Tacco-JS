const stream = require('stream');
const inputBuffer = [];

const dataCollector = new stream.Writable({
    write(chunkSegment, encodingType, completionCallback) {
        inputBuffer.push(chunkSegment);
        completionCallback();
    }
});

process.stdin.pipe(dataCollector);

process.stdin.on('end', () => {
    const fullInputText = Buffer.concat(inputBuffer).toString('utf8').trim();
    performNumericalOperation(fullInputText);
});

function performNumericalOperation(sourceString) {
    let characterTotal = Array.from(sourceString).length;
    let targetCharInstances = sourceString.split('p').length - 1;
    let preliminaryCalculation = characterTotal / 2 - targetCharInstances;
    let ultimateValue = -(Math.ceil(-preliminaryCalculation));
    process.stdout.write(String(ultimateValue) + '\n');
}