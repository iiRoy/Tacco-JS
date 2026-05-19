function readStandardInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function buildPattern(lengthA, lengthB) {
    const digitCharClass = "\\d";
    const separatorChar = "-";
    return new RegExp(`^${digitCharClass}{${lengthA}}${separatorChar}${digitCharClass}{${lengthB}}$`);
}

function processInputData(inputLines) {
    const dimensionParts = inputLines[0].split(" ");

    const lenA = Number(dimensionParts[0]);
    const lenB = Number(dimensionParts[1]);

    const inputString = inputLines[1];

    const patternMatcher = buildPattern(lenA, lenB);

    const isValid = patternMatcher.test(inputString);

    if (isValid) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(readStandardInput());
