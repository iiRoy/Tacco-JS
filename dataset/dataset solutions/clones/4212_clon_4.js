function processInputData(sourceDatum) {
    const cleansedDatum = sourceDatum.trim();
    const finalSequence = "AKIHABARA";
    const criticalPositions = new Set([0, 4, 6, 8]);

    let sourceCharacters = Array.from(cleansedDatum);
    let sourcePointer = 0;

    for (let currentTargetIndex = 0; currentTargetIndex < finalSequence.length; currentTargetIndex++) {
        const expectedCharacter = finalSequence[currentTargetIndex];
        const isMandatoryA = expectedCharacter === 'A' && criticalPositions.has(currentTargetIndex);

        if (isMandatoryA) {
            // If the target position is a mandatory 'A' and the source's current character is also 'A',
            // we consume the 'A' from the source. Otherwise, the 'A' is considered "inserted" and
            // we do not advance the source pointer.
            if (sourcePointer < sourceCharacters.length && sourceCharacters[sourcePointer] === 'A') {
                sourcePointer++;
            }
        } else {
            // For any other character (non-mandatory 'A' or non-'A' character),
            // it must strictly match the current character in the source, and be consumed.
            if (sourcePointer >= sourceCharacters.length || sourceCharacters[sourcePointer] !== expectedCharacter) {
                return "NO"; // Source exhausted prematurely or character mismatch
            }
            sourcePointer++; // Consume character from source
        }
    }

    // After processing all characters in the final sequence,
    // the source string must also be completely consumed.
    if (sourcePointer < sourceCharacters.length) {
        return "NO"; // Extra characters in the source string
    }

    return "YES";
}

console.log(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8')));