function processComparison(rawInput) {
    const numberStrings = rawInput.split("\n");
    const valA = parseFloat(numberStrings[0]);
    const valB = parseFloat(numberStrings[1]);

    const comparisonResult = Math.sign(valA - valB);

    const outcomeMessages = ["LESS", "EQUAL", "GREATER"];
    
    console.log(outcomeMessages[comparisonResult + 1]);
}
processComparison(require("fs").readFileSync("/dev/stdin", "utf8").trim());
