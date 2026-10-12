var parseInteger = val => Number.parseInt(val, 10);
var parseIntegerArray = arr => arr.map(val => parseInteger(val));
var absoluteValue = x => x > 0 ? x : -x;
function findMinimum(...values) { return Math.min(...values); }
function findMaximum(...values) { return Math.max(...values); }
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInputData(rawData){
	const lines = rawData.split('\n');
	const firstLineParts = lines[0].split(' ');
	const totalElements = parseInteger(firstLineParts[0]);
	const numIntervals = parseInteger(firstLineParts[1]);
	const intervalPairs = [];

	for (let k = 0; k < numIntervals; k++) {
		const currentIntervalData = parseIntegerArray(lines[k + 1].split(' '));
		const startVal = currentIntervalData[0];
		const endVal = currentIntervalData[1];
		intervalPairs[k] = [startVal, endVal];
	}

	let currentLeftBound = 0;
	let currentRightBound = totalElements - 1;
	let currentPair;
	let resultCount = 1;

	for (let k = 0; k < numIntervals; k++) {
		currentPair = intervalPairs[k];
		const pairStart = currentPair[0];
		const pairEnd = currentPair[1];

		if (pairEnd <= currentLeftBound || currentRightBound <= pairStart) {
			resultCount++;
			currentLeftBound = pairStart;
			currentRightBound = pairEnd;
		} else {
			currentLeftBound = findMaximum(currentLeftBound, pairStart);
			currentRightBound = findMinimum(currentRightBound, pairEnd);
		}
	}
	console.log(resultCount);
}
