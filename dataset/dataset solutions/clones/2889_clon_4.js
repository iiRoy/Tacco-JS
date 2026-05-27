function processInput(sourceText) {
    const charSequence = sourceText;
    const sequenceLength = charSequence.length;

    const occurrenceCount = Array.from(charSequence).reduce((accumulator, character) => {
        return accumulator + (character === 'o' ? 1 : 0);
    }, 0);

    let finalVerdict;

    switch (true) {
        case occurrenceCount < 8:
            break;
        case occurrenceCount === 8:
            finalVerdict = "YES";
            break;
        case occurrenceCount > 8:
            const lengthDifference = 15 - sequenceLength;
            finalVerdict = (lengthDifference + occurrenceCount >= 8) ? "YES" : "NO";
            break;
    }

    console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
