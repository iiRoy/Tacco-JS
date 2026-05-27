function ProcessInput(rawText) {
	// This function processes the provided text input.
	// The first line of the input contains the shift value.
	// The second line contains the string to be encoded.

	let lines = rawText.split("\n"); // Divide the input into separate lines.

	const shiftAmount = parseInt(lines[0], 10); // Convert the first line to an integer for the shift.
	const sourceChars = lines[1].split(""); // Break the second line into an array of individual characters.

	// Define the standard English alphabet for lookup.
	const alphabetLookup = [
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
		'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
	];

	const charCount = sourceChars.length; // Get the total number of characters in the source string.
	const charIndices = []; // An array to store the numeric index (0-25) for each character.

	// Iterate through each character of the input string to find its alphabet index.
	for (let charIdx = 0; charIdx < charCount; charIdx++) {
		charIndices[charIdx] = 0; // Initialize the index for the current character.
		// Compare the current character with each letter in the alphabet.
		for (let alphaIdx = 0; alphaIdx < 26; alphaIdx++) {
			if (sourceChars[charIdx] === alphabetLookup[alphaIdx]) {
				charIndices[charIdx] = alphaIdx; // Store the 0-based index if a match is found.
				break; // Exit the inner loop once the character's index is determined.
			}
		}
	}

	// Calculate the effective shift value, using modulo 25 as per original logic.
	const effectiveShift = shiftAmount % 25;
	let finalOutput = ''; // Initialize an empty string to build the shifted result.

	// Apply the shift to each character's numeric index.
	for (let charIdx = 0; charIdx < charCount; charIdx++) {
		let shiftedIndex = charIndices[charIdx] + effectiveShift; // Add the effective shift.
		// Handle wrap-around for indices that exceed 'Z' (index 25).
		if (shiftedIndex > 25) {
			shiftedIndex = shiftedIndex % 26; // Use modulo 26 for alphabet wrap-around.
		}
		finalOutput += alphabetLookup[shiftedIndex]; // Append the character corresponding to the new index.
	}

	console.log(finalOutput); // Display the final transformed string.
}

// The following line handles reading input from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
