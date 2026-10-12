function processInput(sourceText) {
    const contentLines = sourceText.split("\n");
    const targetSequence = contentLines[1];

    let requiredPrefixCount = 0;
    let currentBalance = 0;

    for (const char of targetSequence) {
        if (char === '(') {
            currentBalance++;
        } else if (char === ')') {
            if (currentBalance > 0) {
                currentBalance--;
            } else {
                requiredPrefixCount++;
            }
        }
    }

    const requiredSuffixCount = currentBalance;

    const generatedPrefix = '('.repeat(requiredPrefixCount);
    const generatedSuffix = ')'.repeat(requiredSuffixCount);

    console.log(generatedPrefix + targetSequence + generatedSuffix);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
