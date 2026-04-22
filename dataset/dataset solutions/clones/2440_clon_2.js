/*
 * Entry point for processing input data.
 * This function implements a dynamic programming solution.
 */
function ProcessData( rawData ) {
	// Clean and parse the initial input string into an array of string arrays.
	rawData = rawData
		.trim()
		.split("\n")
		.map(
			function( lineStr ) {
				return lineStr.split(" ");
			}
		);

	// Extract the total number of items and the maximum allowed time (or capacity).
	const itemCount = parseInt( rawData[0][0], 10 );
	const timeLimit = parseInt( rawData[0][1], 10 );

	// Prepare an array to hold item details (weight/time, value).
	let itemsData = [];
	for (let idxA = 0; idxA < itemCount; idxA++) {
		itemsData.push(
			rawData[idxA + 1].map( elementVal => parseInt(elementVal, 10) )
		);
	}

	// Sort the items based on their second property (value or time, depending on problem context).
	itemsData.sort( (itemX, itemY) => itemX[1] - itemY[1] );

	// Initialize the dynamic programming table.
	// Each row represents an item, each column represents a time/weight capacity.
	let memoTable = [];
	let currentWeight, currentValue;

	// The first row of the DP table, representing the base case (no items selected).
	memoTable.push( Array.from({ length: timeLimit + 1 }, () => 0) );

	// Populate the DP table using a bottom-up approach.
	// Iterate through each item, except the very last one.
	for ( let idxA = 0; idxA < itemCount - 1; idxA++ ) {
		memoTable.push( [] ); // Add a new row for the current item.
		currentWeight = itemsData[idxA][0]; // The 'weight' or 'time' for the current item.
		currentValue = itemsData[idxA][1];  // The 'value' for the current item.

		// Iterate through all possible capacities from 0 up to timeLimit.
		for ( let idxB = 0; idxB < timeLimit + 1; idxB++ ) {
			// If the current item's weight/time can be accommodated by the current capacity.
			if ( currentWeight <= idxB ) {
				// We have two choices:
				// 1. Exclude the current item: memoTable[idxA][idxB]
				// 2. Include the current item: memoTable[idxA][idxB - currentWeight] + currentValue
				// We take the maximum of these two options.
				memoTable[idxA + 1][idxB] = Math.max( memoTable[idxA][idxB], memoTable[idxA][idxB - currentWeight] + currentValue );
			}
			else {
				// If the current item's weight/time exceeds the current capacity,
				// we cannot include it. So, the value is the same as without this item.
				memoTable[idxA + 1][idxB] = memoTable[idxA][idxB];
			}
		}
	}

	// Calculate the final result considering the last item separately.
	// This appears to be a specific problem constraint or optimization for the last item.
	let finalResult;
	finalResult = memoTable[itemCount - 1][timeLimit - 1] + itemsData[itemCount - 1][1];

	// Output the maximum possible value.
	// Compare the value from the full DP table (up to timeLimit) with the special handling of the last item.
	console.log( Math.max( memoTable[itemCount - 1][timeLimit], finalResult ) );
}

// Read input from standard input and pass it to the processing function.
ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") );