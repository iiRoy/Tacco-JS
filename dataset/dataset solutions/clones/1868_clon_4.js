function evaluateStrings(sourceContent) {
    const firstLineEnd = sourceContent.indexOf('\n');
    const firstLine = sourceContent.substring(0, firstLineEnd);

    const secondLineStart = firstLineEnd + 1;
    const secondLineEnd = sourceContent.indexOf('\n', secondLineStart);

    let secondLine;
    if (secondLineEnd === -1) {
        secondLine = sourceContent.substring(secondLineStart);
    } else {
        secondLine = sourceContent.substring(secondLineStart, secondLineEnd);
    }

    const regexPatternString = `^${firstLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.$`;
    const comparisonObject = new RegExp(regexPatternString);

    let finalDetermination;
    if (comparisonObject.test(secondLine)) {
        finalDetermination = "Yes";
    } else {
        finalDetermination = "No";
    }

    console.log(finalDetermination);
}

evaluateStrings(require("fs").readFileSync("/dev/stdin", "utf8"));