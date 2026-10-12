function analyzeString(sourceText) {
    const hasTargetDigit = sourceText.split('').reduce((accumulator, character) => {
        return accumulator || (character === '7');
    }, false);

    if (hasTargetDigit) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

analyzeString(require("fs").readFileSync("/dev/stdin", "utf8"));
