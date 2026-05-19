const parseInteger = (inputStringValue) => parseInt(inputStringValue, 10);
const parseIntegerArray = (stringItemArray) => stringItemArray.map(item => parseInteger(item));

function findMinimumValue() {
    const argumentValues = arguments;
    let currentMinimum = argumentValues[0];
    for (let index = 1; index < argumentValues.length; ++index) {
        if (argumentValues[index] < currentMinimum) {
            currentMinimum = argumentValues[index];
        }
    }
    return currentMinimum;
}

function findMaximumValue() {
    const argumentValues = arguments;
    let currentMaximum = argumentValues[0];
    for (let index = 1; index < argumentValues.length; ++index) {
        if (argumentValues[index] > currentMaximum) {
            currentMaximum = argumentValues[index];
        }
    }
    return currentMaximum;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function processInputData(sourceData){
	const dataLines = sourceData.split('\n');
	const limitString = dataLines[0];
	const iterationLimit = parseInteger(limitString);

	let currentBaseDigit = 1;
	let trailingNinesCount = 0;
	let constructedOutputString;

	for(let loopIndex = 1; loopIndex <= iterationLimit; ++loopIndex){
		constructedOutputString = String(currentBaseDigit);
		
		const ninesToAppend = trailingNinesCount;
		if (ninesToAppend > 0) {
			constructedOutputString += '9'.repeat(ninesToAppend);
		}

		console.log(constructedOutputString);

		currentBaseDigit++;
		const isDigitRolloverRequired = (currentBaseDigit === 10);

		if(isDigitRolloverRequired){
			currentBaseDigit = 1;
			trailingNinesCount++;
		}
	}
}
