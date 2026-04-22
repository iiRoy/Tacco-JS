const fileSystemUtility = require('fs');

const completeInputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

const processedLines = completeInputData.split('\n');

let currentSegmentPointer = 0;

const obtainNextSegment = () => {
    if (currentSegmentPointer >= processedLines.length) {
        return '';
    }
    return processedLines[currentSegmentPointer++];
};

(function initiateProcessingFlow() {
    const initialConfigurationSegment = obtainNextSegment();

    const quantitativeMetrics = initialConfigurationSegment.split(' ').map(token => +token);

    const primaryIterationCount = quantitativeMetrics[0];

    const storedContentFragments = [];
    let loopIndexVariable = 0;

    while (loopIndexVariable < primaryIterationCount) {
        storedContentFragments.push(obtainNextSegment());
        loopIndexVariable++;
    }

    const finalRenderedOutput = storedContentFragments.flatMap(itemElement => [itemElement, itemElement]);

    process.stdout.write(finalRenderedOutput.join('\n') + '\n');
})();