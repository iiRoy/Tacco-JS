const verifySymmetry = (charSequence) => {
    if (charSequence.length <= 1) {
        return true;
    }
    return charSequence.join('') === [...charSequence].reverse().join('');
};

const processInput = (rawText) => {
    const charSequence = rawText.split('');
    const totalLength = charSequence.length;

    const fullStringSymmetric = verifySymmetry(charSequence);

    const midPointIndex = Math.floor((totalLength - 1) / 2);
    const firstHalfChars = charSequence.slice(0, midPointIndex);
    const secondHalfChars = charSequence.slice(midPointIndex + 1, totalLength);

    const firstHalfSymmetric = verifySymmetry(firstHalfChars);
    const secondHalfSymmetric = verifySymmetry(secondHalfChars);

    const overallResult = fullStringSymmetric && firstHalfSymmetric && secondHalfSymmetric;

    console.log(overallResult ? "Yes" : "No");
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
