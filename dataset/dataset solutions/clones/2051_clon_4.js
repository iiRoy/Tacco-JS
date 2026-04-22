const ProcessingUnit = (inputSource => {
    "use strict";

    const documentLines = inputSource.split('\n');
    const relevantDatumLine = documentLines.length > 1 ? documentLines[1] : '';
    const componentTokens = relevantDatumLine.match(/\S+/g) || [];

    const tokenTally = new Map();
    componentTokens.forEach(token => {
        tokenTally.set(token, (tokenTally.get(token) || 0) + 1);
    });

    let universalCombinationSum = 0;
    for (const tokenCount of tokenTally.values()) {
        universalCombinationSum += tokenCount * (tokenCount - 1) / 2;
    }

    const outcomeValues = componentTokens.map(currentIndividualToken => {
        const currentTokenFrequency = tokenTally.get(currentIndividualToken);
        return universalCombinationSum - (currentTokenFrequency - 1);
    });

    console.log(outcomeValues.join('\n'));
});
ProcessingUnit(require("fs").readFileSync("/dev/stdin", "utf8").trim());