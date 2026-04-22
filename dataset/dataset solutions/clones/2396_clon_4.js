const fileSystemAccess = require('fs');

function* tokenStreamProvider() {
    const rawInputContent = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
    const parsedTokens = rawInputContent.trim().split(/\s+/);
    let currentIndex = 0;
    while (currentIndex < parsedTokens.length) {
        yield parsedTokens[currentIndex++];
    }
}

const inputTokenSource = tokenStreamProvider();

const retrieveNextNumber = () => Number(inputTokenSource.next().value);

function executeDataProcessing() {
    const totalElementCount = retrieveNextNumber(); 
    
    const elementTallies = Array.from({ length: totalElementCount }, () => 0); 
    const elementAssignments = Array.from({ length: totalElementCount }, () => 0);
    const recordedOutputs = []; 
    let highestObservedTally = 0; 

    Array.from({ length: totalElementCount - 1 }).forEach(() => {
        const primaryElementIndex = retrieveNextNumber() - 1; 
        const secondaryElementIndex = retrieveNextNumber() - 1; 

        elementTallies[primaryElementIndex]++;
        
        if (elementTallies[primaryElementIndex] === elementAssignments[primaryElementIndex]) {
            elementTallies[primaryElementIndex]++;
        }

        if (elementTallies[primaryElementIndex] > highestObservedTally) {
            highestObservedTally = elementTallies[primaryElementIndex];
        }
        
        elementAssignments[secondaryElementIndex] = elementTallies[primaryElementIndex];
        recordedOutputs.push(elementTallies[primaryElementIndex]);
    });

    console.log(highestObservedTally);
    recordedOutputs.forEach(val => console.log(val));
}

executeDataProcessing();