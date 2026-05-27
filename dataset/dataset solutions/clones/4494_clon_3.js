function processInputAndFindPattern(rawInput) {
    const targetString = rawInput.split("\n")[0];

    const arePrefixHalvesIdentical = (sourceStr, currentLength) => {
        if (currentLength <= 0 || currentLength % 2 !== 0) {
            return false;
        }

        const halfLength = currentLength / 2;

        for (let comparisonIndex = 0; comparisonIndex < halfLength; ++comparisonIndex) {
            if (sourceStr[comparisonIndex] !== sourceStr[comparisonIndex + halfLength]) {
                return false;
            }
        }
        return true;
    };

    for (let currentPrefixLength = targetString.length - 2; currentPrefixLength >= 2; currentPrefixLength -= 2) {
        if (arePrefixHalvesIdentical(targetString, currentPrefixLength)) {
            console.log("%d", currentPrefixLength);
            return;
        }
    }
}

processInputAndFindPattern(require("fs").readFileSync("/dev/stdin", "utf8"));
