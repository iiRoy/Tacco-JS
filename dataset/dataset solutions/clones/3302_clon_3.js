"use strict";

const solveKnapsackProblem = inputDataString => {
    const inputLines = inputDataString.trim().split("\n");
    
    const [numItemsStr, capacityLimitStr] = inputLines[0].split(" ");
    const numItems = parseInt(numItemsStr);
    const capacityLimit = parseInt(capacityLimitStr);
    
    const items = inputLines.slice(1, numItems + 1).map(line => {
        const [weightStr, valueStr] = line.split(" ");
        return {
            weight: parseInt(weightStr),
            value: parseInt(valueStr)
        };
    });
    
    let dpTable = Array.from({ length: numItems + 1 }, () => new Array(capacityLimit + 1).fill(0));
    
    for(let i = 1; i <= numItems; i++) {
        const currentItem = items[i - 1];
        const itemWeight = currentItem.weight;
        const itemValue = currentItem.value;
        
        for(let j = 0; j <= capacityLimit; j++) {
            const prevItemRow = dpTable[i - 1];
            
            if(itemWeight > j) {
                dpTable[i][j] = prevItemRow[j];
            } else {
                const valueIfExcluded = prevItemRow[j];
                const valueIfIncluded = itemValue + prevItemRow[j - itemWeight];
                
                dpTable[i][j] = Math.max(valueIfExcluded, valueIfIncluded);
            }
        }
    }
    
    const resultValue = dpTable[numItems][capacityLimit];
    console.log(resultValue);
}
solveKnapsackProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
