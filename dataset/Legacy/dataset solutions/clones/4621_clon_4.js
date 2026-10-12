function processInputData(inputContent) {
    const contentLines = inputContent.split('\n');
    const primaryString = contentLines[0];
    const secondaryString = contentLines[1];

    const lengthComparisonValue = primaryString.length - secondaryString.length;

    const finalDetermination = (lengthComparisonValue !== 0)
        ? (lengthComparisonValue > 0 ? 'GREATER' : 'LESS')
        : (() => {
            const lexicalOrder = primaryString.localeCompare(secondaryString);
            return (lexicalOrder > 0) ? 'GREATER' :
                   (lexicalOrder < 0) ? 'LESS' :
                   'EQUAL';
        })();
    
    console.log(finalDetermination);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
