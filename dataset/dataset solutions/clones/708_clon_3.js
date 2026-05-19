var countN, countM;
var arrayA = [], arrayB = [];

function performBinarySearch(targetValue){
	var lowIndex = 0, highIndex = countM;
	while(highIndex - lowIndex > 1){
		var midPoint = (lowIndex + highIndex) >> 1;
		var currentElementInB = arrayB[midPoint];
		if(currentElementInB <= targetValue){
			lowIndex = midPoint;
		}
		else{
			highIndex = midPoint;
		}
	}
	return arrayB[lowIndex] === targetValue;
}

function executeProgramLogic(){
	while((countN = readNextNumber()) !== 0){ // Loop continues as long as countN is not zero
		countM = readNextNumber();
		
		arrayA = new Array(countN);
		arrayB = new Array(countM);

		iterateRange(countN, function(idx){
			arrayA[idx] = readNextNumber();
		});
		iterateRange(countM, function(idx){
			arrayB[idx] = readNextNumber();
		});

		arrayA.sort(function(val1, val2){
			return val1 - val2;
		});
		arrayB.sort(function(val1, val2){
			return val1 - val2;
		});

		var sumA = arrayA.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		var sumB = arrayB.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

		const totalDifference = sumB - sumA;
		const requiredDelta = Math.floor(totalDifference / 2);

		if(totalDifference % 2 !== 0){ // Check if totalDifference is odd
			outputValue(-1);
		}
		else{
			var foundPair = false;
			for (let i = 0; i < countN; ++i) {
				const currentAElement = arrayA[i];
				const targetForSearch = currentAElement + requiredDelta;
				if(performBinarySearch(targetForSearch)){
					outputValue(currentAElement + ' ' + targetForSearch);
					foundPair = true;
					break; 
				}
			}
			if(!foundPair){
				outputValue(-1);
			}
		}

		arrayA.length = 0; // Clear array for next iteration
		arrayB.length = 0; // Clear array for next iteration
	}
}

function iterateRange(startOrCount, endOrCallback, actualCallback){
	let loopStart = 0;
	let loopEnd;
	let currentCallback;

	if(actualCallback === undefined){
		loopEnd = startOrCount;
		currentCallback = endOrCallback;
	} else {
		loopStart = startOrCount;
		loopEnd = endOrCallback;
		currentCallback = actualCallback;
	}

	for(var idx = loopStart; idx < loopEnd; ++idx){
		if(currentCallback(idx) === false){
			break;
		}
	}
}

var inputTokens = '';

function readNextNumber(){
	const token = inputTokens.pop();
	return token !== undefined ? +token : 0; // Return 0 if no more tokens, to terminate loop
}
function readNextString(){
	return inputTokens.pop();
} 
function outputValue(val){
	console.log(val);
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk){
	inputTokens += dataChunk;
});
process.stdin.on('end', function(){
	inputTokens = inputTokens.trim().split(/\s+/).reverse();
	executeProgramLogic();
});
