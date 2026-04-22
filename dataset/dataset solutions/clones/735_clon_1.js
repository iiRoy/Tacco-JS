function bomb ( ab , x , y , z ) {
	/*
	 * This function calculates the maximum number of consecutive balls
	 * of player 'ab' starting from position (x, y, z) in any 3D direction.
	 * It's used to check for winning conditions in a 3D Connect-N game.
	 */

	var dx = [ -1, 0, 1, -1, 1, -1, 0, 1 ] ; // X-offsets for the initial 8 directions (2D plane)
	var dy = [ -1, -1, -1, 0, 0, 1, 1, 1 ] ; // Y-offsets for the initial 8 directions (2D plane)
	var dz = [ 0, 0, 0, 0, 0, 0, 0, 0 ] ; // Z-offsets for the initial 8 directions (2D plane)

	// Extend direction vectors to cover more 3D directions.
	// These concatenations create a comprehensive set of 26 possible 3D directions
	// from a central point, plus the 3 axis-aligned directions.

	dy = dy . concat ( [ -1, 0, 1, -1, 1, -1, 0, 1 ] ) ; // Add more Y-offsets for a different Z-level.
	dz = dz . concat ( [ -1, -1, -1, 0, 0, 1, 1, 1 ] ) ; // Add more Z-offsets for a different Z-level.

	dx = dx . concat ( [ 0, 0, 0, 0, 0, 0, 0, 0 ] ) ; // Add more X-offsets (for straight Z-axis movement).

	dz = dz . concat ( [ -1, 0, 1, -1, 1, -1, 0, 1 ] ) ; // Yet more Z-offsets for another plane.
	dx = dx . concat ( [ -1, -1, -1, 0, 0, 1, 1, 1 ] ) ; // Yet more X-offsets for another plane.
	dy = dy . concat ( [ 0, 0, 0, 0, 0, 0, 0, 0 ] ) ; // Yet more Y-offsets (for straight Y-axis movement).

	var max = 0 ; // This variable will store the maximum consecutive count found.

	// Iterate through each of the generated 3D direction vectors.
	for ( var i = 0 ; i < dx . length ; i ++ ) {

		var X = x ; // Initialize current X-coordinate with the starting X.
		var Y = y ; // Initialize current Y-coordinate with the starting Y.
		var Z = z ; // Initialize current Z-coordinate with the starting Z.

		// First, move backward along the current direction until an empty cell
		// or an out-of-bounds position is reached. This ensures we start counting
		// from the true beginning of a potential line.
		while ( true ) {
			X -= dx [ i ] ; // Decrement X by the direction's X-component.
			Y -= dy [ i ] ; // Decrement Y by the direction's Y-component.
			Z -= dz [ i ] ; // Decrement Z by the direction's Z-component.

			// Check for boundary conditions. 'n' is assumed to be the grid size.
			if ( X < 0 || Y < 0 || Z < 0 ) break ; // Out of lower bounds.
			if ( X >= n || Y >= n || Z >= n ) break ; // Out of upper bounds.
		}

		var cnt = 0 ; // Counter for consecutive balls of the current player.

		// Now, move forward along the direction, counting consecutive player balls.
		while ( true ) {
			X += dx [ i ] ; // Increment X by the direction's X-component.
			Y += dy [ i ] ; // Increment Y by the direction's Y-component.
			Z += dz [ i ] ; // Increment Z by the direction's Z-component.

			// Check for boundary conditions.
			if ( X < 0 || Y < 0 || Z < 0 ) break ; // Out of lower bounds.
			if ( X >= n || Y >= n || Z >= n ) break ; // Out of upper bounds.

			// Check if the cell at (X, Y, Z) contains the current player's ball.
			if ( ball [ X ] [ Y ] [ Z ] == ab ) {
				cnt ++ ; // If it's the player's ball, increment the count.
			} else {
				cnt = 0 ; // If not, reset the count (line is broken).
			}

			// Update the overall maximum consecutive count found.
			max = Math . max ( max , cnt ) ;
		}
	}
	return max ; // Return the highest count of consecutive balls found.
}

/*
 * This is the main part of the program, handling game setup,
 * move processing, and win/draw condition checks.
 * It reads game parameters and moves from standard input.
 */

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read all input from stdin.
var arr = input . trim ( ) . split ( "\n" ) ; // Split input into an array of lines, removing leading/trailing whitespace.

while ( true ) { // Loop to process multiple game scenarios.

	var nmp = arr . shift ( ) ; // Get the first line, which contains N, M, P.

	if ( nmp == "0 0 0" ) {
		break ; // If "0 0 0" is encountered, it signifies the end of input.
	}

	nmp = nmp . split ( " " ) . map ( Number ) ; // Parse N, M, P values into numbers.

	var n = nmp [ 0 ] ; // Grid dimension N (N x N x P grid).
	var m = nmp [ 1 ] ; // Winning condition: M consecutive balls.
	var p = nmp [ 2 ] ; // Total number of moves in this game.

	var ball = [ ] ; // Declare the 3D array representing the game board.

	// Initialize the 3D game board with all cells set to 0 (empty).
	for ( var i = 0 ; i < n ; i ++ ) {
		ball [ i ] = [ ] ; // Initialize the second dimension.
		for ( var j = 0 ; j < n ; j ++ ) {
			ball [ i ] [ j ] = [ ] ; // Initialize the third dimension.
			for ( var k = 0 ; k < p ; k ++ ) {
				ball [ i ] [ j ] [ k ] = 0 ; // Set each cell to empty.
			}
		}
	}

	var ab = 1 ; // Current player ID (1 for player 1, 2 for player 2).
	var draw = true ; // Flag to track if the game ends in a draw.

	// Process each of the 'p' moves.
	for ( var i = 0 ; i < p ; i ++ ) {
		var xy = arr . shift ( ) . split ( " " ) . map ( Number ) ; // Read the (x, y) coordinates for the current move.

		var x = xy [ 0 ] - 1 ; // Convert 1-indexed x to 0-indexed.
		var y = xy [ 1 ] - 1 ; // Convert 1-indexed y to 0-indexed.

		var cnt = 0 ; // Counter to find the next available Z-level in the stack.

		// Find the lowest available Z-level (height) at the given (x, y) column.
		while ( true ) {
			if ( ball [ x ] [ y ] [ cnt ] !== 0 ) {
				cnt ++ ; // If the current Z-level is occupied, move up.
			} else {
				break ; // Found an empty slot.
			}
		}

		ball [ x ] [ y ] [ cnt ] = ab ; // Place the current player's ball at (x, y, cnt).

		// Check if the current move results in a winning line for the current player.
		if ( bomb ( ab , x , y , cnt ) >= m ) {
			// If a win is detected, print the winner and the move number.
			console . log ( ( ab == 2 ) ? "White" : "Black" , i + 1 ) ;
			draw = false ; // Set draw flag to false as there's a winner.
			break ; // End the current game simulation.
		}

		ab = 2 / ab ; // Switch player: if ab was 1, it becomes 2; if ab was 2, it becomes 1.
	}

	// After all moves are processed or a winner is found, check if it's a draw.
	if ( draw ) {
		console . log ( "Draw" ) ; // If no winner was found, it's a draw.
	}
}