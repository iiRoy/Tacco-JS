const streamSource = process.stdin;
streamSource.resume();
streamSource.setEncoding('utf8');

let collectedParts = [];

const gatherOperation = new Promise((resolveResult) => {
    streamSource.on('data', (unit) => {
        collectedParts.push(unit);
    });
    streamSource.on('end', () => {
        resolveResult(collectedParts.join(''));
    });
    streamSource.on('error', (issue) => {
        console.error('Data stream issue:', issue);
        resolveResult('');
    });
});

gatherOperation.then((fullContent) => {
    const textualLines = fullContent.split(/\r?\n/);
    let targetStringForSearch = textualLines.toString();

    let numeralInstances = [];
    for (let symbol of targetStringForSearch) {
        if (symbol === '2') {
            numeralInstances.push(symbol);
        }
    }

    console.log(numeralInstances);
    console.log(numeralInstances.length);
});