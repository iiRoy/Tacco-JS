function processInput(rawData) {
    const initialParams = rawData[0].split(' ');
    const numItems = parseInt(initialParams[0], 10);
    const numOperations = parseInt(initialParams[1], 10);

    const itemCosts = rawData[1].split(' ').map(Number);
    const factorValues = rawData[2].split(' ').map(Number);

    const PRODUCT_CALC_INDEX = 0;
    const ORIGINAL_COST_INDEX = 1;
    const FACTOR_VALUE_INDEX = 2;

    itemCosts.sort((elemA, elemB) => elemB - elemA);

    factorValues.sort((elemA, elemB) => elemA - elemB);
  
    const transformedData = Array.from({ length: numItems }, (_, idx) => {
        const currentCost = itemCosts[idx];
        const currentFactor = factorValues[idx];
        return [currentCost * currentFactor, currentCost, currentFactor];
    });
  
    for (let opIdx = 0; opIdx < numOperations; opIdx++) {
        transformedData.sort((elemA, elemB) => elemB[PRODUCT_CALC_INDEX] - elemA[PRODUCT_CALC_INDEX]);

        let targetEntry = transformedData[0];
        targetEntry[ORIGINAL_COST_INDEX] = targetEntry[ORIGINAL_COST_INDEX] - 1; 
        targetEntry[PRODUCT_CALC_INDEX] = targetEntry[ORIGINAL_COST_INDEX] * targetEntry[FACTOR_VALUE_INDEX];
    }
  
    transformedData.sort((elemA, elemB) => elemB[PRODUCT_CALC_INDEX] - elemA[PRODUCT_CALC_INDEX]);

    console.log(transformedData[0][PRODUCT_CALC_INDEX]);
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = fileContents.split("\n");
processInput(lines);
