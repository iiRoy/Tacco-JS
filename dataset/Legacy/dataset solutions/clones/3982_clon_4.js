function processInputData(rawContent) {
    const contentLines = rawContent.split('\n');
    
    const extractionRules = [
        { lineOffset: 0, charOffset: 0 },
        { lineOffset: 1, charOffset: 1 },
        { lineOffset: 2, charOffset: 2 }
    ];

    const finalOutput = extractionRules.reduce((currentResult, extractionRule) => {
        const currentLineSegment = contentLines[extractionRule.lineOffset];
        const segmentChars = currentLineSegment.split(''); 
        const extractedChar = segmentChars[extractionRule.charOffset];
        return currentResult + extractedChar;
    }, '');

    console.log(finalOutput);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
