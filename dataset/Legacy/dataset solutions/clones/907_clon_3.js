var numStrings;
var stringArray = [];
var balancePairs = [];

function calculateBalance(inputStr){
	var balanceState = [0, 0]; // [unmatched_left_parens_needed, unmatched_right_parens_provided]
	const OPEN_PAREN_CHAR = '(';
	const CLOSE_PAREN_CHAR = ')';

	iterateRange(inputStr.length, function(idx){
		var currentChar = inputStr.charAt(idx);
		if(currentChar === OPEN_PAREN_CHAR){
			++balanceState[1]; // Increment count of open parens that need a closing one
		}
		else if (currentChar === CLOSE_PAREN_CHAR){
			if(balanceState[1] > 0){
				--balanceState[1]; // Match an existing open paren
			}
			else{
				++balanceState[0]; // Increment count of closing parens that need an open one
			}
		}
	});
	return balanceState;
}

function processInputData(){
	numStrings = readNumber();
	iterateRange(numStrings, function(idx){
		stringArray[idx] = readString();
	});

	iterateRange(numStrings, function(idx){
		balancePairs[idx] = calculateBalance(stringArray[idx]);
	});

	balancePairs.sort(function(pairA, pairB){
		var netBalanceA = pairA[1] - pairA[0]; // (right_unmatched - left_unmatched)
		var netBalanceB = pairB[1] - pairB[0];
		if(netBalanceA !== netBalanceB){
			return netBalanceB - netBalanceA; // Sort descending by net balance
		}
		return pairB[0] - pairA[0]; // For ties, sort descending by left_unmatched requirement
	});

	var currentAccumulatedBalance = 0;
	var isProcessingPossible = true;
	let processedItemCount = 0; // Helper variable to track how many pairs have been successfully processed

	// This loop attempts to process one string at a time until all are processed or no more can be processed.
	while (isProcessingPossible && processedItemCount < numStrings) {
		let foundMatchInCurrentPass = false;
		for (let k = 0; k < numStrings; ++k) {
			// Check if the pair is not null (i.e., not yet processed)
			// and if the current accumulated balance can cover the left_unmatched requirement of this string
			if (balancePairs[k] !== null && currentAccumulatedBalance >= balancePairs[k][0]) {
				currentAccumulatedBalance += (balancePairs[k][1] - balancePairs[k][0]);
				balancePairs[k] = null; // Mark this string's balance pair as processed
				foundMatchInCurrentPass = true;
				processedItemCount++;
				break; // Found one, move to the next overall processing attempt
			}
		}
		if (!foundMatchInCurrentPass) {
			isProcessingPossible = false; // No suitable string found in this pass, cannot proceed further
		}
	}

	outputResult(isProcessingPossible && currentAccumulatedBalance === 0 ? 'Yes' : 'No');
}

function iterateRange(startIndex, endIndex, callbackFn){
	// Handle optional startIndex argument (when only two arguments are provided)
	if(callbackFn === undefined){
		callbackFn = endIndex;
		endIndex = startIndex;
		startIndex = 0;
	}
	for(var idx = startIndex; idx < endIndex; ++idx){
		if(callbackFn(idx) === false){ // Allow the callback function to break the loop by returning false
			break;
		}
	}
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawDataBuffer = '';
var currentInputPointer = 0;
 
function readNumber(){
	return +rawDataBuffer[currentInputPointer++];
}

function readString(){
	return rawDataBuffer[currentInputPointer++];
}
 
function outputResult(valueToPrint){
	console.log(valueToPrint);
}

// Encapsulate input processing setup into a helper function
function initializeInputHandling() {
    process.stdin.on('data', function(chunk){
        rawDataBuffer += chunk;
    });
    process.stdin.on('end', function(){
        rawDataBuffer = rawDataBuffer.trim().split(/\s+/);
        processInputData();
    });
}

initializeInputHandling();
