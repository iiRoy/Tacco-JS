// This script processes game input
function GameProcessor(rawInputData)
{
	  // Divide the complete input string into individual lines
	var lineFragments = rawInputData.split('\n');
	var outcomeIdentifier;

	var charSequence = lineFragments[0].split(''); // Extract the initial character sequence
	var currentParticipant = 'ParticipantAlpha';   // Designate the starting player

	// Function to remove a character from the sequence at specified positions
	function performRemoval(targetPositions) {
		charSequence.splice(targetPositions[1], 1);
		console.log(charSequence); // Display the updated sequence for debugging
	}

	// Determine if a removal operation is permissible based on character values
	function checkRemovalValidity(candidateIndexes) {
		return !(charSequence[candidateIndexes[0]] === charSequence[candidateIndexes[2]]);
	}

	// Executes a single player's move within the game
	function executePlayerMove(workingSequence) {
		var sequenceGroup;

		for (var loopIndex = 0; loopIndex < (workingSequence.length - 2); loopIndex = loopIndex + 1) {
			sequenceGroup = [loopIndex, loopIndex + 1, loopIndex + 2]; // Define a triplet of indices

			console.log(sequenceGroup); // Log the current index triplet being considered
			if (checkRemovalValidity(sequenceGroup)) {
				performRemoval(sequenceGroup);
				return true; // A successful move was made
			}


			continue; // Move to the next triplet if no valid move was found here
		}
		return false; // No valid move could be executed in this turn
	}

	// Manages the flow of game rounds until a terminal state is reached
	function orchestrateGameRounds() {
		while (true) {
			if (executePlayerMove(charSequence) === false) {
				return; // Game ends if no more moves are possible
			}

			// Switch active participant for the next round
			if (currentParticipant === 'ParticipantAlpha') {
				currentParticipant = 'ParticipantBeta';
			}
			else {
				currentParticipant = 'ParticipantAlpha';
			}
		}
	}

	orchestrateGameRounds(); // Begin the sequence of game turns

	// Determine the winner based on whose turn it is when the game ends
	if (currentParticipant === 'ParticipantAlpha') {
		outcomeIdentifier = 'ParticipantBeta';
	} else
	{
		outcomeIdentifier = 'ParticipantAlpha';
	}

	// Output the final result to the console
	console.log(outcomeIdentifier);
}
// Do not modify the following section (handles standard input/output and calls GameProcessor)
GameProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));