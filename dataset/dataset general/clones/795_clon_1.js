goog.provide ( 'tetris.Board' ) ;


tetris.Board.WIDTH = 10 ; /* Define the width of the game board in blocks */
tetris.Board.HEIGHT = 22 ; // This represents the total height of the board, including the hidden rows at the top.

tetris.Board.isBlocked = function ( x , y ) {
	// Function to check if a specific block coordinate (x, y) is occupied or out of bounds.
	if ( x < 0 || x >= tetris.Board.WIDTH || y < 0 || y >= tetris.Board.HEIGHT || tetris.blocks[ y * tetris.Board.WIDTH + x ].isBlocked ) {
		return true ; // The block is either out of bounds or already occupied by a fallen piece.
	}
	else {
		return false ; // The block is within bounds and currently empty.
	} ;
} ;


tetris.Board.checkMove = function ( tetromino ) {

	var pos , i , isValid , x , y ; // Declare local variables for position, loop counter, validity flag, and coordinates.

	for ( i = 0 ; i < 4 ; i ++ ) {
		// Iterate through each of the 4 blocks that make up the current tetromino piece.
		pos = tetris.Piece.PATTERNS[ tetromino.pattern ][ tetromino.rotation ][ i ] ;
		x = pos[ 0 ] / 20 + tetromino.x / 20 ; // Calculate the absolute x-coordinate on the board grid.
		y = pos[ 1 ] / 20 + tetromino.y / 20 ; // Calculate the absolute y-coordinate on the board grid.
		if ( tetris.Board.isBlocked ( x , y ) ) {
			return 0 ; // If any part of the tetromino would be blocked, the move is invalid.
		} ;
	} ;
	return 1 ; // All blocks are clear, so the move is valid.
} ;


/*
 * This function handles the clearing of filled rows and updates game state.
 * It iterates from the bottom up, checking for complete rows.
 */
tetris.Board.clearFilledRows = function ( ctx , buffer , buffer_ctx , tetromino ) {
	var row , col , row2 , nextLevel ;
	nextLevel = 1 ;
	var fillRows = 0 ; // Counter for how many rows are filled in this operation.
	for ( row = 22 ; row >= 0 ; ) {
		for ( col = 0 ; col < 10 ; ++ col ) {
			if ( ! ( tetris.blocks[ row * tetris.Board.WIDTH + col ].isBlocked ) ) {
				break ; // If any block in the row is not blocked, the row is not full.
			} ;
		} ;
		if ( col == 10 ) {
			// A full row has been found!
			tetris.Score.score += tetris.Level.level * [ 40 , 100 , 300 , 1200 ][ fillRows ] ;
			fillRows ++ ;
			for ( row2 = row - 1 ; row2 >= 0 ; row2 -- ) {
				for ( col = 0 ; col < 10 ; ++ col ) {
					// Shift all blocks above the cleared row down by one.
					tetris.blocks[ ( row2 + 1 ) * tetris.Board.WIDTH + col ].isBlocked = tetris.blocks[ row2 * tetris.Board.WIDTH + col ].isBlocked ;
					tetris.blocks[ ( row2 + 1 ) * tetris.Board.WIDTH + col ].color = tetris.blocks[ row2 * tetris.Board.WIDTH + col ].color ;
				} ;
			} ;
			// After shifting, the very top row needs to be cleared.
			for ( col = 0 ; col <= tetris.Board.WIDTH ; col ++ ) {
				tetris.blocks[ col ].isBlocked = false ;
			} ;

			tetris.Piece.redraw ( ctx , buffer , buffer_ctx ) ; // Redraw the entire board after clearing and shifting.
			tetris.Board.updateScore ( ) ; // Update the displayed score.
		}
		else {
			row -- ; // Move to the next row up to check.
		} ;
	} ;
	tetris.rowsCleared.num = tetris.rowsCleared.num + fillRows ;
	nextLevel = 1 + Math.floor ( tetris.rowsCleared.num / 4 ) ; // Level increases every 4 rows cleared.
	tetris.Level.level = nextLevel ;
	tetris.Board.updateLevel ( ) ; // Update the displayed level.
	tetris.Board.updateSpeed ( ) ; // Adjust game speed based on the new level.
} ;


tetris.Board.showNextPiece = function ( ) {
	var x , y ;
	var pos , i ;
	var aryColor = [ ] ; // Array to hold color information, though not directly used in the final version here.
	preview_ctx.clearRect ( 0 , 0 , 80 , 80 ) ; // Clear the preview canvas.

	tetris.Piece.startTetromino ( nextTetromino ) ; // Initialize the next tetromino for display.
	x = nextTetromino.x ; // Store current x position.
	y = nextTetromino.y ; // Store current y position.
	nextTetromino.x = 0 ; // Temporarily move to (0,0) for preview.
	nextTetromino.y = 0 ; // Temporarily move to (0,0) for preview.
	preview_ctx.fillStyle = "black" ; // Set fill style for drawing.
	for ( i = 0 ; i < 4 ; i ++ ) {
		pos = tetris.Piece.PATTERNS[ nextTetromino.pattern ][ nextTetromino.rotation ][ i ] ;
		preview_ctx.fillRect ( pos[ 0 ] + nextTetromino.x , pos[ 1 ] + nextTetromino.y , 20 , 20 ) ; // Draw a black background block.
		// Draw the actual block image using the appropriate color from the spritesheet.
		preview_ctx.drawImage ( blockImg , tetris.Piece.COLORS[ nextTetromino.pattern ][ 0 ] , tetris.Piece.COLORS[ nextTetromino.pattern ][ 1 ] , 20 , 20 , pos[ 0 ] + nextTetromino.x , pos[ 1 ] + nextTetromino.y , 20 , 20 ) ;
	} ;
	nextTetromino.x = x ; // Restore original x position.
	nextTetromino.y = y ; // Restore original y position.
} ;


tetris.Board.isEnd = function ( ) {
	var col ;
	for ( col = 0 ; col < 10 && tetris.isEnd.end == false ; col ++ ) {
		if ( tetris.Board.isBlocked ( col , 0 ) ) {
			// If any block in the top-most row (y=0) is blocked, the game is over.
			clearInterval ( tetris.intervalInt.i ) ; // Stop the game interval.
			tetris.Score.allScores.push ( tetris.Score.score ) ; // Add current score to historical scores.
			tetris.localStorage.store ( ) ; // Save scores to local storage.
			tetris.localStorage.list ( ) ; // Display updated score list.

			gameOver.innerHTML = "Game Over" ; // Display "Game Over" message.
			document.onkeydown = function ( event ) {
				var keyCode ;

				if ( event == null ) {
					keyCode = window.event.keyCode ;
				}
				else {
					keyCode = event.keyCode ;
				} ;
				if ( keyCode == 82 ) {
					tetris.restartgame ( ) ; // Allow restarting the game by pressing 'R'.
				} ;
			} ;
			tetris.isEnd.end = true ; // Set game end flag.
		} ;
	} ;
} ;


tetris.Board.updateScore = function ( ) {
	gameScore.innerHTML = tetris.Score.score ; // Update the score display in the HTML.
} ;


tetris.Board.updateLevel = function ( ) {
	gameLevel.innerHTML = tetris.Level.level ; // Update the level display in the HTML.
} ;


tetris.Board.updateSpeed = function ( ) {
	var speedup = 100 ;
	var temp = 0 ; // Temporary variable, currently unused.
	if ( tetris.Level.level >= 5 ) {
		speedup = 10 ; // Speed up factor changes after level 5.
		tetris.gameSpeed.num = 200 - ( tetris.Level.level - 4 ) * speedup ;
	}
	else {
		tetris.gameSpeed.num = 800 - ( tetris.Level.level - 1 ) * speedup ;
	} ;
	gameSpeed.innerHTML = tetris.gameSpeed.num ; // Display the current game speed.
	clearInterval ( tetris.intervalInt.i ) ; // Clear the existing game interval.
	// Set a new interval with the updated speed.
	tetris.intervalInt.i = setInterval ( "tetris.Piece.move(ctx, buffer, buffer_ctx, tetromino)" , tetris.gameSpeed.num ) ;
} ;


tetris.Board.sleep = function ( ms ) {
	var dt = new Date ( ) ;
	dt.setTime ( dt.getTime ( ) + ms ) ;
	while ( new Date ( ) .getTime ( ) < dt.getTime ( ) ) {
		tetris.Board.key ( ) ;
	} ; // Busy-wait loop, calling key handler. Not recommended for production.
} ;


tetris.Board.key = function ( ) {
	// This function sets up the global keydown event listener for game controls.
	document.onkeydown = function ( event ) {
		var keyCode ;

		if ( event == null ) {
			keyCode = window.event.keyCode ; // IE compatibility for event object.
		}
		else {
			keyCode = event.keyCode ; // Standard way to get key code.
		} ;
		// console.log(keyCode); // Debugging line for key codes.
		switch ( keyCode ) {
			// Left arrow key
			case 37 :
				if ( ! tetris.cannotMove.bool )
					tetris.Piece.changMove ( ctx , buffer , buffer_ctx , tetromino , - 20 , 0 ) ; // Move left.
				break ;
			// Up arrow key
			case 38 :
				if ( ! tetris.cannotMove.bool )
					tetris.Piece.rotation ( ctx , buffer , buffer_ctx , tetromino ) ; // Rotate piece.
				break ;

			// Right arrow key
			case 39 :
				if ( ! tetris.cannotMove.bool )
					tetris.Piece.changMove ( ctx , buffer , buffer_ctx , tetromino , 20 , 0 ) ; // Move right.
				break ;

			// Down arrow key
			case 40 :
				if ( ! tetris.cannotMove.bool )
					tetris.Piece.changMove ( ctx , buffer , buffer_ctx , tetromino , 0 , 20 ) ; // Move down (soft drop).
				break ;

			// Spacebar
			case 32 :
				tetris.Piece.dropDown ( ctx , buffer , buffer_ctx , tetromino ) ; // Hard drop the piece.
				break ;
			// 'P' key for pause
			case 80 :
				tetris.pausegame ( ) ; // Pause the game.
				break ;
			// 'R' key for restart
			case 82 :
				tetris.restartgame ( ) ; // Restart the game.
				break ;
			default :
				break ; // Ignore other key presses.
		} ;
	} ;
} ;