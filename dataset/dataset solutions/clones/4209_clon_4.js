function checkSequence(inputContent) {
    const desiredPattern = "AKIHABARA";
    const processedInput = inputContent.trim();

    let inputPointer = 0;
    let patternPointer = 0;

    while (patternPointer < desiredPattern.length) {
        const currentPatternChar = desiredPattern[patternPointer];
        const currentInputChar = processedInput[inputPointer];

        if (currentPatternChar === 'A') {
            if (currentInputChar === 'A') {
                inputPointer++;
            }
        } else {
            if (currentInputChar === undefined || currentInputChar !== currentPatternChar) {
                console.log("NO");
                return;
            }
            inputPointer++;
        }
        patternPointer++;
    }

    if (inputPointer < processedInput.length) {
        console.log("NO");
        return;
    }

    console.log("YES");
}

checkSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
