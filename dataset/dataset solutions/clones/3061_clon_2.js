function EntryProcessor(rawContent) {

	// Split the received string by newline characters
	const contentLines = rawContent.split('\n');

	// /* Original debug line: console.log(contentLines); */

	// Evaluate conditions based on specific line values
	if (contentLines[0] < contentLines[5] && contentLines[4] < contentLines[5]) {
		// If both conditions are met, indicate success
		console.log('Success!');
	} else {
		// Otherwise, indicate failure
		console.log('Failure.');
	}

} // End of EntryProcessor function definition

// Execute the primary process by reading from standard input
EntryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));