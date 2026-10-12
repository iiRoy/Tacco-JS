'use strict';

const processInputData = (sourceText) => {
    function* lineProducer(text) {
        let currentPosition = 0;
        let nextNewlineIndex;
        while ((nextNewlineIndex = text.indexOf('\n', currentPosition)) !== -1) {
            yield text.substring(currentPosition, nextNewlineIndex);
            currentPosition = nextNewlineIndex + 1;
        }
        if (currentPosition < text.length) {
            yield text.substring(currentPosition);
        }
    }

    const lineIterator = lineProducer(sourceText);

    const initialLine = lineIterator.next().value;
    const lineCountToDuplicate = Number.parseInt(initialLine.split(' ')[0], 10);

    let linesProcessed = 0;
    while (linesProcessed < lineCountToDuplicate) {
        const currentSegment = lineIterator.next().value;
        if (currentSegment === undefined) {
            break;
        }
        console.log(currentSegment);
        console.log(currentSegment);
        linesProcessed++;
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
