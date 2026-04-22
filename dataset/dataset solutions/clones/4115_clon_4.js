let collectivePayload = '';

process.stdin.on('data', (chunk) => {
    collectivePayload += chunk.toString();
});

process.stdin.on('end', () => {
    let numericalRepresentation = 0;
    const incomingData = collectivePayload.trim();

    for (let currentDigitIndex = 0; currentDigitIndex < incomingData.length; currentDigitIndex++) {
        numericalRepresentation = (numericalRepresentation * (10)) + (incomingData.charCodeAt(currentDigitIndex) - ('0'.charCodeAt(0)));
    }

    const fortyEightEquivalent = '0'.charCodeAt(0); 

    const finalCalculation = fortyEightEquivalent + (~numericalRepresentation) + 1;

    process.stdout.write(String(finalCalculation) + '\n');
});