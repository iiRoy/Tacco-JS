function processString(inputStr) {
	// Determine the length of the input string
	var strLen = inputStr.length;
	// Initialize a variable for a potential final result (currently unused)
	var finalResult = 0;
	// Convert the input string into an array of characters for easier manipulation
	inputStr = inputStr.split("");
	// Initialize a counter for unique subsequences found
	var uniqueSubsequences = 0;

	// Iterate through numbers starting from 0 up to the maximum possible integer value
	// Each number's binary representation will form a pattern
	for (var iterIndex = 0; iterIndex < Number.MAX_VALUE; iterIndex++) {
		// Convert the current iteration index to its binary string representation,
		// split it into individual characters, reverse the order, and map each character to a number (0 or 1)
		var binaryPattern = iterIndex.toString(2).split("").reverse().map(Number);

		// If the binary pattern's length is less than (string length + 1), skip this iteration
		// This ensures we have enough bits to represent all possible subsequences
		if (binaryPattern.length < strLen + 1) {
			continue;
		}
		// If the binary pattern's length exceeds (string length + 1),
		// it means we've gone past all relevant patterns, so break the loop
		if (binaryPattern.length > strLen + 1) {
			break;
		}
		// Remove the last bit from the pattern; it's an extra bit from the (N+1) length check
		binaryPattern.pop();

		// Initialize an array to store the characters of the current subsequence
		var currentSubsequence = [];
		// Iterate through the generated binary pattern
		for (var patternIndex = 0; patternIndex < binaryPattern.length; patternIndex++) {
			// If the current bit in the pattern is 1, include the corresponding character from the input string
			if (binaryPattern[patternIndex] === 1) {
				currentSubsequence.push(inputStr[patternIndex]);
				// console.log(inputStr[patternIndex]); // Debugging line, kept commented
			}
		}
		
		// console.log(binaryPattern); // Debugging line, kept commented
		// console.log(currentSubsequence); // Debugging line, kept commented

		// If the current subsequence is empty, skip to the next iteration
		if (currentSubsequence.length === 0) {
			continue;
		}
		
		// Filter the subsequence to find characters that appear more than once
		var duplicateChars = currentSubsequence.filter(function (charItem, itemIndex, selfArray) {
            // A character is a duplicate if its first occurrence index is not the same as its last occurrence index
            return selfArray.indexOf(charItem) !== selfArray.lastIndexOf(charItem);
        });
		
		// If any duplicate characters are found in the subsequence, skip this iteration
		if (duplicateChars.length > 0) {
			continue;
		}
		
		// If the subsequence is non-empty and contains no duplicate characters, increment the counter
		uniqueSubsequences++;
	}
	// Return the total count of unique subsequences found
	return uniqueSubsequences;
}

// Main function to orchestrate the program execution
function executeProgram(programArgs) {
	// Split the input arguments by newline characters
	programArgs = programArgs.split("\n");
	// The first line of input (N) is stored, though not used in this specific logic
	var firstLineVal = programArgs[0];
	// The second line of input (S) is the string to be processed
	var secondLineStr = programArgs[1];

	// Call the processing function with the string and print its result to the console
	console.log(processString(secondLineStr));
}

// Read input from standard input and pass it to the main program execution function
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
