let numStrings;
let stringInputs = [];
let parsedPairs = [];

function processStringBalance(inputString){
    let balanceState = [0, 0];
    const stringLength = inputString.length;

    for (let charIndex = 0; charIndex < stringLength; ++charIndex) {
        const currentChar = inputString.charAt(charIndex);
        if (currentChar === '(') {
            balanceState[1]++;
        } else {
            if (balanceState[1] > 0) {
                balanceState[1]--;
            } else {
                balanceState[0]++;
            }
        }
    }
    return balanceState;
}

function executeSolution(){
    numStrings = readNumber();
    
    for (let i = 0; i < numStrings; ++i) {
        stringInputs[i] = readString();
    }
    
    for (let i = 0; i < numStrings; ++i) {
        parsedPairs[i] = processStringBalance(stringInputs[i]);
    }

    let currentBalance = 0;
    let overallSuccess = true;
    let remainingItemsToProcess = numStrings;

    for (let outerIteration = 0; outerIteration < numStrings; ++outerIteration) {
        let itemProcessedInThisPass = false;
        
        for (let itemIndex = 0; itemIndex < numStrings; ++itemIndex) {
            if (parsedPairs[itemIndex] !== null) {
                const requiredOpenCount = parsedPairs[itemIndex][0];
                const netBalanceChange = parsedPairs[itemIndex][1] - parsedPairs[itemIndex][0];

                if (currentBalance >= requiredOpenCount) {
                    currentBalance += netBalanceChange;
                    parsedPairs[itemIndex] = null;
                    itemProcessedInThisPass = true;
                    remainingItemsToProcess--;
                    break;
                }
            }
        }

        if (!itemProcessedInThisPass) {
            overallSuccess = false;
            break;
        }
        
        if (remainingItemsToProcess === 0) {
            break;
        }
    }
    
    outputResult(overallSuccess && currentBalance === 0 ? 'Yes' : 'No');
}

function iterateRange(startValue, endValue, operationCallback){
    let actualStart = startValue;
    let actualEnd = endValue;
    let callbackFunction = operationCallback;

    if(operationCallback === undefined){
        callbackFunction = endValue;
        actualEnd = startValue;
        actualStart = 0;
    }

    for(let loopCounter = actualStart; loopCounter < actualEnd; ++loopCounter){
        if(callbackFunction(loopCounter) === false){
            break;
        }
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let rawInputBuffer = '';
let bufferIndex = 0;
 
function readNumber(){
	return +rawInputBuffer[bufferIndex++];
}

function readString(){
	return rawInputBuffer[bufferIndex++];
}
 
function outputResult(valueToPrint){
	console.log(valueToPrint);
}
 
process.stdin.on('data', function(chunk){
	rawInputBuffer += chunk;
});

process.stdin.on('end', function(){
	rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
	executeSolution();
});
