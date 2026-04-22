const processTextOperations = (rawInput) => {
    const contentLines = rawInput.split('\n');

    const { primarySequence, queryRanges } = contentLines.reduce((accumulator, currentLine, index) => {
        if (index === 0) {
            return accumulator;
        } else if (index === 1) {
            accumulator.primarySequence = currentLine;
            return accumulator;
        } else {
            const parts = currentLine.split(' ').map(Number);
            if (parts.length === 2) {
                accumulator.queryRanges.push({ startPoint: parts[0], endPoint: parts[1] });
            }
            return accumulator;
        }
    }, { primarySequence: '', queryRanges: [] });

    const calculatePatternFrequency = (textSegment) => {
        const matches = textSegment.match(/AC/g);
        return matches ? matches.length : 0;
    };

    const obtainSegment = (sourceString, beginIndex, finishIndex) => {
        return sourceString.slice(beginIndex - 1, finishIndex);
    };

    queryRanges.forEach(range => {
        const targetSection = obtainSegment(primarySequence, range.startPoint, range.endPoint);
        const count = calculatePatternFrequency(targetSection);
        console.log(count);
    });
};

processTextOperations(require('fs').readFileSync('/dev/stdin', 'utf8'));