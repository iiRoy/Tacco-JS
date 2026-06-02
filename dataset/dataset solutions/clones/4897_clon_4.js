function processInputSequence(sourceText) {
    const firstCharPosition = sourceText.indexOf('C');
    let outcomeIndicator = false;

    if (firstCharPosition !== -1) {
        const secondCharPosition = sourceText.indexOf('F', firstCharPosition + 1);
        if (secondCharPosition !== -1) {
            outcomeIndicator = true;
        }
    }

    if (outcomeIndicator) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
processInputSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());
