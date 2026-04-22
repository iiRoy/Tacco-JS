// This routine processes the provided information.
function ProcessData(rawData) {
	// The initial segment of data is parsed from the input string.
	var coordinates = rawData.split(' ');
	var limitVal = parseInt(coordinates[0]);
	var divisor = parseInt(coordinates[1]);
	var totalCount = 0;

	// Early exit condition based on input values.
	if (2 * limitVal < divisor) {
		return 0;
	}

	// Iterate through the first set of numbers.
	for (var firstNum = 1; firstNum <= limitVal; firstNum++) {

		var secondNum = firstNum % divisor;
		// Adjust the second number if it's zero.
		if (secondNum == 0)
			secondNum = divisor;
		
		// Loop for the second number, ensuring it stays within bounds.
		while (secondNum <= limitVal) {

			// Check a specific condition involving the first two numbers.
			if ((firstNum + secondNum) % divisor == 0) {
				var thirdNum = firstNum % divisor;
				// Adjust the third number if it's zero.
				if (thirdNum == 0)
					thirdNum = divisor;
				
				// Loop for the third number.
				while (thirdNum <= limitVal) {
					// Core condition check for all three numbers.
					if ((firstNum + thirdNum) % divisor == 0 && (thirdNum + secondNum) % divisor == 0) {
						// A valid triplet found, increment the counter.
						totalCount++;
					} else {
						// Break condition for the inner loop.
						if ((firstNum + thirdNum) >= divisor && (thirdNum + secondNum) >= divisor)
							break;
					}
					// Increment the third number by the divisor.
					thirdNum += divisor;
				}
			} else {
				// Break condition for the middle loop.
				if ((firstNum + secondNum) >= divisor)
					break;
			}
			// Increment the second number by the divisor.
			secondNum += divisor;
		}
	}
	// Output the final computed count.
	console.log(totalCount);
}
// Do not alter the following execution block.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));