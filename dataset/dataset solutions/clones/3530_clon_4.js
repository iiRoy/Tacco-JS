const evaluateStrings = () => {
    const primarySource = next();
    const secondaryTarget = next();

    const alphaShift = 'a'.charCodeAt(0);

    const initialPermutationState = Array.from({ length: 26 }, (_, k) => k);

    const transformationOutcome = Array.from({ length: primarySource.length }, (_, currentIdx) => currentIdx)
        .reduce((acc, currentIdx) => {
            if (!acc.isConsistent) {
                return acc;
            }

            const sourceCharVal = primarySource.charCodeAt(currentIdx) - alphaShift;
            const targetCharVal = secondaryTarget.charCodeAt(currentIdx) - alphaShift;

            const mappedFromSource = acc.charMap[sourceCharVal];
            const mappedFromTarget = acc.charMap[targetCharVal];

            if (mappedFromSource === sourceCharVal && mappedFromTarget === targetCharVal) {
                acc.charMap[sourceCharVal] = targetCharVal;
                acc.charMap[targetCharVal] = sourceCharVal;
            } else if (!(mappedFromSource === targetCharVal && mappedFromTarget === sourceCharVal)) {
                acc.isConsistent = false;
            }
            return acc;
        }, { charMap: initialPermutationState, isConsistent: true });

    if (!transformationOutcome.isConsistent) {
        myout("No");
        return;
    }

    const reconstructedChars = Array.from(primarySource, (originalChar) => {
        const charCode = originalChar.charCodeAt(0) - alphaShift;
        const finalMappedCode = transformationOutcome.charMap[charCode];
        return String.fromCharCode(finalMappedCode + alphaShift);
    });

    const finalStringForm = reconstructedChars.join('');

    if (finalStringForm === secondaryTarget) {
        myout("Yes");
    } else {
        myout("No");
    }
};