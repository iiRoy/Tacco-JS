function logToTerminal( messageText ) { console.log(messageText); } // This function is for outputting messages to the console.

function performCalculation( rawInputData ) {
	// Initial processing: Remove unnecessary whitespace from the input string.
	rawInputData = rawInputData.trim();
	
	// Convert the space-separated string of values into an array of numeric types.
	const numericComponents = rawInputData.split(" ").map( (strValue) => Number(strValue) );
	
	// Assign distinct names to the initial four numeric data points.
	const componentA = numericComponents[0];
	const componentB = numericComponents[1];
	const componentC = numericComponents[2];
	const targetValue = numericComponents[3];
	
	// Create a dynamic array to hold the size components for sorting/selection.
	let componentSizes = [componentA, componentB, componentC];
	
	// Determine the largest size among the initial components.
	const largestComponent = Math.max.apply(null, componentSizes);
	// Remove the largest component from the temporary array to find the next largest.
	componentSizes.splice(componentSizes.indexOf(largestComponent), 1);
	
	// Calculate the maximum possible iterations for the largest component within the target value.
	const maxCountLargest = Math.floor(targetValue / largestComponent);
	
	// Find the middle-sized component from the remaining two in the array.
	const middleComponent = Math.max.apply(null, componentSizes);
	// Find the smallest-sized component from the remaining (now single) item in the array.
	const smallestComponent = Math.min.apply(null, componentSizes);
	
	let validCombinations = 0; // Counter for successful combinations that meet the target.
	
	// Begin the primary loop, iterating through possible counts of the largest component.
	for (let countA = 0; countA <= maxCountLargest; countA++) {
		// Calculate the amount remaining after allocating 'countA' of the largest component.
		let remainingAfterA = targetValue - (countA * largestComponent); // This is the budget for the other two.
		
		// Calculate the maximum possible count for the middle component based on the remaining budget.
		const maxCountMiddle = Math.floor(remainingAfterA / middleComponent);
		
		// This conditional block is retained for structural equivalence, even if it's a dormant debug path.
		if (countA === 227) {
		  // console.log("A specific iteration value for debugging:", remainingAfterA); // Original debug comment changed.
		}
		
		// Enter the secondary loop, iterating through possible counts of the middle component.
		for (let countB = 0; countB <= maxCountMiddle; countB++) {
			// Calculate the final remaining amount after allocating 'countA' and 'countB'.
			const remainingAfterB = remainingAfterA - (countB * middleComponent);
			
			// Check if the final remaining amount can be perfectly formed by the smallest component.
			if (remainingAfterB % smallestComponent === 0) {
				validCombinations++; // If so, increment the total count of valid combinations.
			}
		}
	}
	// Display the final tally of all valid ways to combine the components.
	console.log(validCombinations);
}

// Execution entry point: Read input from standard I/O and pass it to the main processing function.
performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));