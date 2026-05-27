var numStrings;
var inputStrings = [];
var balancePairs = [];

function calculateParenthesisBalance(inputStr){
	var balanceState = [0, 0]; // [unmatched_closing, unmatched_opening]
	for (let charIndex = 0; charIndex < inputStr.length; ++charIndex){
		const charAtIndex = inputStr.charAt(charIndex);
		if (charAtIndex === '('){
			++balanceState[1]; // Increment unmatched opening
		}
		else { // charAtIndex === ')'
			if (balanceState[1] > 0){
				--balanceState[1]; // Match an opening parenthesis
			}
			else {
				++balanceState[0]; // Increment unmatched closing
			}
		}
	}
	return balanceState;
}

function executeSolution(){
	numStrings = readNumericToken();
	
	forEachInRange(numStrings, function(idx){
		inputStrings[idx] = readStringToken();
	});
	
	forEachInRange(numStrings, function(idx){
		balancePairs[idx] = calculateParenthesisBalance(inputStrings[idx]);
	});

	balancePairs.sort(function(pairA, pairB){
		const diffA = pairA[1] - pairA[0];
		const diffB = pairB[1] - pairB[0];
		
		if (diffA < 0 && diffB < 0){
			// Both are 'negative' (more closing than opening needed), sort by more closing needed first (descending [0])
			return pairB[0] - pairA[0];
		}
		// Otherwise, sort by (opening - closing) in descending order
		return diffB - diffA;
	});

	var currentAccumulatedBalance = 0;
	var isSequenceValid = true;
	
	for (let iterationStep = 0; iterationStep < numStrings; ++iterationStep) {
		let itemProcessedInIteration = false;
		for (let pairIndex = 0; pairIndex < numStrings; ++pairIndex) {
			const currentPair = balancePairs[pairIndex];
			
			if (currentPair === null) {
				continue; // This pair has already been processed
			}
			
			// Check if the current accumulated balance can cover the unmatched closing parentheses of this pair
			if (currentAccumulatedBalance >= currentPair[0]) {
				currentAccumulatedBalance += (currentPair[1] - currentPair[0]); // Update balance
				balancePairs[pairIndex] = null; // Mark this pair as processed
				itemProcessedInIteration = true;
				break; // Found and processed one pair, move to the next iteration step
			}
		}
		
		if (!itemProcessedInIteration) {
			isSequenceValid = false; // No suitable pair found in this iteration step
			break; // Cannot form a valid sequence
		}
	}
	
	emitResult(isSequenceValid && currentAccumulatedBalance === 0 ? 'Yes' : 'No');
}

function forEachInRange(startIdx, endIdx, callbackFunction){
	if (callbackFunction === undefined){
		callbackFunction = endIdx;
		endIdx = startIdx;
		startIdx = 0;
	}
	for (let loopCounter = startIdx; loopCounter < endIdx; ++loopCounter){
		if (callbackFunction(loopCounter) === false){
			break;
		}
	}
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawInputBuffer = '';
var inputDataCursor = 0;
 
function readNumericToken(){
	return +rawInputBuffer[inputDataCursor++];
}

function readStringToken(){
	return rawInputBuffer[inputDataCursor++];
}
 
function emitResult(valueToOutput){
	console.log(valueToOutput);
}
 
process.stdin.on('data', function(dataChunk){
	rawInputBuffer += dataChunk;
});
process.stdin.on('end', function(){
	rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
	executeSolution();
});
