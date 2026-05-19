const fs = require('fs');

const countPatternOccurrences = (textSegment, pattern) => {
    const regex = new RegExp(pattern, 'g');
    const matches = textSegment.match(regex);
    return matches ? matches.length : 0;
};

const processInputData = (inputContent) => {
    const allLines = inputContent.split('\n');

    const targetSequence = allLines[1];

    const queryCoordinates = allLines.slice(2).map(lineEntry => {
        const numericParts = lineEntry.split(' ').map(Number);
        return {
            startIdx: numericParts[0] - 1,
            endIdx: numericParts[1]
        };
    });

    queryCoordinates.forEach(currentQuery => {
        const currentSegment = targetSequence.substring(currentQuery.startIdx, currentQuery.endIdx);
        const acCount = countPatternOccurrences(currentSegment, 'AC');
        console.log(acCount);
    });
};

processInputData(fs.readFileSync('/dev/stdin', 'utf8'));
