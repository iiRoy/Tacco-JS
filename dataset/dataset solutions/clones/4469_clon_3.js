function processInputData(rawData) {
    let processedLines = rawData.split("\n");

    let firstLineContent = processedLines[0];
    let firstLineParts = firstLineContent.split(" ");

    let stringValA = firstLineParts[0];
    let stringValB = firstLineParts[1];

    let valA = Number(stringValA);
    let valB = Number(stringValB);

    let sumOfVals = valA + valB;
    let sumModThree = sumOfVals % 3;
    let aModThree = valA % 3;
    let bModThree = valB % 3;

    let conditionForPossible = (sumModThree === 0 || aModThree === 0 || bModThree === 0);

    if (conditionForPossible) {
        console.log("Possible");
    } else {
        console.log("Impossible");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
