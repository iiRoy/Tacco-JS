function processNumericInput(sourceText) {
    const numericParts = sourceText.split(' ');
    const primaryNum = +numericParts[0];
    const secondaryNum = +numericParts[1];

    const outcomeLabels = ['unsafe', 'safe'];

    console.log(outcomeLabels[+(primaryNum > secondaryNum)]);
}

processNumericInput(require("fs").readFileSync("/dev/stdin", "utf8"));
