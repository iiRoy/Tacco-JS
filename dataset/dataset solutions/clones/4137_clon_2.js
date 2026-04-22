// This function handles the primary processing of incoming data.
function ProcessInputData(dataStream)
{
	// Divide the entire data block into individual lines.
	var textLines = dataStream.split("\n");

	// Extract numerical segments from the very first line.
	var segmentParts = textLines[0].split(" ");

	// Assign the first segment as the lower bound.
	var minimumValue = segmentParts[0];

	// Assign the second segment as the upper bound.
	var maximumValue = segmentParts[1];

	// Initialize a counter for the operations performed.
	var computationResult = 0;

	// Check if both number strings are relatively short (fit into standard JS numbers).
	if (minimumValue.length <= 14 && maximumValue.length <= 14)
	{
		// Convert string representations to actual numerical types.
		minimumValue = Number(minimumValue);
		maximumValue = Number(maximumValue);

		// Loop as long as the current minimum value does not exceed the maximum.
		while (minimumValue <= maximumValue)
		{
			// Double the current minimum value.
			minimumValue = minimumValue * 2;
			// Increment the operation counter.
			computationResult++;
		}
	}
	else // Handle very large numbers that might exceed standard number precision.
	{
		// Prepend zeros to ensure a consistent length for string manipulation.
		minimumValue = "0000000000" + minimumValue;
		maximumValue = "0000000000" + maximumValue;

		// Extract the higher-order part of the minimum value.
		var minTopSegment = minimumValue.slice(0, -10);
		// Extract the lower-order part of the minimum value.
		var minBottomSegment = minimumValue.slice(-10);

		// Extract the higher-order part of the maximum value.
		var maxTopSegment = maximumValue.slice(0, -10);
		// Extract the lower-order part of the maximum value.
		var maxBottomSegment = maximumValue.slice(-10);

		// Store large numbers as an array of two numbers [top_part, bottom_part].
		minimumValue = [Number(minTopSegment), Number(minBottomSegment)];
		maximumValue = [Number(maxTopSegment), Number(maxBottomSegment)];

		// Define a comparison utility function for these two-part numbers.
		var checkRange = function (currentMin, currentMax)
		{
			// If the top parts are different, the comparison is straightforward.
			if (currentMin[0] < currentMax[0])
			{
				return true;
			}
			// If top parts are identical, compare the bottom parts.
			else if (currentMin[0] === currentMax[0] && currentMin[1] <= currentMax[1])
			{
				return true;
			}
			// Otherwise, the minimum has exceeded the maximum.
			else
			{
				return false;
			}
		};

		// Continue doubling the minimum value until it goes beyond the maximum.
		while (checkRange(minimumValue, maximumValue))
		{
			// Double the lower part and convert to string to check for overflow.
			var doubledBottomString = (minimumValue[1] * 2).toString();

			// If doubling the bottom part caused a carry-over (length becomes 11 means it went from 10 digits to 11).
			if (doubledBottomString.length === 11)
			{
				// Double the top part and add 1 for the carry. Update bottom part.
				minimumValue = [minimumValue[0] * 2 + 1, Number(doubledBottomString.slice(-10))];
			}
			else // No carry-over from the bottom part.
			{
				// Simply double the top part and update the bottom part.
				minimumValue = [minimumValue[0] * 2, Number(doubledBottomString)];
			}
			// Increment the total count of operations.
			computationResult++;
		}
	}
	// Output the final tally of operations.
	console.log(computationResult);
}

// Do not alter any code below this line (standard input/output setup).
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );