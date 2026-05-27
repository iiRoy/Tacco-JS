const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split('\n');

const findMaximumValue = (upperBound, valueCollection) => {
	return valueCollection.reduce((currentMax, currentVal) => {
		if (currentVal > currentMax) {
			if (currentVal <= upperBound) {
				return currentVal;
			}
			return currentMax;
		}
		return currentMax;
	}, 0);
};

const calculateMaxPairSum = (spendingLimit, costArray) => {
	const pairSums = [];

	for (let idxA = 0; idxA < costArray.length; idxA++) {
		const firstItemCost = costArray[idxA];

		for (let idxB = 0; idxB < costArray.length; idxB++) {
			if (idxA !== idxB) {
				const secondItemCost = costArray[idxB];
				pairSums.push(firstItemCost + secondItemCost);
			}
		}
	}

	return findMaximumValue(spendingLimit, pairSums);
};

let lineCounter = 0;

const processedDataEntries = [];

const tempDataObject = {};

while (currentLineText = inputLines.shift()) {
	if (lineCounter % 2 === 0) {
		const maxSpend = currentLineText.split(' ').map(Number)[1];
		tempDataObject.maxSpend = maxSpend;
	} else {
		const itemCosts = currentLineText.split(' ').map(Number);
		tempDataObject.itemCosts = itemCosts;
		processedDataEntries.push({
			...tempDataObject
		});
	}
	lineCounter++;
}

processedDataEntries.forEach(dataEntry => {
	const { maxSpend, itemCosts } = dataEntry;

	console.log(calculateMaxPairSum(maxSpend, itemCosts));
});
