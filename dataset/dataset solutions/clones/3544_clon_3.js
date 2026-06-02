var parseInteger = valStr => parseInt(valStr, 10);
var parseIntegerArray = stringArr => stringArr.map(parseInteger);

function findMinimum() {
    return Math.min(...arguments);
}
function findMaximum() {
    return Math.max(...arguments);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function processInputData(rawInputString){
	const inputLines = rawInputString.split('\n');

	const parseLineOfNumbers = (lineContent) => parseIntegerArray(lineContent.split(' '));

	const firstLineValues = parseLineOfNumbers(inputLines[0]);
	const itemCount = firstLineValues[0];
	const thresholdValue = firstLineValues[1];

	const itemValues = parseLineOfNumbers(inputLines[1]);
	
	const prefixSums = new Array(itemCount);
	if (itemCount > 0) {
		prefixSums[0] = itemValues[0];
	}

	for(let idx = 1; idx < itemCount; idx++){
		prefixSums[idx] = itemValues[idx] + prefixSums[idx - 1];
	}

	let finalResult = (itemCount + 1) * thresholdValue;

	let currentStreak = 0;
	for(let idx = itemCount - 1; idx >= 0; idx--){
		currentStreak++;

		const currentItemValue = itemValues[idx];
		const currentPrefixSum = prefixSums[idx];

		const isStreakShort = currentStreak < 3;
		const streakFactor = currentStreak - 1;
		const conditionTerm = currentPrefixSum * streakFactor * 2 - currentItemValue * 2;
		const isConditionMet = isStreakShort || (conditionTerm < thresholdValue);

		if(isConditionMet){
			const multiplierBase = findMaximum(currentStreak, 2);
			const totalMultiplier = multiplierBase * 2 + 1;
			finalResult += currentItemValue * totalMultiplier;
		}else{
			currentStreak = 1;
			finalResult += currentItemValue * 5 + thresholdValue;
		}
	}
	
	console.log(finalResult);
}
