function main(inputString) {
    const targetPhrase = "AKIHABARA";
    const aPositions = new Set([0, 4, 6, 8]);

    const processedInput = inputString.trim();
    let inputPointer = 0;
    let validationStatus = true;

    for (let phrasePointer = 0; phrasePointer < targetPhrase.length; phrasePointer++) {
        const currentPhraseChar = targetPhrase[phrasePointer];
        const isAPosition = aPositions.has(phrasePointer);

        if (inputPointer < processedInput.length) {
            const currentInputChar = processedInput[inputPointer];

            if (isAPosition) {
                if (currentInputChar === 'A') {
                    inputPointer++;
                }
            } else {
                if (currentInputChar === currentPhraseChar) {
                    inputPointer++;
                } else {
                    validationStatus = false;
                    break;
                }
            }
        } else {
            if (!isAPosition) {
                validationStatus = false;
                break;
            }
        }
    }

    if (inputPointer !== processedInput.length) {
        validationStatus = false;
    }

    console.log(validationStatus ? "YES" : "NO");
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
