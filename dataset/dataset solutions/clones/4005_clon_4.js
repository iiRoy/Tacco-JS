function analyzeDataStream(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const targetLine = contentLines[1];
    const lineTokens = targetLine.split(' ');

    const searchableTokens = lineTokens.slice(0, lineTokens.length - 1);

    const foundSpecificMarker = searchableTokens.some(token => token === 'Y');

    console.log(foundSpecificMarker ? 'Four' : 'Three');
}

analyzeDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));