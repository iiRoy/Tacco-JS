const inputReceiver = require('readline');

const queryProcessor = inputReceiver.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let taskCompleted = false;

const evaluateCondition = (firstSegment, secondSegment) => {
    return firstSegment === secondSegment;
};

queryProcessor.on('line', (currentLineData) => {
    if (taskCompleted) {
        return;
    }

    taskCompleted = true;

    let delimiterPosition = -1;
    let indexIterator = 0;
    while (indexIterator < currentLineData.length) {
        if (currentLineData[indexIterator] === ' ') {
            delimiterPosition = indexIterator;
            break;
        }
        indexIterator++;
    }

    let primarySymbol = '';
    let secondarySymbol = '';

    if (delimiterPosition !== -1) {
        primarySymbol = currentLineData.substring(0, delimiterPosition);
        secondarySymbol = currentLineData.substring(delimiterPosition + 1);
    } else {
        primarySymbol = currentLineData;
        secondarySymbol = '';
    }

    const finalResult = evaluateCondition(primarySymbol, secondarySymbol);

    process.stdout.write(finalResult ? 'Yes\n' : 'No\n');

    queryProcessor.close();
});

queryProcessor.on('close', () => {
    // No specific action needed on close for this problem.
});