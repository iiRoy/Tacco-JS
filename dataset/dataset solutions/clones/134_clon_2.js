/*
 * This script processes input data from standard input to determine specific outcomes based on a sequence of numerical values.
 * It simulates a process involving two 'lanes' or 'tracks' and updates their positions based on incoming 'shot' values.
 */

// Obtain all input lines from standard input, decode as UTF-8, remove leading/trailing whitespace, and split by newline characters.
var inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/);

// Determine the total number of scenarios to process from the input.
var totalScenarios = inputLines.length;

// Iterate through each scenario, starting from the second line (index 1), as the first line might contain metadata.
for ( var scenarioIndex = 1; scenarioIndex < totalScenarios; scenarioIndex++ )
{
	// For the current scenario, extract the 'shot' values, clean whitespace, and split them by spaces.
	var shotValues = inputLines[scenarioIndex].trim().split(/\s/);

	// Initialize the positions of the two 'lanes' to zero for the current scenario.
	var lanePositions = [0, 0];

	// Process each individual 'shot' value within the current scenario.
	for (var shotIndex = 0; shotIndex < shotValues.length; shotIndex++)
	{
		// Parse the current shot value as an integer (base 10).
		var currentShotValue = parseInt(shotValues[shotIndex], 10);

		// Calculate the difference between the current shot value and each of the lane positions.
		var laneDifferences = [
			(currentShotValue - lanePositions[0]),
			(currentShotValue - lanePositions[1])
		];

		// Check if both lane differences are negative, indicating an impossible state.
		if ((laneDifferences[0] < 0) && (laneDifferences[1] < 0))
		{
			// If so, print "NO" and immediately stop processing this scenario.
			console.log("NO");
			break;
		}

		// Determine which lane to update based on the differences.
		// If the first lane's difference is less than or equal to the second's, and positive, update the first lane.
		if ((laneDifferences[0] <= laneDifferences[1]) && (laneDifferences[0] > 0))
		{
			lanePositions[0] = currentShotValue; // Update the first lane's position.
		}
		else
		{
			lanePositions[1] = currentShotValue; // Otherwise, update the second lane's position.
		}

		// Special condition: if it's the tenth shot (index 9), print "YES".
		if (shotIndex == 9)
		{
			console.log("YES");
		}
	}
}