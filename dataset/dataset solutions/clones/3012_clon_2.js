// This function handles the primary data processing flow.
function ProcessInputData(initialText) {
	// The raw input string is separated into individual lines for easier access.
	initialText = initialText.split(" \n ");

	// Extract numerical values from the initial lines of input.
	const firstLineNumbers = initialText[0].split(' ').map(val => parseInt(val, 10));
	const elementCount = firstLineNumbers[0];
	const numericSequence = initialText[1].split(' ').map(val => parseInt(val, 10));

	// Determine all divisors for the largest number in the sequence.
	const potentialDivisors = [];
	const largestElement = numericSequence[elementCount - 1];
	for (let divisorCandidate = 1; divisorCandidate <= largestElement; divisorCandidate++) {
		if (largestElement % divisorCandidate === 0) {
			potentialDivisors.push(divisorCandidate);
		}
	}

	// Arrange the obtained divisors in descending order.
	const sortedDivisorsDesc = potentialDivisors.reverse();

	for (let checkIndex = 0; checkIndex < sortedDivisorsDesc.length; checkIndex++) {
		let currentCandidateDivisor = sortedDivisorsDesc[checkIndex];
		let divisibleSubsequence = numericSequence.filter(itemValue => itemValue % currentCandidateDivisor === 0);

		if (divisibleSubsequence.length + 1 >= numericSequence.length) {
			console.log(currentCandidateDivisor);
			return;
		}
	}

	console.log(1);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));