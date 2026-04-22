const obtainSourceData = () => {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    const extractedNumbers = fileContents.match(/-?\d+/g).map(x => Number(x));
    return {
        firstElement: extractedNumbers[0],
        secondElement: extractedNumbers[1]
    };
};

const determineModulo = (numberValue, divisorValue) => {
    return numberValue - Math.floor(numberValue / divisorValue) * divisorValue;
};

const evaluateOutcome = (dataContainer) => {
    const primaryValue = dataContainer.firstElement;
    const secondaryValue = dataContainer.secondElement;

    const decisionMatrix = [
        [false, false, false],
        [false, true, false],
        [false, false, true]
    ];

    const remainderOne = determineModulo(primaryValue, 3);
    const remainderTwo = determineModulo(secondaryValue, 3);

    const isConditionMet = decisionMatrix[remainderOne][remainderTwo];

    console.log(isConditionMet ? "Impossible" : "Possible");
};

const executeProgram = () => {
    const inputData = obtainSourceData();
    evaluateOutcome(inputData);
};

executeProgram();