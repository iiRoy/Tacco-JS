function Main(input) {
    const sourceLines = input.split('\n');
    const totalTurns = parseInt(sourceLines[0], 10);

    // Transform input lines into plate objects with relevant properties.
    // Using object literals for better readability and property access.
    const initialPlateData = sourceLines.slice(1).map(line => {
        const [valA, valB] = line.split(' ').map(Number);
        return { scoreA: valA, scoreB: valB, combinedScore: valA + valB };
    });

    // Sort plates primarily by their combined score in ascending order.
    // This initial sort establishes the base order for selection.
    const sortedPlateData = [...initialPlateData].sort((p1, p2) => p1.combinedScore - p2.combinedScore);

    // Simulate the game turns using a functional reducer pattern.
    // The accumulator maintains the current scores and the set of available plates.
    const gameOutcome = Array.from({ length: totalTurns }).reduce((accumulator, _, turnIndex) => {
        let { playerAScore, playerBScore, remainingPlates } = accumulator;

        // If no plates are left, return current state (should not happen if totalTurns matches plate count).
        if (remainingPlates.length === 0) {
            return { playerAScore, playerBScore, remainingPlates };
        }

        const isPlayerATurn = turnIndex % 2 === 0;

        // Identify the "tie-group" of plates. These are all plates that have the same
        // combinedScore as the first plate currently available.
        const currentReferencePlate = remainingPlates[0];
        const platesInCurrentTieGroup = remainingPlates.filter(p => p.combinedScore === currentReferencePlate.combinedScore);

        let selectedPlate;
        if (isPlayerATurn) {
            // Player A's turn: select the plate from the tie-group that maximizes Player A's score.
            selectedPlate = platesInCurrentTieGroup.reduce((bestOption, currentOption) =>
                (currentOption.scoreA > bestOption.scoreA ? currentOption : bestOption), platesInCurrentTieGroup[0]);
            playerAScore += selectedPlate.scoreA;
            console.log('a take %d', selectedPlate.scoreA);
        } else {
            // Player B's turn: select the plate from the tie-group that maximizes Player B's score.
            selectedPlate = platesInCurrentTieGroup.reduce((bestOption, currentOption) =>
                (currentOption.scoreB > bestOption.scoreB ? currentOption : bestOption), platesInCurrentTieGroup[0]);
            playerBScore += selectedPlate.scoreB;
            console.log('b take %d', selectedPlate.scoreB);
        }

        // Create a new array of remaining plates by removing the selected plate.
        // This ensures immutability for the functional approach.
        const indexOfSelected = remainingPlates.findIndex(p => p === selectedPlate);
        const updatedRemainingPlates = [
            ...remainingPlates.slice(0, indexOfSelected),
            ...remainingPlates.slice(indexOfSelected + 1)
        ];

        return { playerAScore, playerBScore, remainingPlates: updatedRemainingPlates };
    }, { playerAScore: 0, playerBScore: 0, remainingPlates: sortedPlateData });

    // Output the final difference in scores, as per the problem statement.
    console.log('%d', gameOutcome.playerAScore - gameOutcome.playerBScore);
}

// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
