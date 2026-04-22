(() => {
    let accumulatedString = '';
    const procModule = require('process');
    const standardInputSource = procModule.stdin;
    const standardOutputSink = procModule.stdout;

    const judgeValue = (numeric_expression) => {
        const outcomes = ['No', 'Yes'];
        const conditionMet = (numeric_expression >= 30);
        return outcomes[Number(conditionMet)];
    };

    standardInputSource.on('data', (incomingData) => {
        accumulatedString += incomingData.toString();
    });

    standardInputSource.on('end', () => {
        const processedNumber = Number(accumulatedString);
        const finalVerdict = judgeValue(processedNumber);
        standardOutputSink.write(finalVerdict + '\n');
    });

    standardInputSource.resume();
})();