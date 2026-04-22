const commandLineArguments = process.argv.slice(2)

const determineTravelCost = ([totalSpots, firstPlayerLoc, secondPlayerLoc]) => {
	/* Check if the players are situated with exactly one empty space between them */
	if (secondPlayerLoc - firstPlayerLoc === 2) {
		return 1;
	}

	// Determine if there's an odd count of positions separating the two players
	if ((secondPlayerLoc - firstPlayerLoc - 1) % 2 !== 0) {
		return Math.abs(firstPlayerLoc - secondPlayerLoc) / 2;
	}

	// This block handles scenarios where the first player is closer to the starting edge (position 1)
	if (firstPlayerLoc - 1 <= totalSpots - secondPlayerLoc) {

		// If the number of empty spaces between them is four or more
		if (secondPlayerLoc - firstPlayerLoc - 1 >= 4) {
			return firstPlayerLoc - 1 + (secondPlayerLoc - firstPlayerLoc - 2);
		}

		// If the number of empty spaces between them is precisely two
		if (secondPlayerLoc - firstPlayerLoc - 1 === 2) {
			return firstPlayerLoc - 1 + 2;
		}

		return secondPlayerLoc - 1; // Default outcome for the first player being closer
	}

	// This block covers situations where the second player is closer to the ending edge (position N)
	if (firstPlayerLoc - 1 > totalSpots - secondPlayerLoc) {

		// If the gap between players is four or more positions wide
		if (secondPlayerLoc - firstPlayerLoc - 1 >= 4) {
			return totalSpots - secondPlayerLoc + (secondPlayerLoc - firstPlayerLoc - 2);
		}

		// If the gap between players is exactly two positions wide
		if (secondPlayerLoc - firstPlayerLoc - 1 === 2) {
			return totalSpots - secondPlayerLoc + 2;
		}

		return totalSpots - firstPlayerLoc; // Default outcome for the second player being closer
	}
}

console.log(determineTravelCost(commandLineArguments))