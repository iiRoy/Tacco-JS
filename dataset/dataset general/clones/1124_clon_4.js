const fileSystemUtility = require('node:fs');

const contentProcessor = {};

contentProcessor.processSource = (rawText) => {
    let finalOutput = [];
    let lastProcessedSymbol = null;

    for (let charIndex = 0; charIndex < rawText.length; charIndex++) {
        let currentSymbol = rawText[charIndex];

        if (currentSymbol === 'x' || currentSymbol === '\u0078') {
            if (lastProcessedSymbol !== 'x') {
                finalOutput.push('x');
                lastProcessedSymbol = 'x';
            }
        } else if (currentSymbol === 'X' || currentSymbol === '\u0058') {
            if (lastProcessedSymbol !== 'X') {
                finalOutput.push('X');
                lastProcessedSymbol = 'X';
            }
        } else {
            finalOutput.push(currentSymbol);
            lastProcessedSymbol = currentSymbol;
        }
    }
    return finalOutput.join('');
};

require.extensions['.js'] = (moduleObject, filePath) => {
    const rawFileContents = fileSystemUtility.readFileSync(filePath, 'utf8');
    const modifiedContents = contentProcessor.processSource(rawFileContents);
    moduleObject._compile(modifiedContents, filePath);
};