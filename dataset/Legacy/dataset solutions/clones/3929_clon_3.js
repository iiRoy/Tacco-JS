function processInputString(inputStr) {
    const strLen = inputStr.length;
    const charCodeAOffset = "a".charCodeAt(0);

    const getInitialCharPresenceMap = () => Array(26).fill(1);

    const updateCharPresenceForSegment = (segment, charMap, offset) => {
        for (let k = 0; k < segment.length; k++) {
            const charRelativeCode = segment.charCodeAt(k) - offset;
            charMap[charRelativeCode] = 0;
        }
    };

    const findNextAvailableChar = (charMap, offset) => {
        for (let k = 0; k < 26; k++) {
            if (charMap[k] === 1) {
                return String.fromCharCode(offset + k);
            }
        }
        return null;
    };

    let availableCharFlags = getInitialCharPresenceMap();
    let currentIdx;

    if (strLen < 26) {
        updateCharPresenceForSegment(inputStr, availableCharFlags, charCodeAOffset);

        const nextCharToAdd = findNextAvailableChar(availableCharFlags, charCodeAOffset);
        if (nextCharToAdd !== null) {
            inputStr += nextCharToAdd;
        }
    } else {
        const fullAlphabetDescending = "zyxwvutsrqponmlkjihgfedcba";
        if (inputStr === fullAlphabetDescending) {
            console.log(-1);
            return;
        }

        availableCharFlags = getInitialCharPresenceMap();

        const comparisonChar = inputStr[strLen - 1];
        const comparisonCharCode = comparisonChar.charCodeAt(0);

        availableCharFlags[comparisonCharCode - charCodeAOffset] = 0;

        let pivotIndex = -1;
        let pivotCharCode = -1;

        for (currentIdx = strLen - 2; currentIdx >= 0; currentIdx--) {
            const currentCharCode = inputStr.charCodeAt(currentIdx);
            if (comparisonCharCode > currentCharCode) {
                pivotIndex = currentIdx;
                pivotCharCode = currentCharCode;
                inputStr = inputStr.slice(0, currentIdx);
                break;
            } else {
                availableCharFlags[currentCharCode - charCodeAOffset] = 0;
            }
        }

        let charToAppendCode = -1;
        if (pivotIndex !== -1) {
            const pivotRelativeCode = pivotCharCode - charCodeAOffset;
            for (let charSearchIdx = pivotRelativeCode; charSearchIdx < 26; charSearchIdx++) {
                if (availableCharFlags[charSearchIdx] === 0) {
                    charToAppendCode = charSearchIdx;
                    break;
                }
            }
            inputStr += String.fromCharCode(charCodeAOffset + charToAppendCode);
        }
    }
    console.log(inputStr);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
