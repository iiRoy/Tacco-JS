function processInputData(rawDataString) {
    const parsedValues = rawDataString.split(" ");

    const valueA = Number(parsedValues[0]);
    const valueB = Number(parsedValues[1]);
    const valueC = Number(parsedValues[2]);

    const tempDiffOne = valueA - valueB;
    const firstAbsDifference = Math.abs(tempDiffOne);

    const tempDiffTwo = valueA - valueC;
    const secondAbsDifference = Math.abs(tempDiffTwo);

    let resultIndicator;
    if (firstAbsDifference > secondAbsDifference) {
        resultIndicator = "B";
    } else {
        resultIndicator = "A";
    }

    console.log(resultIndicator);
}

function executeMainLogic() {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputData(standardInputContent);
}

executeMainLogic();
