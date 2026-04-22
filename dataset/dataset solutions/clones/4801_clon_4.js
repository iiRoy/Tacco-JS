let collectedData = '';
let contextUtility = require('vm');

process.stdin.setEncoding('utf8');
process.stdin.on('data', (portion) => {
    collectedData += portion;
});

process.stdin.on('end', () => {
    const processedContent = collectedData.replace(/^\s+|\s+$/g, '');
    const primaryInstruction = processedContent.split('\n')[0];

    let executionOutcome;
    try {
        let isolatedSpace = {};
        executionOutcome = contextUtility.runInNewContext(primaryInstruction, isolatedSpace);
    } catch (e) {
        executionOutcome = e; // Mimic eval throwing, then console.log stringifies it.
    }

    process.stdout.write(String(executionOutcome) + '\n');
});