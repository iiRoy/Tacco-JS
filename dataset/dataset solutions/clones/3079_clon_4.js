function processInputContent(unprocessedText) {
    const relevantLine = unprocessedText.split('\n')[0];
    const dataTokens = relevantLine.split(' ');
    const uniqueElements = new Set(dataTokens);
    const outcomeIndicator = (uniqueElements.size === 1) ? "Yes" : "No";
    console.log(outcomeIndicator);
}
processInputContent(require("fs").readFileSync("/dev/stdin", "utf8"));