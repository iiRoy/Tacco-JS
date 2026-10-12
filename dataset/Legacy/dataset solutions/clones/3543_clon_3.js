const parseInteger = valString => parseInt(valString, 10);
const parseIntegerArray = stringArray => stringArray.map(parseInteger);
const findMinimum = (...values) => Math.min(...values);
const findMaximum = (...values) => Math.max(...values);

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function processInputData(rawData){
	const lineSegments = rawData.split('\n');
	const firstLineParts = parseIntegerArray(lineSegments[0].split(' '));
	const itemCount = firstLineParts[0];
	const thresholdValue = firstLineParts[1];
	const itemValues = parseIntegerArray(lineSegments[1].split(' '));
	
	const cumulativeSums = new Array(itemCount);
	cumulativeSums[0] = itemValues[0];

	for(let idx = 1; idx < itemCount; ++idx){
		cumulativeSums[idx] = itemValues[idx] + cumulativeSums[idx - 1];
	}

	let finalResult = (itemCount + 1) * thresholdValue;

	let currentCount = 0;
	for(let idx = itemCount - 1; idx >= 0; --idx){
		currentCount++;
		const currentItemValue = itemValues[idx];
		const currentCumulativeSum = cumulativeSums[idx];
		
		const conditionFactor = (currentCount - 1) * 2;
		const conditionRHS = currentCumulativeSum * conditionFactor - currentItemValue * 2;

		if(currentCount > 2 && thresholdValue <= conditionRHS){
			currentCount = 1;
			finalResult += thresholdValue;
		}
		
		const multiplierBase = findMaximum(currentCount, 2);
		const finalMultiplier = multiplierBase * 2 + 1;
		finalResult += currentItemValue * finalMultiplier;
	}
	
	console.log(finalResult);
}
