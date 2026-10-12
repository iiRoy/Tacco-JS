"use strict";

const processInput = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    
    const parsedNumericValues = inputLines.map(Number);

    const maxCount500Yen = parsedNumericValues[0];
    const maxCount100Yen = parsedNumericValues[1];
    const maxCount50Yen = parsedNumericValues[2];
    
    const targetAmount = parsedNumericValues[3];

    let validCombinationsCount = 0;

    const VALUE_OF_500_YEN_COIN = 500;
    const VALUE_OF_100_YEN_COIN = 100;
    const VALUE_OF_50_YEN_COIN = 50;

    const calculateCurrentSum = (num500, num100, num50) => {
        const sum500 = VALUE_OF_500_YEN_COIN * num500;
        const sum100 = VALUE_OF_100_YEN_COIN * num100;
        const sum50 = VALUE_OF_50_YEN_COIN * num50;
        return sum500 + sum100 + sum50;
    };
    
    for (let current500Count = 0; current500Count <= maxCount500Yen; current500Count++) {
        for (let current100Count = 0; current100Count <= maxCount100Yen; current100Count++) {
            for (let current50Count = 0; current50Count <= maxCount50Yen; current50Count++) {
                const currentTotalValue = calculateCurrentSum(current500Count, current100Count, current50Count);
                
                if (currentTotalValue === targetAmount) {
                   validCombinationsCount++; 
                }
            }
        }
    }
    
    console.log(validCombinationsCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
