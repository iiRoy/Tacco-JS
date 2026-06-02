function processInput(dataLines) {
    const firstComparisonValue = dataLines[2];
    const secondComparisonValue = dataLines[3];
    const thirdComparisonValue = dataLines[4];
    const fourthComparisonValue = dataLines[5];

    const isFirstPairIdentical = (firstComparisonValue === secondComparisonValue);
    const isSecondPairIdentical = (thirdComparisonValue === fourthComparisonValue);

    const positiveResultString = "Yes";
    const negativeResultString = "No";

    if (isFirstPairIdentical && isSecondPairIdentical) {
        console.log(positiveResultString);
    } else {
        console.log(negativeResultString);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
