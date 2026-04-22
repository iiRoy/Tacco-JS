const processInputData = (payloadContent) => {
    const contentSegments = payloadContent.split('\n');
    const primarySequence = contentSegments[0];
    const strideValue = Number(contentSegments[1]);

    const sourceExtent = primarySequence.length;

    const extractedPatternFragments = Array.from(
        { length: Math.ceil(sourceExtent / strideValue) },
        (elementPlaceholder, currentOffset) => primarySequence[currentOffset * strideValue]
    );

    console.log(extractedPatternFragments.join(''));
};

const fileSystemAccess = require('node:fs');
processInputData(fileSystemAccess.readFileSync('/dev/stdin', 'utf8'));