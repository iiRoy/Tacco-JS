var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    executeProcessing(input);
});

function executeProcessing(sourceText) {
    const lineSegments = sourceText.split('\n');
    const numericPairs = [];

    for (const currentSegment of lineSegments) {
        const parsedNumbers = currentSegment.split(' ').reduce((accumulator, tokenString) => {
            accumulator.push(parseInt(tokenString));
            return accumulator;
        }, []);
        numericPairs.push(parsedNumbers);
    }

    const computedSums = numericPairs.map(numberTuple => {
        return numberTuple[0] + numberTuple[1];
    });

    for (const finalSum of computedSums) {
        console.log(finalSum);
    }
}
