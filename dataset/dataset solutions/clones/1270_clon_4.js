process.stdin.setEncoding('utf8');
let capturedData = '';

process.stdin.on('data', (portion) => {
    capturedData += portion;
});

process.stdin.on('end', () => {
    const numericLimit = Number(capturedData.trim().split(' ')[0]);

    const isRelevant = (datum) => {
        if (datum % 3 === 0) {
            return true;
        }
        return String(datum).includes('3');
    };

    const eligibleNumbers = Array.from({ length: Math.max(0, numericLimit - 2) }, (_, pos) => pos + 3)
                               .filter(isRelevant);

    const formattedOutput = eligibleNumbers.join(' ');

    console.log(eligibleNumbers.length > 0 ? ' ' + formattedOutput : '');
    process.exit(0);
});