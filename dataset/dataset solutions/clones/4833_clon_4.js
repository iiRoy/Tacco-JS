const deriveComponent = (sourceMaterial) => {
    const initialLineExtractor = /^.*?(?=\n|$)/;
    const lineCaptureResult = sourceMaterial.match(initialLineExtractor);
    const processedLine = lineCaptureResult[0];

    const segmentIdentifier = /^\S+\s+(\S+)/;
    const extractionOutcome = processedLine.match(segmentIdentifier);
    
    const targetSymbol = extractionOutcome[1].charAt(0);

    return `A${targetSymbol}C`;
};

const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const initiateProcessing = (sourceData) => {
    const finalOutputString = deriveComponent(sourceData);
    process.stdout.write(finalOutputString);
};

initiateProcessing(dataStream);