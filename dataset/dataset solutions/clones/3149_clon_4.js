const processStream = (incomingData) => {
    const initialRawInput = incomingData.trim();
    const primaryLine = initialRawInput.split('\n')[0];
    const tokenExtraction = primaryLine.match(/^\s*(\S*)/);
    const designatedSymbol = (tokenExtraction && tokenExtraction[1]) || '';

    const finalOutcome = +(designatedSymbol == 0);

    console.log(finalOutcome);
};

processStream(require('node:fs').readFileSync(0, 'utf8'));