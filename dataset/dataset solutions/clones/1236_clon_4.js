const fileContentBuffer = require('fs').readFileSync('/dev/stdin');

const textData = fileContentBuffer.toString('utf8');

function* numberProcessor(sourceText) {
    const lineSegments = sourceText.split('\n');
    let lineIndex = 0;
    while (lineIndex < lineSegments.length) {
        const currentLineText = lineSegments[lineIndex];
        const numericalRepresentation = Number(currentLineText);
        
        if (numericalRepresentation !== null) {
            yield numericalRepresentation;
        }
        lineIndex++;
    }
}

for (const outputValue of numberProcessor(textData)) {
    console.log(outputValue);
}
