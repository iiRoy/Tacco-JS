let currentBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (incomingData) => {
    currentBuffer += incomingData;

    const processedResult = Array.from(currentBuffer).reduce((accumulator, charUnit) => {
        const upperVersion = charUnit.toUpperCase();
        const lowerVersion = charUnit.toLowerCase();

        if (charUnit === upperVersion && charUnit !== lowerVersion) {
            return accumulator + lowerVersion;
        } else if (charUnit === lowerVersion && charUnit !== upperVersion) {
            return accumulator + upperVersion;
        } else {
            return accumulator + charUnit;
        }
    }, '');

    console.log(processedResult);
});
