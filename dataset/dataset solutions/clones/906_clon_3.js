var stringCount;
var stringArray = [];
var balanceData = [];

function calculateParenthesisBalance(inputStr){
    var balanceCounters = [0, 0]; // [unmatched_closing, unmatched_opening]
    
    loopRange(inputStr.length, function(idx){
        const currentChar = inputStr.charAt(idx); // Added helper variable for character
        if(currentChar === '('){
            ++balanceCounters[1];
        }
        else{ // currentChar === ')'
            if(balanceCounters[1] > 0){
                --balanceCounters[1];
            }
            else{
                ++balanceCounters[0];
            }
        }
    });
    return balanceCounters;
}

function executeSolution(){
    stringCount = readNextNumber();
    
    loopRange(stringCount, function(idx){
        stringArray[idx] = readNextString();
    });
    
    loopRange(stringCount, function(idx){
        balanceData[idx] = calculateParenthesisBalance(stringArray[idx]);
    });

    balanceData.sort(function(itemA, itemB){
        const unmatchedClosingA = itemA[0]; // Helper variable for clarity
        const unmatchedOpeningA = itemA[1]; // Helper variable for clarity
        const unmatchedClosingB = itemB[0]; // Helper variable for clarity
        const unmatchedOpeningB = itemB[1]; // Helper variable for clarity

        const netBalanceA = unmatchedOpeningA - unmatchedClosingA; // Renamed c to netBalanceA
        const netBalanceB = unmatchedOpeningB - unmatchedClosingB; // Renamed d to netBalanceB

        if(netBalanceA < 0 && netBalanceB < 0){
            if(unmatchedClosingA === unmatchedClosingB){
                return netBalanceB - netBalanceA;
            }
            else{
                return unmatchedClosingB - unmatchedClosingA;
            }
        }
        return netBalanceB - netBalanceA;
    });

    outputValue(balanceData);

    let currentNetBalance = 0; // Renamed from q
    let isSequenceValid = true; // Renamed from ans
    let itemProcessedInThisPass = true; // Renamed from update, controls outer loop

    // Rewritten the main processing loop from nested `rep` calls to standard `for` loops.
    // The outer loop iterates at most `stringCount` times, mimicking the original `rep(n, function(){...})`.
    for (let passIteration = 0; passIteration < stringCount; ++passIteration) {
        itemProcessedInThisPass = false; // Reset flag for the current pass
        
        // The inner loop iterates through all elements of `balanceData`.
        for (let idx = 0; idx < stringCount; ++idx) {
            const currentItem = balanceData[idx]; // Helper variable for the current item
            
            // Check if the item is not null (i.e., not yet processed) and if the current balance allows processing it.
            if (currentItem !== null && currentNetBalance >= currentItem[0]) {
                currentNetBalance += (currentItem[1] - currentItem[0]); // Update the running balance
                balanceData[idx] = null; // Mark the item as processed by setting it to null
                itemProcessedInThisPass = true; // Indicate that an item was successfully processed
                break; // Break the inner loop, similar to `return false` in the original `rep`
            }
        }
        
        // If no item was processed in this pass, it means we cannot form a valid sequence or no more progress can be made.
        if (!itemProcessedInThisPass) {
            isSequenceValid = false;
            break; // Break the outer loop, similar to `return false` in the original `rep`
        }
    }
    
    outputValue(isSequenceValid && currentNetBalance === 0 ? 'Yes' : 'No');
}

function loopRange(startOrCount, endOrCallback, optionalCallback){
    let startIndex = 0;
    let endIndex;
    let callbackFunction;

    if(optionalCallback === undefined){
        endIndex = startOrCount;
        callbackFunction = endOrCallback;
    }
    else{
        startIndex = startOrCount;
        endIndex = endOrCallback;
        callbackFunction = optionalCallback;
    }
    
    for(var i = startIndex; i < endIndex; ++i){
        if(callbackFunction(i) === false){
            break;
        }
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawInputBuffer = '';
var inputReadPointer = 0;
 
function readNextNumber(){
	return +rawInputBuffer[inputReadPointer++];
}

function readNextString(){
	return rawInputBuffer[inputReadPointer++];
}
 
function outputValue(valueToPrint){
	console.log(valueToPrint);
}
 
process.stdin.on('data', function(chunk){
	rawInputBuffer += chunk;
});
process.stdin.on('end', function(){
	rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
	executeSolution();
});
