function processInput(incomingData) {
    const firstLineContent = incomingData.split("\n")[0];
    const lastCharIdentifier = firstLineContent.charAt(firstLineContent.length - 1);
    const suffixRuleSet = {
        "s": "es",
        "default": "s"
    };
    const derivedSuffix = suffixRuleSet[lastCharIdentifier] || suffixRuleSet["default"];
    console.log([firstLineContent, derivedSuffix].join(''));
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
