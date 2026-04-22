gameExamples = function ( gameNr ) {
    // This JavaScript file defines a collection of game scenarios.
    // Each scenario is a separate function within this main 'gameExamples' function.

    // 1) Game: Chateau 4x4, utilizes 'clickOnce' interaction.
    var Game1 = function ( ) {
        // Initialize background sprite with an image path and depth.
        var backgroundImg = new Sprite ( "data/background.jpg", 5 ) ;

        // Create a scene object for the background image.
        var background = new SceneObject ( backgroundImg ) ;

        // Add the background scene object to the Wade engine.
        wade.addSceneObject ( background ) ;

        // Create game tokens using a specific image and dimensions (x: 4, y: 4).
        var token = createToken ( "data/ChateauWRK.png", { x: 4, y: 4 } ) ;

        // Initialize the game board with various parameters:
        // - 'this' (context), 'token' (token type), '100' (token size),
        // - '{col:4,row:4}' (board dimensions), '"clickOnce"' (interaction type).
        this.board = new Board ( this, token, 100, { col: 4, row: 4 }, "clickOnce" ) ;

        // Apply a "shuffle" layout to the newly created board. This is confirmed as OK.
        Layout ( this.board, "shuffle" ) ;

        // The following line is commented out, but would set a specific token as empty if active.
        // this.board.setEmpty ( this.board.tokens [ 1 ] [ 2 ] ) ;
    } ; // End of Game1 definition

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    this.turnPlayed1 = function ( aToken ) {
        // This function is called when a turn is played in Game1.
        // Its primary purpose is to show the effect of an empty token on winning.
        this.board.nextFrame ( aToken ) ; // Advance the board state based on the token.
        /*
         *  Currently, this specific turn handler for Game1 does not contain
         *  any additional complex logic beyond advancing the frame.
         */
    } ; // End of turnPlayed1 definition

    /* ------------------------------------------------------------------------------------------------------------------------------------------------ */

    // 2) Game: 1to17 (number tiles), uses 'clickOnce' interaction.
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
gameExamples = function(gameNr) {
    //
    // This function defines and manages various game examples within the Wade engine context.
    // It encapsulates different board configurations and turn-handling logic.
    //

    // === Game 1: Chateau 4x4 with 'clickOnce' interaction ===
    // This is a classic 4x4 sliding puzzle using a chateau image.
    var Game1 = function() {
        // Create a new sprite for the background image.
        var backgroundImg = new Sprite("data/background.jpg", 5);

        // Instantiate a SceneObject with the background sprite.
        var background = new SceneObject(backgroundImg);

        // Add the background object to the current scene in Wade.
        wade.addSceneObject(background);


        // Create a token sprite from the ChateauWRK image, specifying its dimensions.
        var token = createToken("data/ChateauWRK.png", {x: 4, y: 4});

        // Initialize the game board.
        // Parameters: context (this), token sprite, token size (100),
        // board dimensions ({col:4, row:4}), interaction type ("clickOnce").
        this.board = new Board(this, token, 100, {col: 4, row: 4}, "clickOnce");

        // Apply a "shuffle" layout to the board. This operation is considered successful (OK).
        Layout(this.board, "shuffle");

        // The following line is commented out. If uncommented, it would set a specific tile
        // (at row 1, column 2) as the initially empty space on the board.
        // this.board.setEmpty(this.board.tokens[1][2])
    }; // End of Game1 definition.

    /* ---------------------------------------------------------------------------------------- */

    // Handler for turns played in Game 1.
    this.turnPlayed1 = function(aToken) {
        // This function defines the actions to take when a token is interacted with in Game1.
        // It primarily advances the board's state.
        this.board.nextFrame(aToken);

        /*
         *  Additional logic or effects for winning conditions could be
         *  implemented here if required for Game1's specific rules.
         *  Currently, it only processes the next frame based on the token.
         */
    }; // End of turnPlayed1 handler.

    /* ---------------------------------------------------------------------------------------- */

    // === Game 2: 1to17 (numbered tiles) with 'clickOnce' interaction ===
    // This game uses numbered tiles (1 to 17) on a sliding puzzle.
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    this.Game2 = function() {
        // Set up the background for Game2, similar to Game1.
        var backgroundImg = new Sprite("data/background.jpg", 5);
        var background = new SceneObject(backgroundImg);
        wade.addSceneObject(background);


        // Original comment for a potentially incorrect token path:
        // var token = createToken("data/from1to17.png", {x: 17,y: 1});  // KO Why ???????
        // The corrected token path for the 1to17 game is used below.
        var token = createToken("data/1to17.png", {x: 17, y: 1});

        // Initialize the board for Game2.
        // Parameters: context (this), token, token size (120), board dimensions ({col:4, row:4}),
        // and interaction type ("clickOnce").
        this.board = new Board(this, token, 120, {col: 4, row: 4}, "clickOnce");

        // Shuffle the board layout. This is confirmed as OK.
        Layout(this.board, "shuffle");

        // Explicitly set the token at position [1][2] as the empty slot.
        this.board.setEmpty(this.board.tokens[1][2]);
    }; // End of Game2 definition.

    /* ---------------------------------------------------------------------------------------- */

    // Handler for turns played in Game 2.
    this.turnPlayed2 = function(aToken) {
        // This function handles token interactions for Game2.
        // It determines if a token can be swapped with the empty space.

        // Calculate the distance between the empty token and the clicked token.
        var w = this.board.tokenDistance(this.board.emptyToken, aToken);

        // Log the calculated distance to the console for debugging.
        console.log(w);

        // If the distance is 1 (meaning the token is adjacent to the empty space),
        // then perform a swap.
        if (this.board.tokenDistance(this.board.emptyToken, aToken) == 1) {
            this.board.switchToken(this.board.emptyToken, aToken);
        }
        /*
         *  No other specific effects or win conditions are handled
         *  directly within this turnPlayed2 function.
         */
    }; // End of turnPlayed2 handler.

    /* ---------------------------------------------------------------------------------------- */

    // === Game 3: Chateau 3x3 with 'clickOnce' interaction ===
    // A smaller 3x3 version of the Chateau sliding puzzle.
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    this.Game3 = function() {
        // Standard background setup for Game3.
        var backgroundImg = new Sprite("data/background.jpg", 5);
        var background = new SceneObject(backgroundImg);
        wade.addSceneObject(background);


        // Create tokens for a 3x3 grid from the ChateauWRK image.
        var token = createToken("data/ChateauWRK.png", {x: 3, y: 3});

        // Initialize the board for Game3, including an additional parameter '1'.
        this.board = new Board(this, token, 150, {col: 3, row: 3}, "clickOnce", 1);

        // Shuffle the layout of the board. This is confirmed as OK.
        Layout(this.board, "shuffle");


        // Draw a frame around the board with an offset of 10.
        boardFrame(this.board, 10);


        // Set the token at position [1][2] as the empty slot.
        this.board.setEmpty(this.board.tokens[1][2]);
    }; // End of Game3 definition.

    /* ---------------------------------------------------------------------------------------- */

    // Handler for turns played in Game 3.
    this.turnPlayed3 = function(aToken) {
        // Similar to turnPlayed2, this handles token swaps for Game3.
        var w = this.board.tokenDistance(this.board.emptyToken, aToken);
        console.log(w);
        if (this.board.tokenDistance(this.board.emptyToken, aToken) == 1) {
            this.board.switchToken(this.board.emptyToken, aToken);
        }
    }; // End of turnPlayed3 handler.

    /* ---------------------------------------------------------------------------------------- */

    // === Game 4: Chateau 4x4 with 'clickFromTo' interaction ===
    // This game uses a different interaction model where two tiles are clicked to swap.
    this.Game4 = function() {
        // Background setup for Game4.
        var backgroundImg = new Sprite("data/background.jpg", 5);
        var background = new SceneObject(backgroundImg);
        wade.addSceneObject(background);


        // Create tokens for a 4x4 grid from the ChateauWRK image.
        var token = createToken("data/ChateauWRK.png", {x: 4, y: 4});

        // Initialize the board for Game4 with "clickFromTo" interaction and an extra parameter '1'.
        this.board = new Board(this, token, 150, {col: 4, row: 4}, "clickFromTo", 1);

        // Shuffle the board layout. This is confirmed as OK.
        Layout(this.board, "shuffle");


        // Draw a frame around the board with an offset of 10.
        boardFrame(this.board, 10);

    }; // End of Game4 definition.

    /* ---------------------------------------------------------------------------------------- */

    // Handler for turns played in Game 4.
    this.turnPlayed4 = function(aToken) {
        // For 'clickFromTo' games, the board handles the swap logic internally after two clicks.
        this.board.switchFromTo();

        /*
         *  The 'aToken' parameter is not directly used in this specific
         *  'switchFromTo' implementation, as the board manages state.
         */
    }; // End of turnPlayed4 handler.

    // === Game 5: Checkerboard 4x4 with 'clickFromTo' interaction ===
    // This game features a black and white checkerboard pattern.
    this.Game5 = function() {
        // Background setup for Game5.
        var backgroundImg = new Sprite("data/background.jpg", 5);
        var background = new SceneObject(backgroundImg);
        wade.addSceneObject(background);


        // Create tokens for a 4x4 grid using a black and white image.
        var token = createToken("data/blackAndWhite.png", {x: 2, y: 1});

        // Initialize the board for Game5 with "clickFromTo" interaction and an extra parameter '1'.
        this.board = new Board(this, token, 150, {col: 4, row: 4}, "clickFromTo", 1);

        // Apply a "random" layout to the board. This is confirmed as OK.
        Layout(this.board, "random");


        // Draw a frame around the board with an offset of 10.
        boardFrame(this.board, 10);

    }; // End of Game5 definition.

    /* ---------------------------------------------------------------------------------------- */

    // Handler for turns played in Game 5.
    this.turnPlayed5 = function(aToken) {
        // Similar to Game4, the 'switchFromTo' method handles the interaction.
        this.board.switchFromTo();

        /*
         *  The 'aToken' parameter provides information about the clicked token,
         *  but 'switchFromTo' manages the selection and swapping of two tokens.
         */
    }; // End of turnPlayed5 handler.

    /* ---------------------------------------------------------------------------------------- */

    // Section describing various Layout models that can be applied to a board.
    /*
     *  The following are examples of how different layouts can be specified:
     *  - Layout(this.board, "random"); // Distributes tokens randomly. (OK)
     *  - Layout(this.board, "sequence"); // Arranges tokens in numerical sequence.
     *  - Layout(this.board, 4); // Applies a specific pre-defined layout by ID (e.g., ID 4). (OK)
     *  - Layout(this.board, [[1,0,2,0,3,0], [0,4,0,5,0,6], [7,0,8,0,9,0]]); // Custom 2D array layout. (OK)
     */

    // Function to clear the current game board and its associated elements.
    this.clearGame = function() {
        // If a board and its frame exist, remove the frame from the scene.
        if (this.board && this.board.frame) {
            wade.removeSceneObject(this.board.frame);
        }

        // If a board exists, iterate through all its tokens and remove them from the scene.
        if (this.board) {
            for (var aRow in this.board.tokens) {
                for (var aTokenIx in this.board.tokens[aRow]) {
                    wade.removeSceneObject(this.board.tokens[aRow][aTokenIx]);
                }
            }
        }
    }; // End of clearGame function.


    // The following lines are commented out, suggesting potential Wade engine cleanup operations.
    // wade.clearCanvas(5);    // This might be used to clear a specific canvas layer.
    // wade.removeLayer(4);    // This might be used to remove a specific rendering layer.

    // A switch statement to select and initialize a game based on the 'gameNr' parameter.
    switch (gameNr) {
        case 1:
            {
                this.clearGame(); // Clear any existing game.
                Game1();          // Initialize Game1.
                break;
            }
        case 2:
            {
                this.clearGame(); // Clear any existing game.
                this.Game2();     // Initialize Game2.
                break;
            }
        case 3:
            {
                this.clearGame(); // Clear any existing game.
                this.Game3();     // Initialize Game3.
                break;
            }
        case 4:
            {
                this.clearGame(); // Clear any existing game.
                this.Game4();     // Initialize Game4.
                break;
            }
        case 5:
            {
                this.clearGame(); // Clear any existing game.
                this.Game5();     // Initialize Game5.
                break;
            }
    } // End of game selection switch.

    // This function acts as a dispatcher for turn handling,
    // directing the call to the appropriate 'turnPlayedX' function based on 'gameNr'.
    this.turnPlayed = function(aToken) {
        switch (gameNr) {
            case 1:
                {
                    this.turnPlayed1(aToken); // Call Game1's turn handler.
                    break;
                }
            case 2:
                {
                    this.turnPlayed2(aToken); // Call Game2's turn handler.
                    break;
                }
            case 3:
                {
                    this.turnPlayed3(aToken); // Call Game3's turn handler.
                    break;
                }
            case 4:
                {
                    this.turnPlayed4(aToken); // Call Game4's turn handler.
                    break;
                }
            case 5:
                {
                    this.turnPlayed5(aToken); // Call Game5's turn handler.
                    break;
                }
        } // End of turnPlayed dispatcher switch.
    }; // End of turnPlayed function.

}; // End of gameExamples function definition.

//# sourceURL=gameExamples.js