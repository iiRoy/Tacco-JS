function processRawText(incomingLine) {
    let firstSeparator = incomingLine.indexOf(' ');
    let secondSeparator = incomingLine.indexOf(' ', firstSeparator + 1);
    let thirdSeparator = incomingLine.indexOf(' ', secondSeparator + 1);

    let primaryFigureString = incomingLine.substring(0, firstSeparator);
    let secondaryFigureString = incomingLine.substring(firstSeparator + 1, secondSeparator);
    let decidingComponent = incomingLine.substring(thirdSeparator + 1);

    let lastSymbol = decidingComponent.slice(-1);

    const oddSymbolSet = new Set(['1', '3', '5', '7', '9']);

    let numericPrimary = +primaryFigureString;
    let numericSecondary = +secondaryFigureString;

    let resultValue;
    if (oddSymbolSet.has(lastSymbol)) {
        resultValue = numericSecondary - numericPrimary;
    } else {
        resultValue = numericPrimary - numericSecondary;
    }

    return resultValue;
}

console.log(processRawText(require("fs").readFileSync("/dev/stdin", "utf8").trim()));