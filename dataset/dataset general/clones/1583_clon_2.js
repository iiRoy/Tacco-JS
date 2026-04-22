puzzleShowcases = function ( puzzleId ) {
	//  This block sets up the first puzzle type: a 4x4 grid, single-click interaction.
	var PuzzleOne = function () {
		var displayAsset = new Sprite( "data/background.jpg" , 5.0 );
		var sceneElement = new SceneObject( displayAsset );
		wade.addSceneObject( sceneElement );

		var gamePiece = createToken( "data/ChateauWRK.png" , { x: 4.0 , y: 4.0 } );
		this.gameGrid = new Board( this , gamePiece , 100.0 , { col: 4.0 , row: 4.0 } , "clickOnce" );
		Layout( this.gameGrid , "shuffle" ); // The grid is randomized on initialization.
//		this.gameGrid.designateVoid( this.gameGrid.tiles[ 1.0 ][ 2.0 ] );
	};
//----------------------------------------------------------------------------------------------------
	this.moveExecutedOne = function ( currentTile ) { // Handles the state change after a player's move.
		this.gameGrid.advanceState( currentTile );
/*
*/
	};
//----------------------------------------------------------------------------------------------------
//  This block sets up the second puzzle type: numbered tiles 1-17, single-click interaction.
/*----------------------------------------------------------------------------------------------------*/
	this.PuzzleTwo = function () {
		var displayAsset = new Sprite( "data/background.jpg" , 5.0 );
		var sceneElement = new SceneObject( displayAsset );
		wade.addSceneObject( sceneElement );

//		var gamePiece = createToken( "data/from1to17.png" , { x: 17.0 , y: 1.0 } );  // This line was for a different asset.
    var gamePiece = createToken( "data/1to17.png" , { x: 17.0 , y: 1.0 } );
		this.gameGrid = new Board( this , gamePiece , 120.0 , { col: 4.0 , row: 4.0 } , "clickOnce" );
		Layout( this.gameGrid , "shuffle" ); // Board layout is shuffled.
		this.gameGrid.designateVoid( this.gameGrid.tiles[ 1.0 ][ 2.0 ] );
  };
//----------------------------------------------------------------------------------------------------
	this.moveExecutedTwo = function ( currentTile ) { // Determines if a move is valid and updates the grid.
		var distanceVal = this.gameGrid.tileProximity( this.gameGrid.voidTile , currentTile );
		console.log( distanceVal );
		if ( this.gameGrid.tileProximity( this.gameGrid.voidTile , currentTile ) === 1.0 ) {
			this.gameGrid.swapTiles( this.gameGrid.voidTile , currentTile );
		}
/*
*/
	};
//----------------------------------------------------------------------------------------------------
//  This block sets up the third puzzle type: a 3x3 grid, single-click interaction.
/*----------------------------------------------------------------------------------------------------*/
	this.PuzzleThree = function () {
		var displayAsset = new Sprite( "data/background.jpg" , 5.0 );
		var sceneElement = new SceneObject( displayAsset );
		wade.addSceneObject( sceneElement );

		var gamePiece = createToken( "data/ChateauWRK.png" , { x: 3.0 , y: 3.0 } );
		this.gameGrid = new Board( this , gamePiece , 150.0 , { col: 3.0 , row: 3.0 } , "clickOnce" , 1.0 );
		Layout( this.gameGrid , "shuffle" ); // Initial setup is randomized.

		boardFrame( this.gameGrid , 10.0 );

		this.gameGrid.designateVoid( this.gameGrid.tiles[ 1.0 ][ 2.0 ] );
	};
//----------------------------------------------------------------------------------------------------
	this.moveExecutedThree = function ( currentTile ) {
		var distanceVal = this.gameGrid.tileProximity( this.gameGrid.voidTile , currentTile );
		console.log( distanceVal );
		if ( this.gameGrid.tileProximity( this.gameGrid.voidTile , currentTile ) === 1.0 ) {
			this.gameGrid.swapTiles( this.gameGrid.voidTile , currentTile );
		}
	};
//----------------------------------------------------------------------------------------------------
//  This block sets up the fourth puzzle type: a 4x4 grid, click-from-to interaction.
	this.PuzzleFour = function () {
		var displayAsset = new Sprite( "data/background.jpg" , 5.0 );
		var sceneElement = new SceneObject( displayAsset );
		wade.addSceneObject( sceneElement );

		var gamePiece = createToken( "data/ChateauWRK.png" , { x: 4.0 , y: 4.0 } );
		this.gameGrid = new Board( this , gamePiece , 150.0 , { col: 4.0 , row: 4.0 } , "clickFromTo" , 1.0 );
		Layout( this.gameGrid , "shuffle" ); // Tiles are initially shuffled.

		boardFrame( this.gameGrid , 10.0 );

	};
//----------------------------------------------------------------------------------------------------
	this.moveExecutedFour = function ( currentTile ) {
		this.gameGrid.performSwap();
/*
*/
	};
//  This block sets up the fifth puzzle type: a 4x4 checkerboard, click-from-to interaction.
	this.PuzzleFive = function () {
		var displayAsset = new Sprite( "data/background.jpg" , 5.0 );
		var sceneElement = new SceneObject( displayAsset );
		wade.addSceneObject( sceneElement );

		var gamePiece = createToken( "data/blackAndWhite.png" , { x: 2.0 , y: 1.0 } );
		this.gameGrid = new Board( this , gamePiece , 150.0 , { col: 4.0 , row: 4.0 } , "clickFromTo" , 1.0 );
		Layout( this.gameGrid , "random" ); // Random arrangement of tiles.

		boardFrame( this.gameGrid , 10.0 );

	};
//----------------------------------------------------------------------------------------------------
	this.moveExecutedFive = function ( currentTile ) {
		this.gameGrid.performSwap();
/*
*/
	};
//----------------------------------------------------------------------------------------------------
//  Various layout configuration examples.
/*----------------------------------------------------------------------------------------------------
/*
		// Layout(this.gameGrid,"random"); //  Random layout option.
		// Layout(this.gameGrid,"sequence"); // Sequential layout option.
		// Layout(this.gameGrid,4.0); // Numeric grid layout.
		// Layout(this.gameGrid,[[1.0,0.0,2.0,0.0,3.0,0.0],
		//										 [0.0,4.0,0.0,5.0,0.0,6.0],
		//										 [7.0,0.0,8.0,0.0,9.0,0.0]]); // Custom array layout.
*/

  this.resetCurrentPuzzle = function () {
    if ( this.gameGrid && this.gameGrid.boundaryDisplay ) {
        wade.removeSceneObject( this.gameGrid.boundaryDisplay );
    }
    if ( this.gameGrid ) {
      for ( let eachRow in this.gameGrid.tiles ) {
        for ( let eachTileIndex in this.gameGrid.tiles[ eachRow ] ) {
          wade.removeSceneObject( this.gameGrid.tiles[ eachRow ][ eachTileIndex ] );
        }
      }
    }
  };

//  wade.clearCanvas(5.0);    // Example of canvas clearing.
//  wade.removeLayer(4.0);

	switch ( puzzleId ) {
		case 1.0: { this.resetCurrentPuzzle(); PuzzleOne(); break; }
		case 2.0: { this.resetCurrentPuzzle(); this.PuzzleTwo(); break; }
		case 3.0: { this.resetCurrentPuzzle(); this.PuzzleThree(); break; }
		case 4.0: { this.resetCurrentPuzzle(); this.PuzzleFour(); break; }
		case 5.0: { this.resetCurrentPuzzle(); this.PuzzleFive(); break; }
	}

this.handlePlayerMove = function ( currentTile ) {
	switch ( puzzleId ) {
		case 1.0: { this.moveExecutedOne( currentTile ); break; }
		case 2.0: { this.moveExecutedTwo( currentTile ); break; }
		case 3.0: { this.moveExecutedThree( currentTile ); break; }
		case 4.0: { this.moveExecutedFour( currentTile ); break; }
		case 5.0: { this.moveExecutedFive( currentTile ); break; }
	}
};

};
//# sourceURL=puzzleShowcases.js