const obtainSourceContent = require("fs").readFileSync;

function computeGreatestCommonDivisor(paramA, paramB) {
    if (paramB === 0n) {
        return paramA;
    }
    return computeGreatestCommonDivisor(paramB, paramA % paramB);
}

function deriveLeastCommonMultiple(valOne, valTwo) {
    if (valOne === 0n || valTwo === 0n) return 0n;
    return (valOne * valTwo) / computeGreatestCommonDivisor(valOne, valTwo);
}

const allLines = obtainSourceContent("/dev/stdin", "utf8").trim().split("\n");

const numericalSequence = allLines
    .filter(segment => segment.length > 0)
    .map(segment => BigInt(segment));

const finalAggregate = numericalSequence.reduce((acc, curr) => deriveLeastCommonMultiple(acc, curr));

console.log(finalAggregate.toString());