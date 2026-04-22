const fileSystemModule = require('fs');
const writeToConsole = console.log;

const deliverResult = (outputContent) => {
    writeToConsole(outputContent);
};

const processAllInput = (fullTextualData) => {
    const rawLines = fullTextualData
        .split('\n')
        .filter(lineSegment => lineSegment.trim().length > 0);

    const recurseThroughSegments = (segmentArray) => {
        if (segmentArray.length === 0) {
            return;
        }

        const currentSegment = segmentArray[0];
        const numericValues = currentSegment.split(' ').map(Number);

        if (numericValues[0] === 0) {
            return;
        }

        deliverResult(0);

        recurseThroughSegments(segmentArray.slice(1));
    };

    recurseThroughSegments(rawLines);
};

const acquiredInput = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processAllInput(acquiredInput);