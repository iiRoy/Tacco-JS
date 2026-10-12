"use strict";

const computeFinalValue = (inputString) => {
    const initialBase = 700;
    
    const characterArray = inputString.split('').slice(0, 3); 
    
    const matchingSymbolCount = characterArray.filter(
        (currentSymbol) => currentSymbol === "○"
    ).length;
    
    const additionalAmount = matchingSymbolCount * 100;
    
    const finalResult = initialBase + additionalAmount;
    
    console.log(finalResult);
};

computeFinalValue(require("fs").readFileSync("/dev/stdin", "utf8"));
