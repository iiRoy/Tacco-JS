const objectPropertyMatcher = (firstObject, secondObject) => {
    const primaryKeySet = Reflect.ownKeys(firstObject);
    const secondaryKeySet = Reflect.ownKeys(secondObject);

    if (primaryKeySet.length !== secondaryKeySet.length) {
        return false;
    }

    return primaryKeySet.every(keyIdentifier => {
        return firstObject[keyIdentifier] === secondObject[keyIdentifier];
    });
};

const numericalParser = (inputString) => {
    return Math.trunc(Number(inputString));
};

const processData = (incomingDatum) => {
    const processedNumber = numericalParser(incomingDatum);
    const comparisonThreshold = 999;
    let finalOutcome;

    if (processedNumber <= comparisonThreshold) {
        finalOutcome = "ABC";
    } else {
        finalOutcome = "ABD";
    }
    process.stdout.write(finalOutcome + '\n');
};

const fileSystemModule = require('node:fs');
const acquiredContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processData(acquiredContent);