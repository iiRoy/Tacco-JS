"use strict";

const processInput = inputData => {
    const lines = inputData.trim().split("\n");
    const firstLineParts = lines[0].split(" ");
    const elementCount = parseInt(firstLineParts[0]);
    
    let numberList = lines[1].split(" ").map(numStr => parseInt(numStr)).sort((valA, valB) => valA - valB);
    
    let currentIdx = 0;
    
    while(currentIdx < elementCount) {
        const currentValue = numberList[currentIdx];

        if(currentValue === -1) {
            currentIdx++;
            continue;
        }
        
        let foundDuplicate = false;
        let firstNonMultipleIdx = null;
        let firstNonMultipleFound = false;
        
        for(let checkIdx = currentIdx + 1; checkIdx < elementCount; checkIdx++) {
            const candidateValue = numberList[checkIdx];

            if(candidateValue === -1) {
                continue;
            }
            
            const isDivisibleByCurrent = (candidateValue % currentValue === 0);

            if (candidateValue === currentValue) {
                foundDuplicate = true;
            }
            
            if (isDivisibleByCurrent) {
                numberList[checkIdx] = -1;
            } else if (!firstNonMultipleFound) {
                firstNonMultipleIdx = checkIdx;
                firstNonMultipleFound = true;
            }
        }
        
        if(foundDuplicate) {
            numberList[currentIdx] = -1; 
        }
        
        if(firstNonMultipleIdx !== null) {
            currentIdx = firstNonMultipleIdx;
        } else {
            currentIdx++;
        }
    }
    
    const finalFilteredList = numberList.filter(num => num !== -1);
    console.log(finalFilteredList.length);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
