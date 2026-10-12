var outputResult = console.log;
if (typeof process !== "undefined") {
	var fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
	var rawInputLines = fileInputContent.split("\n");
	processInputData(rawInputLines);
}

function parseInputLine(lineContent) {
	const lineParts = lineContent.split(" ");
	if (lineParts.length >= 2) {
		return lineParts.map(Number);
	} else {
		return Number(lineContent);
	}
}

function updateMaxOrEqual(targetMap, key, newValue) {
	if (targetMap[key] === undefined || newValue >= targetMap[key]) {
		targetMap[key] = newValue;
	}
}

function conditionalKnapsackUpdate(currentMap, previousMap, weightKey, candidateValue) {
	const previousValueAtKey = previousMap[weightKey];
	const currentValueAtKey = currentMap[weightKey];

	if ((previousValueAtKey === undefined || previousValueAtKey <= candidateValue) &&
		(currentValueAtKey === undefined || currentValueAtKey <= candidateValue)) {
		currentMap[weightKey] = candidateValue;
	}
}

function processInputData(inputLines) {
	const parsedData = inputLines.map(parseInputLine);

	const firstLineDetails = parsedData.shift();
	const itemCount = firstLineDetails.shift();
	const maxWeightCapacity = firstLineDetails.shift();

	const availableItems = parsedData;

	calculateMaxValue(availableItems, maxWeightCapacity);
}

function calculateMaxValue(itemsList, capacityLimit) {
	let currentWeightValues = {};
	let previousWeightValues = {};

	for (let itemIdx = 0; itemIdx < itemsList.length; itemIdx++) {
		const itemValue = itemsList[itemIdx][0];
		const itemWeight = itemsList[itemIdx][1];

		previousWeightValues = currentWeightValues;
		currentWeightValues = {};

		const sortedPreviousWeights = Object.keys(previousWeightValues).map(Number).sort((a, b) => a - b);

		for (const existingWeight of sortedPreviousWeights) {
			updateMaxOrEqual(currentWeightValues, existingWeight, previousWeightValues[existingWeight]);

			const potentialNewWeight = existingWeight + itemWeight;
			if (potentialNewWeight <= capacityLimit) {
				const potentialNewValue = previousWeightValues[existingWeight] + itemValue;
				conditionalKnapsackUpdate(currentWeightValues, previousWeightValues, potentialNewWeight, potentialNewValue);
			} else {
				break;
			}
		}

		if (itemWeight <= capacityLimit) {
			conditionalKnapsackUpdate(currentWeightValues, previousWeightValues, itemWeight, itemValue);
		}
	}

	let finalCalculatedValue = 0;
	for (let weightSearchIterator = capacityLimit; weightSearchIterator > 0; weightSearchIterator--) {
		if (currentWeightValues[weightSearchIterator] !== undefined) {
			finalCalculatedValue = currentWeightValues[weightSearchIterator];
			break;
		}
	}
	outputResult(finalCalculatedValue);
}
