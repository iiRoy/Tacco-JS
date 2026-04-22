const checkFormat = (rawText) => {
    const inputLines = rawText.split('\n');

    if (inputLines.length < 2) {
        return "No";
    }

    const [lengthSpecifications, hyphenatedStringCandidate] = inputLines;

    const [expectedLengthAlpha, expectedLengthBeta] = lengthSpecifications.split(' ').map(val => parseInt(val, 10));

    if (isNaN(expectedLengthAlpha) || isNaN(expectedLengthBeta)) {
        return "No";
    }

    const validationExpression = new RegExp(`^.{${expectedLengthAlpha}}-.{${expectedLengthBeta}}$`);

    return validationExpression.test(hyphenatedStringCandidate) ? "Yes" : "No";
};