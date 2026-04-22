process.stdin.resume();
process.stdin.setEncoding('utf8');
let collectedData = '';

process.stdin.on('data', function(chunk) {
    collectedData += chunk;
});

process.stdin.on('end', function() {
    const inputSegments = collectedData.split('\n');
    const numericStorage = new Map();
    let currentMaximum = 0;

    for (const currentSegment of inputSegments) {
        const numericForm = Number(currentSegment);
        if (Number.isFinite(numericForm) && numericForm !== 0) {
            numericStorage.set(numericForm, NaN);
        }
    }

    for (const [storedKey, storedValue] of numericStorage.entries()) {
        if (storedValue === currentMaximum) {
            console.log(storedKey);
        }
    }
});