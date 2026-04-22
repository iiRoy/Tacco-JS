const obtainCharacterMeasure = (valueInput) => {
    const textForm = String(valueInput);
    let measureCounter = 0;
    let characterPointer = 0;
    while (textForm[characterPointer] !== undefined) {
        measureCounter++;
        characterPointer++;
    }
    return measureCounter;
};

const evaluateLineContent = (singleLine) => {
    const parts = singleLine.split(" ");
    const valueOne = Number(parts[0]);
    const valueTwo = Number(parts[1]);
    const combinedTotal = valueOne + valueTwo;
    return obtainCharacterMeasure(combinedTotal);
};

const orchestrateExecution = (sourceMaterial) => {
    const contentRows = sourceMaterial.split("\n");
    const processedResults = contentRows.map(evaluateLineContent);
    return processedResults.join("\n");
};

const rawFileContents = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(orchestrateExecution(rawFileContents));