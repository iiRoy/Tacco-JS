const evaluateNumericalRelationship = (sourceText) => {
    const [val1, val2, val3] = sourceText.split('\n')[0].match(/-?\d+/g).map(Number);
    const conditionMet = (val3 - val1 - val2) > 0;
    const resultPhrase = ["Yes", "No"][+conditionMet];
    console.log(resultPhrase);
};
evaluateNumericalRelationship(require("fs").readFileSync("/dev/stdin", "utf8"));