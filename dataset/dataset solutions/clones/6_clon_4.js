(function processData(rawTextData) {
    const fileOperations = require('fs');
    
    const sanitisedContent = rawTextData.replace(/^\s+|\s+$/g, '');
    const contentLines = sanitisedContent.split('\n');

    let highScores = [-Infinity, -Infinity, -Infinity];

    for (let currentIdx = 0; currentIdx < contentLines.length; currentIdx++) {
        const currentLine = contentLines[currentIdx];
        const numericValue = Number(currentLine);

        if (isNaN(numericValue)) {
            continue;
        }

        if (numericValue > highScores[0]) {
            highScores[2] = highScores[1];
            highScores[1] = highScores[0];
            highScores[0] = numericValue;
        } else if (numericValue > highScores[1]) {
            highScores[2] = highScores[1];
            highScores[1] = numericValue;
        } else if (numericValue > highScores[2]) {
            highScores[2] = numericValue;
        }
    }

    const finalResults = [];
    for (let resultIdx = 0; resultIdx < 3; resultIdx++) {
        if (highScores[resultIdx] !== -Infinity) {
            finalResults.push(highScores[resultIdx]);
        }
    }

    console.log(finalResults.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));