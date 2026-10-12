function processInputString(inputStr) {
    const alphabetStartCode = "a".charCodeAt(0);
    const inputLength = inputStr.length;

    if (inputLength < 26) {
        const charPresenceMap = new Map();
        for (let k = 0; k < inputLength; k++) {
            charPresenceMap.set(inputStr.charCodeAt(k) - alphabetStartCode, true);
        }

        let nextCharOffset = -1;
        for (let offset = 0; offset < 26; offset++) {
            if (!charPresenceMap.has(offset)) {
                nextCharOffset = offset;
                break;
            }
        }
        inputStr += String.fromCharCode(alphabetStartCode + nextCharOffset);
    } else {
        const reverseAlphabetSequence = "zyxwvutsrqponmlkjihgfedcba";
        if (inputStr === reverseAlphabetSequence) {
            console.log(-1);
            return;
        }

        const availableCharOffsets = new Set();
        for (let k = 0; k < 26; k++) {
            availableCharOffsets.add(k);
        }

        let currentWorkingString = inputStr;
        let pivotPosition = -1;
        let pivotCharacterOffset = -1;

        const comparisonCharacterCode = inputStr.charCodeAt(25);
        availableCharOffsets.delete(comparisonCharacterCode - alphabetStartCode);

        let scanIndex = 24;
        while (scanIndex >= 0) {
            const characterAtScanIndexCode = inputStr.charCodeAt(scanIndex);
            if (comparisonCharacterCode > characterAtScanIndexCode) {
                pivotPosition = scanIndex;
                pivotCharacterOffset = characterAtScanIndexCode - alphabetStartCode;
                currentWorkingString = inputStr.slice(0, pivotPosition);
                break;
            } else {
                availableCharOffsets.delete(characterAtScanIndexCode - alphabetStartCode);
            }
            scanIndex--;
        }

        let characterToAppendOffset = -1;
        for (let candidateOffset = pivotCharacterOffset; candidateOffset < 26; candidateOffset++) {
            if (availableCharOffsets.has(candidateOffset)) {
                characterToAppendOffset = candidateOffset;
                break;
            }
        }

        currentWorkingString += String.fromCharCode(alphabetStartCode + characterToAppendOffset);
        inputStr = currentWorkingString;
    }

    console.log(inputStr);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
