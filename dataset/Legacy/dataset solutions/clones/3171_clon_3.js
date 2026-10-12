"use strict";

function calculateConvertedValue(originalAmount, currencySymbol) {
    const BTC_TO_UNIT_RATE = 380000.0; 

    if (currencySymbol === 'BTC') {
        return originalAmount * BTC_TO_UNIT_RATE;
    } else {
        return originalAmount;
    }
}

function ProcessFinancialData(inputString) {
    let dataLines = inputString.split("\n");
    
    let entryCount = Number(dataLines[0]); 
    
    let accumulatedTotal = 0; 

    for (let currentIdx = 1; currentIdx <= entryCount; currentIdx++) {
        let lineContent = dataLines[currentIdx];
        
        let parts = lineContent.split(/\s/);
        
        let numericalAmount = Number(parts[0]);
        let currencySymbol = parts[1];

        let convertedValueForEntry = calculateConvertedValue(numericalAmount, currencySymbol);
        
        accumulatedTotal += convertedValueForEntry;
    }

    console.log(accumulatedTotal);
}

ProcessFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
