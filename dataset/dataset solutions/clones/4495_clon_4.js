process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    const dataBlock = process.stdin.read();

    if (dataBlock !== null) {
        let processedLines = dataBlock.split('\n');

        if (processedLines[processedLines.length - 1] === '') {
            processedLines.pop();
        }

        const primaryToken = processedLines[0].split(' ')[0];

        const modifiedToken = primaryToken.slice(0, primaryToken.length - 1);

        console.log(determineLongestDoublePrefix(modifiedToken));
    }
});

function determineLongestDoublePrefix(inputSequence) {
    let currentSegmentLength = inputSequence.length;

    while (currentSegmentLength > 0) {
        if (currentSegmentLength % 2 !== 0) {
            currentSegmentLength--;
            continue;
        }

        const halfSegmentLength = currentSegmentLength / 2;
        const firstPart = inputSequence.substring(0, halfSegmentLength);
        const secondPart = inputSequence.substring(halfSegmentLength, currentSegmentLength);

        const arePartsEquivalent = Array.from(firstPart).every((charValue, charIndex) =>
            charValue === secondPart[charIndex]
        );

        if (arePartsEquivalent) {
            return currentSegmentLength;
        } else {
            currentSegmentLength -= 2;
        }
    }

    return 0;
}
