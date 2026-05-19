function processInputData(rawInputString) {
    const stringParts = rawInputString.split(" ");

    const [kString, nString] = stringParts;

    const fixedMultiplier = 500;

    const kValue = Number(kString);
    const nValue = Number(nString);

    const multipliedK = kValue * fixedMultiplier;

    const meetsRequirement = multipliedK >= nValue;

    const printDecision = (conditionResult) => {
        if (conditionResult) {
            console.log("YES");
        } else {
            console.log("NO");
        }
    };

    printDecision(meetsRequirement);
}

const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(stdinContent);
