function calculateOutcome(completeInput) {
    const PRIME_NUMBER = 1000000007;
    const ALPHABET_COUNT = 26;
    const FIRST_CHAR_ASCII = 'a'.charCodeAt(0);

    let cleanedInputData = completeInput.trim();
    let separatorIndex = cleanedInputData.indexOf('\n');
    let targetString = cleanedInputData.slice(separatorIndex + 1);

    let charTallies = [];
    for (let currentSlot = 0; currentSlot < ALPHABET_COUNT; ++currentSlot) {
        charTallies.push(1);
    }

    for (let charPos = 0; charPos < targetString.length; ++charPos) {
        let charCodeValue = targetString.charCodeAt(charPos);
        let adjustedIndex = charCodeValue - FIRST_CHAR_ASCII;
        charTallies[adjustedIndex]++;
    }

    let finalProductValue = 1;
    for (let tallyEntry of charTallies) {
        finalProductValue = Number((BigInt(finalProductValue) * BigInt(tallyEntry)) % BigInt(PRIME_NUMBER));
    }

    return String(finalProductValue - 1);
}

process.stdout.write(calculateOutcome(require('fs').readFileSync(0, 'utf8')));