function identifyAlphabetGap(sourceContent) {
    const mainLineSegment = sourceContent.split('\n')[0];
    const characterPresenceRegister = new Set(mainLineSegment.split(''));

    const completeAlphabetSequence = Array.from({ length: 26 }, (_, charIndex) =>
        String.fromCharCode(97 + charIndex)
    );

    const firstAbsentChar = completeAlphabetSequence.find(symbolUnit =>
        !characterPresenceRegister.has(symbolUnit)
    );

    if (firstAbsentChar !== undefined) {
        process.stdout.write(firstAbsentChar + '\n');
    } else {
        process.stdout.write('None\n');
    }
}

const receivedData = process.stdin.readFileSync(0, 'utf8');
identifyAlphabetGap(receivedData);