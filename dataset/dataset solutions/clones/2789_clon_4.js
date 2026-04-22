'use strict';

const CalculationEngine = (inputString) => {
    const numberTokens = inputString.trim().match(/\d+/g).map(Number);
    const overallCount = numberTokens[0];
    const azureItems = numberTokens[1];

    const primeDivisor = 1000000007;

    const computeCombinations = (setA, setB) => {
        if (setB < 0 || setB > setA) return 0;
        if (setB === 0 || setB === setA) return 1;

        const productHigh = Array.from({ length: setB }, (_, index) => setA - index)
                                 .reduce((accumulator, value) => accumulator * value, 1);

        const productLow = Array.from({ length: setB }, (_, index) => setB - index)
                                .reduce((accumulator, value) => accumulator * value, 1);
        
        const combinationResult = productHigh / productLow;
        return combinationResult;
    };

    Array.from({ length: azureItems }, (_, iterationIndex) => iterationIndex + 1)
         .forEach((stepCounter) => {
            let interimValue = computeCombinations(overallCount - azureItems + 1, stepCounter) *
                               computeCombinations(azureItems - 1, stepCounter - 1);
            
            let finalOutput = Math.round(interimValue % primeDivisor);
            finalOutput = (finalOutput === -0) ? 0 : finalOutput;

            process.stdout.write(String(finalOutput) + '\n');
         });
};

(() => {
    const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    CalculationEngine(fileContent);
})();