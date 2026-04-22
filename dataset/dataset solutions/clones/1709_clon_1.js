/*
 * This is a utility function to convert a value to an integer.
 * It uses parseInt with a radix of 10 for reliable conversion.
 */
var toInt = x => parseInt(x, 10);

// This function maps an array of values, converting each element to an integer.
var toIntArr = arr => arr.map(x => toInt(x));

/*
 * A simple absolute value function.
 * Returns the number itself if positive, otherwise its negation.
 */
var abs = x => x > 0 ? x : -x;

/**
 * Calculates the minimum value among the provided arguments.
 * This function accepts a variable number of arguments.
 */
function min() {
	var rest = arguments, // Store all arguments in 'rest'
		val = rest[0]; // Initialize 'val' with the first argument

	// Iterate through the remaining arguments starting from the second one
	for (var i = 1; i < rest.length; i++) {
		// If the current argument is less than the current minimum 'val'
		if (rest[i] < val) {
			val = rest[i]; // Update 'val' to the new minimum
		}
	}

	return val; // Return the smallest value found
}


/**
 * Calculates the maximum value among the provided arguments.
 * This function accepts a variable number of arguments.
 */
function max() {
	var rest = arguments, // Capture all arguments passed to the function
		val = rest[0]; // Assume the first argument is the maximum initially

	// Loop through the arguments starting from the second one
	for (var i = 1; i < rest.length; i++) {
		// Check if the current argument is greater than the current maximum 'val'
		if (rest[i] > val) {
			val = rest[i]; // If so, update 'val' to this new maximum
		}
	}

	return val; // Return the largest value found
}


// The main entry point of the program.
// Reads input from standard input, then processes it.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * The primary function that handles the logic of the problem.
 * It takes the raw input string, parses it, and computes the solution.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function Main(input) {
	// Split the input string by newlines to get an array of lines.
	var input = input.split('\n');

	// Process each line: split by spaces and convert elements to integers.
	input = input.map(e => toIntArr(e.split(' ')));

	// Extract the number of days 'd' from the first line.
	var d = input[0][0];

	// Extract costs 'cs' from the second line.
	var cs = input[1];

	// Extract satisfaction scores 'ss' for each day and type.
	var ss = input.slice(2);

	// Original comment: //var ts = input.slice(d+2).map(e=>e[0]);
	// This line was commented out in the original code, so it remains commented.

	// Initialize the total score.
	var score = 0;

	// Array to store the chosen types for each day.
	var ans = [];

	// Placeholder for the type chosen on a specific day (not directly used here, but good for context).
	let type;

	// Array to keep track of the last day each type was chosen.
	var lastday = [];

	// Set the length of the lastday array to 26 (for types 1-26).
	lastday.length = 26;

	// Initialize all entries in lastday to -1, indicating no type has been chosen yet.
	lastday.fill(-1);

	// Original comment: //let scoreDay = [];
	// Another commented-out placeholder, remains commented.


	/**
	 * Calculates the change in satisfaction score for choosing a specific type on a given day.
	 *
	 * @param {number} day     - The current day (0-indexed).
	 * @param {number} type    - The type being chosen (1-indexed).
	 * @param {Array<number>} lastday - An array tracking the last day each type was chosen.
	 * @returns {number} The calculated score change for this day.
	 */
	function getScore(day, type, lastday) {
		let ans = 0; // Initialize score for this specific calculation

		// Add the satisfaction score for choosing 'type' on 'day'.
		ans += ss[day][type - 1];

		// Subtract the penalty for not choosing other types.
		for (let t = 0; t < 26; t++) {
			// If the current type 't' is not the one chosen ('type-1')
			if (t !== type - 1) {
				// Subtract the cost multiplied by the days since it was last chosen.
				ans -= cs[t] * (day - lastday[t]);
			}
		}

		return ans; // Return the total score for this day's choice
	}


	// Calculate the number of full blocks of 3 days.
	let d3 = Math.floor(d / 3);

	// Calculate the remaining days after processing full 3-day blocks.
	let rest = d - d3 * 3;


	// Variable to store temporary scores for a block of days.
	var tempScore; // Format: [[t0, t1, t2, score], ...]

	// Temporary array to hold 'lastday' state for hypothetical choices.
	var tempLastday;

	// Variable to accumulate sub-scores within a block.
	let subScore;


	// Loop through blocks of 3 days.
	for (let i = 0; i < d3; i++) {
		// Reset temporary scores for each new 3-day block.
		tempScore = [];

		// Try all possible types for the first day of the block (day i*3).
		for (let t0 = 0; t0 < 26; t0++) {
			// Create a copy of 'lastday' to avoid modifying the original during hypotheticals.
			tempLastday = lastday.concat();

			// Reset sub-score for this combination.
			subScore = 0;

			// Update lastday for type t0 on day i*3.
			tempLastday[t0] = i * 3;

			// Add score for choosing type t0+1 on day i*3.
			subScore += getScore(i * 3, t0 + 1, tempLastday);

			// Try all possible types for the second day of the block (day i*3 + 1).
			for (let t1 = 0; t1 < 26; t1++) {
				// Update lastday for type t1 on day i*3 + 1.
				tempLastday[t1] = i * 3 + 1;

				// Add score for choosing type t1+1 on day i*3 + 1.
				subScore += getScore(i * 3 + 1, t1 + 1, tempLastday);

				// Try all possible types for the third day of the block (day i*3 + 2).
				for (let t2 = 0; t2 < 26; t2++) {
					// Update lastday for type t2 on day i*3 + 2.
					tempLastday[t2] = i * 3 + 2;

					// Add score for choosing type t2+1 on day i*3 + 2.
					subScore += getScore(i * 3 + 2, t2 + 1, tempLastday);

					// Store the combination of types and their accumulated score.
					tempScore.push([t0, t1, t2, subScore]);
				}
			}
		}

		// Original comment: //console.log(tempScore)
		// This line was commented out in the original.

		// Find the index of the maximum score among all combinations in tempScore.
		let want = tempScore.map(e => e[3]).indexOf(Math.max(...tempScore.map(e => e[3])));

		// Retrieve the combination (t0, t1, t2, score) that yielded the maximum score.
		let want2 = tempScore[want];

		// Original comment: //console.log(want,want2)
		// This line was commented out in the original.

		// Add the chosen types (1-indexed) to the final answer array.
		ans.push(want2[0] + 1, want2[1] + 1, want2[2] + 1);

		// Update the global 'lastday' array with the chosen types for this 3-day block.
		lastday[want2[0]] = i * 3;
		lastday[want2[1]] = i * 3 + 1;
		lastday[want2[2]] = i * 3 + 2;
	}


	// Process the remaining days (less than a full 3-day block).
	for (let i = d3 * 3; i < d; i++) {
		// Reset temporary scores for each single day.
		tempScore = [];

		// For each possible type (0 to 25)
		for (let j = 0; j < 26; j++) {
			// Calculate the score if type j+1 is chosen on day i.
			tempScore[j] = getScore(i, j + 1, lastday);
		}

		// Find the index of the type that yields the maximum score for this day.
		let want = tempScore.indexOf(Math.max(...tempScore));

		// Add the chosen type (1-indexed) to the final answer array.
		ans.push(want + 1);

		// Update the global 'lastday' array for the chosen type on this day.
		lastday[want] = i;
	}

	// Output the final answer, with each chosen type on a new line.
	console.log(ans.join('\n'));
}


// Original comment: //a.indexOf(Math.max(...a))
// This comment remains as-is from the original code.