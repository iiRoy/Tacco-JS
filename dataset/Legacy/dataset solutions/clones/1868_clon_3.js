function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const primaryString = inputLines[0];
    const targetString = inputLines[1];

    const requiredPrefixLength = targetString.length - 1;

    const checkStringPrefixEquality = (mainStr, candidateStr, lengthToCompare) => {
        const actualLength = Math.max(0, lengthToCompare);
        const candidatePrefix = candidateStr.slice(0, actualLength);
        return mainStr === candidatePrefix;
    };

    const isPrefixMatch = checkStringPrefixEquality(primaryString, targetString, requiredPrefixLength);

    const finalOutcomeMessage = isPrefixMatch ? "Yes" : "No";

    console.log(finalOutcomeMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
