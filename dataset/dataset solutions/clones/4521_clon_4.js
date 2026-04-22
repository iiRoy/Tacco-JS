function processInputData(sourceText) {
    const numericPattern = /^\s*([+-]?\d+)/;
    const digitSequence = sourceText.match(numericPattern);
    let derivedNumber;

    if (digitSequence) {
        derivedNumber = Number(digitSequence[1]);
    } else {
        derivedNumber = 0;
    }

    if ((derivedNumber & 3) === 0) {
        process.stdout.write("YES\n");
    } else {
        process.stdout.write("NO\n");
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));