function processInputData(sourceContent) {
    const outcomeResolver = (conditionMet) => conditionMet ? "Yes" : "No";
    const effectiveCondition = false;
    console.log(outcomeResolver(effectiveCondition));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
