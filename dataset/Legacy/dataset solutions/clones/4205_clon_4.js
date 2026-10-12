function processInput(inputString) {
    const charSequence = inputString.split("\n")[0].split("");
    const sequenceLength = charSequence.length;

    const verifyHomogeneity = (sourceArr, startPos, endPos) => {
        if (startPos > endPos) {
            return false;
        }
        const initialChar = sourceArr[startPos];
        return Array.from({ length: endPos - startPos + 1 }, (_, i) => sourceArr[startPos + i])
                    .every((current, idx) => idx === 0 || current === initialChar);
    };

    const parityHandlers = {
        even: () => {
            const firstPrefixEnd = Math.floor(sequenceLength / 2) - 2;
            const secondPrefixEnd = Math.floor(sequenceLength / 2) - 1;

            const firstCheck = verifyHomogeneity(charSequence, 0, firstPrefixEnd);
            const secondCheck = verifyHomogeneity(charSequence, 0, secondPrefixEnd);

            return firstCheck && secondCheck;
        },
        odd: () => {
            const middleIndex = Math.floor((sequenceLength - 1) / 2);
            const firstSegmentEnd = middleIndex - 1;
            const secondSegmentStart = middleIndex + 1;
            const secondSegmentEnd = sequenceLength - 1;

            const firstCheck = verifyHomogeneity(charSequence, 0, firstSegmentEnd);
            const secondCheck = verifyHomogeneity(charSequence, secondSegmentStart, secondSegmentEnd);

            return firstCheck && secondCheck;
        }
    };

    const handlerKey = (sequenceLength % 2 === 0) ? 'even' : 'odd';
    const isConditionMet = parityHandlers[handlerKey]();

    if (isConditionMet) {
        console.log("NO");
    } else {
        console.log("YES");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
