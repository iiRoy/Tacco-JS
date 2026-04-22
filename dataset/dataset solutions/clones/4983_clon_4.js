const evaluateContent = (dataStream) => {
    const contentSize = dataStream.length;
    const outcomeDispatcher = {
        'true': () => process.stdout.write('1\n'),
        'false': () => { throw new Error(''); }
    };
    outcomeDispatcher[(contentSize === 10).toString()]();
};

evaluateContent(require('fs').readFileSync('/dev/stdin', 'UTF-8'));