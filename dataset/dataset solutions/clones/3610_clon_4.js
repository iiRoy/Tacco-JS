function processEntry(providedString) {
    const sourceData = providedString.split('\x0A');
    const characterSequence = sourceData[0];
    const limitValue = Number(sourceData[1]);

    let tallyAccumulator = 0;

    const foundElementIndex = Array.from(characterSequence).findIndex(charUnit => {
        const digitValue = +charUnit;

        if (digitValue === 0) {
            // Equivalent to p += 0
        } else if (digitValue === 1) {
            tallyAccumulator++; // Equivalent to p += 1
        } else if (digitValue >= 2 && digitValue <= 9) {
            // Digits 2-9 make the sum effectively infinite, satisfying any finite limitValue
            return true;
        }
        
        return tallyAccumulator >= limitValue;
    });

    if (foundElementIndex !== -1) {
        process.stdout.write(characterSequence[foundElementIndex].toString() + '\n');
    }
}

processEntry(require("fs").readFileSync("/dev/stdin", "utf8"));