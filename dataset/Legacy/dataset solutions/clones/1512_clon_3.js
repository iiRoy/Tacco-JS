const RADIX_BASE = 10;

function retrieveInputData() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function computeProductMatches(limitValue) {
    let matchCounter = 0;
    for (let outerIndex = limitValue; outerIndex >= 1; outerIndex--) {
        for (let innerIndex = limitValue; innerIndex >= 1; innerIndex--) {
            const currentProduct = outerIndex * innerIndex;
            if (currentProduct < limitValue) {
                matchCounter++;
            }
        }
    }
    return matchCounter;
}

function processMainLogic(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const firstLineContent = inputLines[0];
    const parsedLimit = parseInt(firstLineContent, RADIX_BASE);
    
    const finalResult = computeProductMatches(parsedLimit);

    console.log(finalResult);
}

processMainLogic(retrieveInputData());
