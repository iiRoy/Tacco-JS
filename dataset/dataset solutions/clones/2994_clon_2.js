function ExecuteGridTraversal(dataLines) {

    // Extracting initial configuration parameters from the input stream.
    let gridHeight = parseInt(dataLines.shift()); // Vertical dimension of the playing field.
    let gridWidth = parseInt(dataLines.shift());  // Horizontal dimension of the playing field.
    let stepCount = parseInt(dataLines.shift());  // Total number of game turns.
    let startRow = parseInt(dataLines.shift());   // Initial vertical coordinate of the player's position.
    let startCol = parseInt(dataLines.shift());    // Initial horizontal coordinate of the player's position.
    let playerMoves = dataLines.shift();          // Sequence of player's intended movements.
    let foeMoves = dataLines.shift();             // Sequence of opponent's blocking movements.

    // Initialize the boundaries of the player's possible location.
    // At the start, the player is at a single point (startRow, startCol).
    let minCol = startCol; // Leftmost possible column.
    let maxCol = startCol; // Rightmost possible column.
    let minRow = startRow; // Topmost possible row.
    let maxRow = startRow; // Bottommost possible row.

    // Iterate through each turn of the game.
    for ( let currentStep = 0; currentStep < stepCount; currentStep++ ) {

        let playerAction = playerMoves.charAt(currentStep); // Player's move for this turn.
        let foeAction = foeMoves.charAt(currentStep);       // Opponent's move for this turn.

        // Update player's potential boundaries based on their action.
        // Player's movement expands their possible area.
        if (playerAction == "L") {
            minCol--; // Player could move left.
        } else if (playerAction == "R") {
            maxCol++; // Player could move right.
        } else if (playerAction == "U") {
            minRow--; // Player could move up.
        } else { // PlayerAction == "D"
            maxRow++; // Player could move down.
        }

        // Check if the player's potential area has gone out of bounds.
        // If any boundary is beyond the grid limits, the player is trapped.
        if (minCol <= 0 || maxCol > gridWidth || minRow <= 0 || maxRow > gridHeight) {
            console.log("NO"); // Player cannot survive.
            return;            // Terminate execution.
        }

        // Adjust player's potential boundaries based on opponent's action.
        // Opponent's movement restricts the player's possible area.
        if (foeAction == "L") {
            // Opponent moves left, player can't be too far right.
            maxCol = Math.max(1, maxCol - 1);
        } else if (foeAction == "R") {
            // Opponent moves right, player can't be too far left.
            minCol = Math.min(gridWidth, minCol + 1);
        } else if (foeAction == "U") {
            // Opponent moves up, player can't be too far down.
            maxRow = Math.max(1, maxRow - 1);
        } else { // FoeAction == "D"
            // Opponent moves down, player can't be too far up.
            minRow = Math.min(gridHeight, minRow + 1);
        }
    }

    // If the loop completes, the player successfully navigated all turns.
    console.log("YES"); // Player survives.
}

// Read input from standard input, process it, and invoke the main logic.
ExecuteGridTraversal(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/[\n\s]+/));