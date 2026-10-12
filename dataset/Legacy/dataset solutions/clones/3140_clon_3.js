"use strict"

function ProcessInput(inputData){
    const lineDelimiter = "\n";
    const valueDelimiter = " ";

    let inputLines = inputData.trim().split(lineDelimiter).reverse();
    let outputBuffer = [];

    const getNextLine = () => {
        return inputLines.pop();
    };

    const appendToOutput = (content) => {
        outputBuffer.push(content);
    };

    const parseNumericValues = (inputString) => {
        const stringComponents = inputString.split(valueDelimiter);
        const numericComponents = stringComponents.map(component => Number(component));
        return numericComponents;
    };

    const initialParametersLine = getNextLine();
    const parsedInitialParameters = parseNumericValues(initialParametersLine);

    let numRows = parsedInitialParameters[0];
    let numCols = parsedInitialParameters[1];
    let constantOffset = parsedInitialParameters[2];

    const coefficientValuesLine = getNextLine();
    let coefficients = parseNumericValues(coefficientValuesLine);
    let positiveSumCount = 0;

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++){
        const currentRowLine = getNextLine();
        const currentRowValues = parseNumericValues(currentRowLine);
        let currentCalculationSum = constantOffset;

        for (let colIndex = 0; colIndex < numCols; colIndex++){
            const productTerm = currentRowValues[colIndex] * coefficients[colIndex];
            currentCalculationSum = currentCalculationSum + productTerm;
        }

        if (currentCalculationSum > 0){
            positiveSumCount = positiveSumCount + 1;
        }
    }

    appendToOutput(positiveSumCount);

    let finalOutputContent = outputBuffer.join(lineDelimiter);
    console.log(finalOutputContent);
    return finalOutputContent;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
