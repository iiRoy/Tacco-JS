function solveProblem(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const firstInputLine = inputLines[0];
    const targetValue = parseInt(firstInputLine, 10);

    const MAX_FACTOR_LIMIT = 9;

    const determineIfProductExists = (numToCheck, factorLimit) => {
        for (let firstFactor = 1; firstFactor <= factorLimit; firstFactor++) {
            for (let secondFactor = 1; secondFactor <= factorLimit; secondFactor++) {
                if (firstFactor * secondFactor === numToCheck) {
                    return true;
                }
            }
        }
        return false;
    };

    const isProductFound = determineIfProductExists(targetValue, MAX_FACTOR_LIMIT);

    if (isProductFound) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
