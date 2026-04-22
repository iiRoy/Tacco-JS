function processData(rawData) {
    var sourceLines = rawData.split('\n');
    var digitSequenceString = sourceLines[1];

    var seenSingleDigits = new Array(10).fill(false);
    var seenDoubleDigits = new Set();
    var seenTripleDigits = new Set();

    for (var currentPosition = 0; currentPosition < digitSequenceString.length; ++currentPosition) {
        var currentInputDigit = parseInt(digitSequenceString[currentPosition], 10);

        // Phase 1: Use existing two-digit subsequences to form three-digit subsequences
        // It's important to iterate over a copy or snapshot of seenDoubleDigits
        // because seenDoubleDigits itself might be modified in Phase 2 of the same iteration.
        var preExistingDoubleDigits = Array.from(seenDoubleDigits);
        for (let twoDigitValue of preExistingDoubleDigits) {
            var newTripleDigitValue = twoDigitValue * 10 + currentInputDigit;
            seenTripleDigits.add(newTripleDigitValue);
        }

        // Phase 2: Use existing single digits to form two-digit subsequences
        for (var firstDigitCandidate = 0; firstDigitCandidate < 10; ++firstDigitCandidate) {
            if (seenSingleDigits[firstDigitCandidate]) {
                var newDoubleDigitValue = firstDigitCandidate * 10 + currentInputDigit;
                seenDoubleDigits.add(newDoubleDigitValue);
            }
        }

        // Phase 3: Mark the current input digit as a seen single digit
        seenSingleDigits[currentInputDigit] = true;
    }

    console.log(seenTripleDigits.size);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));