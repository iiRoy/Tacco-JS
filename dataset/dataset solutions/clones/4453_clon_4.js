const fileSystemInterface = require('node:fs');

const acquireFirstLine = (sourceData) => {
    const textualRepresentation = sourceData.toString('utf8');
    const globalTrimmed = textualRepresentation.replace(/^\s+|\s+$/g, '');
    const lineSegments = globalTrimmed.split(/\r?\n/);
    return lineSegments[0] || '';
};

const prefixConstant = 'ABC';

const deliverResult = (finalOutputContent) => {
    process.stdout.write(finalOutputContent + '\n');
};

(() => {
    const rawBufferPayload = fileSystemInterface.readFileSync('/dev/stdin');
    const primarySegment = acquireFirstLine(rawBufferPayload);
    const combinedPhrase = [prefixConstant, primarySegment].join('');
    deliverResult(combinedPhrase);
})();