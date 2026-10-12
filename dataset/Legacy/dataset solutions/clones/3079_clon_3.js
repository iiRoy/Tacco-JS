function determineEqualityStatus(valA, valB, valC) {
    const areFirstTwoEqual = (valA == valB);
    const areLastTwoEqual = (valB == valC);
    const allMatch = areFirstTwoEqual && areLastTwoEqual;
    return allMatch;
}

function processInputData(rawInputContent) {
    const allInputLines = rawInputContent.split("\n");
    const relevantLine = allInputLines[0];
    const stringComponents = relevantLine.split(" ");

    const firstComponent = stringComponents[0];
    const secondComponent = stringComponents[1];
    const thirdComponent = stringComponents[2];

    const areAllValuesIdentical = determineEqualityStatus(firstComponent, secondComponent, thirdComponent);

    let finalOutputString;
    if (areAllValuesIdentical) {
        finalOutputString = "Yes";
    } else {
        finalOutputString = "No";
    }

    console.log('%s', finalOutputString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
