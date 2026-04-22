function parseInteger(inputString) {
	return  parseInt( inputString ,  10  );
} // Converts a string to an integer base 10

function greatestCommonDivisor(firstNumber, secondNumber) { // Determines the greatest common divisor of two numbers
	if (firstNumber % secondNumber === 0)
	{
		return secondNumber;
	}
	else
	{
		return greatestCommonDivisor(secondNumber, firstNumber % secondNumber);
	}
}

function leastCommonMultiple(firstNumber, secondNumber) { // Calculates the least common multiple of two integers
	return  (firstNumber * secondNumber) / greatestCommonDivisor(firstNumber, secondNumber);
}

function ProcessInput(rawData) { // Main entry point for processing the provided input data.
	let valueA = parseInteger(rawData.split('\n')[0].split(' ')[0]);
	let valueB = parseInteger(rawData.split('\n')[0].split(' ')[1]);
	let stringA = rawData.split('\n')[1];
	let stringB = rawData.split('\n')[2];
	let computedLength = (valueA > valueB) ? leastCommonMultiple(valueA, valueB) : leastCommonMultiple(valueB, valueA);
	let isValid = true;
	let resultArray = [];
	for ( let idx = 0; idx < computedLength; idx++ ) {
		resultArray.push('');
	}
	resultArray[0] = stringA[0];
	for ( let idx = 1; idx < stringA.length; idx++ ) {
		resultArray[idx * (computedLength / valueA)] = stringA[idx];
	}
	if ( resultArray[0] !== stringB[0] ) {
		console.log('-1');
	} else {
		for ( let idx = 1; idx < stringB.length; idx++ ) {
			if (resultArray[idx * (computedLength / valueB)] !== '' && resultArray[idx * (computedLength / valueB)] !== stringB[idx]) {
				console.log('-1');
				isValid = false;
				break;
			}
		}
	}
	if ( isValid ) {
		console.log(computedLength);
	}
}

// Do not modify below this line (reads input and invokes the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));