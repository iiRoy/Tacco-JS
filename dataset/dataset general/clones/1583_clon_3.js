const puzzleSchemeFactory = function(schemeIdentifier) {

    // Centralized asset paths for easier management and consistency.
    const BACKGROUND_IMAGE_PATH = "data/background.jpg";
    const CHATEAU_TILE_IMAGE = "data/ChateauWRK.png";
    const NUMERIC_TILE_IMAGE = "data/1to17.png";
    const CHECKER_TILE_IMAGE = "data/blackAndWhite.png";

    // Utility function to set up the general background element for any puzzle.
    const provisionSceneBackdrop = (assetPath, layerLevel = 5) => {
        const visualLayerSprite = new Sprite(assetPath, layerLevel);
        const sceneDisplayObject = new SceneObject(visualLayerSprite);
        wade.addSceneObject(sceneDisplayObject);
        // Returning the object, although the original code didn't explicitly use it after adding.
        return sceneDisplayObject;
    };

    // Configuration for the first puzzle variant: Chateau 4x4, 'clickOnce'.
    const setupVariantOne = function() {
        provisionSceneBackdrop(BACKGROUND_IMAGE_PATH);

        // Define the properties for the individual puzzle pieces.
        const pieceDefinition = spawnTileDefinition(CHATEAU_TILE_IMAGE, { gridX: 4, gridY: 4 });

        // Establish the dimensions and interaction type for the game board.
        const gridDimensions = { columns: 4, rows: 4 };
        const interactionBehavior = "clickOnce";
        const pieceRenderSize = 100;

        // Construct the game board instance.
        this.puzzleSurface = new Board(this, pieceDefinition, pieceRenderSize, gridDimensions, interactionBehavior);

        // Apply an initial shuffled layout to the tiles.
        ConfigureGrid(this.puzzleSurface, "shuffle");

        // The original had a commented-out line here, maintaining structural similarity.
        // this.puzzleSurface.setEmpty(this.puzzleSurface.tokens[1][2]);
    };

    // Movement processing for the first puzzle variant.
    this.handleMoveOne = function(clickedPiece) {
        // This variant implies a direct action on the clicked piece.
        this.puzzleSurface.processNextTurn(clickedPiece);
    };

    // Configuration for the second puzzle variant: 1-17 tiles, 4x4, 'clickOnce'.
    this.setupVariantTwo = function() {
        provisionSceneBackdrop(BACKGROUND_IMAGE_PATH);

        const pieceSpec = spawnTileDefinition(NUMERIC_TILE_IMAGE, { gridX: 17, gridY: 1 });

        const boardLayout = { columns: 4, rows: 4 };
        const inputMechanism = "clickOnce";
        const visualScale = 120;

        this.puzzleSurface = new Board(this, pieceSpec, visualScale, boardLayout, inputMechanism);

        ConfigureGrid(this.puzzleSurface, "shuffle");

        // Designate a specific tile as the initially empty slot.
        const emptyRow = 1;
        const emptyCol = 2;
        if (this.puzzleSurface.tiles && this.puzzleSurface.tiles[emptyRow] && this.puzzleSurface.tiles[emptyRow][emptyCol]) {
            this.puzzleSurface.assignEmptySlot(this.puzzleSurface.tiles[emptyRow][emptyCol]);
        } else {
            console.warn(`Warning: Could not assign empty slot at [${emptyRow}][${emptyCol}] for scheme ${schemeIdentifier}. Check grid dimensions.`);
        }
    };

    // Movement processing for the second puzzle variant, involves adjacency check.
    this.handleMoveTwo = function(activatedPiece) {
        // Determine if the activated piece is directly adjacent to the blank space.
        const proximityValue = this.puzzleSurface.calculateTileDistance(this.puzzleSurface.blankSpace, activatedPiece);

        // Execute a swap only if the tiles are immediate neighbors.
        if (proximityValue === 1) {
            this.puzzleSurface.swapTiles(this.puzzleSurface.blankSpace, activatedPiece);
        }
    };

    // Configuration for the third puzzle variant: Chateau 3x3, 'clickOnce'.
    this.setupVariantThree = function() {
        provisionSceneBackdrop(BACKGROUND_IMAGE_PATH);

        const tileDescriptor = spawnTileDefinition(CHATEAU_TILE_IMAGE, { gridX: 3, gridY: 3 });

        const gridParameters = { columns: 3, rows: 3 };
        const controlType = "clickOnce";
        const displayUnitSize = 150;
        const optionalBoardArg = 1;

        this.puzzleSurface = new Board(this, tileDescriptor, displayUnitSize, gridParameters, controlType, optionalBoardArg);

        ConfigureGrid(this.puzzleSurface, "shuffle");

        // Draw a visual boundary around the puzzle area.
        renderGridBoundary(this.puzzleSurface, 10);

        // Set the initial empty tile position.
        const emptyTileRow = 1;
        const emptyTileCol = 2;
        if (this.puzzleSurface.tiles && this.puzzleSurface.tiles[emptyTileRow] && this.puzzleSurface.tiles[emptyTileRow][emptyTileCol]) {
            this.puzzleSurface.assignEmptySlot(this.puzzleSurface.tiles[emptyTileRow][emptyTileCol]);
        } else {
            console.warn(`Warning: Could not assign empty slot at [${emptyTileRow}][${emptyTileCol}] for scheme ${schemeIdentifier}.`);
        }
    };

    // Movement processing for the third puzzle variant.
    this.handleMoveThree = function(activatedPiece) {
        const adjacencyDistance = this.puzzleSurface.calculateTileDistance(this.puzzleSurface.blankSpace, activatedPiece);

        if (adjacencyDistance === 1) {
            this.puzzleSurface.swapTiles(this.puzzleSurface.blankSpace, activatedPiece);
        }
    };

    // Configuration for the fourth puzzle variant: Chateau 4x4, 'clickFromTo'.
    this.setupVariantFour = function() {
        provisionSceneBackdrop(BACKGROUND_IMAGE_PATH);

        const tileAssetDetails = spawnTileDefinition(CHATEAU_TILE_IMAGE, { gridX: 4, gridY: 4 });

        const layoutSpecs = { columns: 4, rows: 4 };
        const interactionMechanism = "clickFromTo";
        const visualComponentSize = 150;
        const extraSetting = 1;

        this.puzzleSurface = new Board(this, tileAssetDetails, visualComponentSize, layoutSpecs, interactionMechanism, extraSetting);

        ConfigureGrid(this.puzzleSurface, "shuffle");

        renderGridBoundary(this.puzzleSurface, 10);
    };

    // Movement processing for the fourth puzzle variant.
    this.handleMoveFour = function() {
        // The 'clickFromTo' mechanism implies the board internally manages the two-click process.
        this.puzzleSurface.performSequentialSwap();
    };

    // Configuration for the fifth puzzle variant: Checkerboard 4x4, 'clickFromTo'.
    this.setupVariantFive = function() {
        provisionSceneBackdrop(BACKGROUND_IMAGE_PATH);

        const pieceImageInfo = spawnTileDefinition(CHECKER_TILE_IMAGE, { gridX: 2, gridY: 1 });

        const boardConfig = { columns: 4, rows: 4 };
        const inputMethodology = "clickFromTo";
        const sizingParameter = 150;
        const supplementaryParameter = 1;

        this.puzzleSurface = new Board(this, pieceImageInfo, sizingParameter, boardConfig, inputMethodology, supplementaryParameter);

        // This variant uses a random tile arrangement.
        ConfigureGrid(this.puzzleSurface, "random");

        renderGridBoundary(this.puzzleSurface, 10);
    };

    // Movement processing for the fifth puzzle variant.
    this.handleMoveFive = function() {
        this.puzzleSurface.performSequentialSwap();
    };

    // Resets and clears all currently active puzzle elements from the display.
    this.deactivateActiveScheme = function() {
        // Early exit if no puzzle surface is currently initialized.
        if (!this.puzzleSurface) {
            return;
        }

        // Remove any visual frame that might have been drawn around the board.
        if (this.puzzleSurface.boardFrameObject) {
            wade.removeSceneObject(this.puzzleSurface.boardFrameObject);
        }

        // Iterate through all tiles on the puzzle surface and remove them from the scene.
        // Using modern array iteration for robustness and clarity.
        if (this.puzzleSurface.tiles && Array.isArray(this.puzzleSurface.tiles)) {
            this.puzzleSurface.tiles.forEach(tileRow => {
                if (Array.isArray(tileRow)) {
                    tileRow.forEach(individualTile => {
                        if (individualTile) { // Ensure the tile object exists before attempting removal.
                            wade.removeSceneObject(individualTile);
                        }
                    });
                }
            });
        }
        // Explicitly nullify the puzzle surface to indicate it's no longer active.
        this.puzzleSurface = null;
    };

    // Central dispatcher for initializing the selected puzzle scheme.
    const initializeSelectedPuzzle = () => {
        // Basic validation for the input scheme identifier.
        if (typeof schemeIdentifier !== 'number' || schemeIdentifier < 1 || schemeIdentifier > 5) {
            console.error(`Error: Invalid puzzle scheme identifier '${schemeIdentifier}'. Expected a number from 1 to 5.`);
            return;
        }

        // Always clear any previous puzzle setup before loading a new one.
        this.deactivateActiveScheme();

        // Using an object map for a cleaner dispatching mechanism than a traditional switch.
        const setupMap = {
            1: setupVariantOne,
            2: this.setupVariantTwo,
            3: this.setupVariantThree,
            4: this.setupVariantFour,
            5: this.setupVariantFive
        };

        const chosenSetupFunction = setupMap[schemeIdentifier];
        if (chosenSetupFunction) {
            // Call the selected setup function, ensuring 'this' context is correctly bound.
            chosenSetupFunction.call(this);
        } else {
            console.warn(`Warning: No specific setup function found for scheme ID: ${schemeIdentifier}.`);
        }
    };

    // Immediately execute the initialization routine when the factory is created.
    initializeSelectedPuzzle();

    // Unified handler for all player actions (tile clicks), dispatching to the correct game-specific logic.
    this.processPlayerAction = function(triggeredPiece) {
        const actionHandlers = {
            1: this.handleMoveOne,
            2: this.handleMoveTwo,
            3: this.handleMoveThree,
            4: this.handleMoveFour,
            5: this.handleMoveFive
        };

        const currentSchemeHandler = actionHandlers[schemeIdentifier];
        if (currentSchemeHandler) {
            // Execute the specific handler with the correct 'this' context and the triggered piece.
            currentSchemeHandler.call(this, triggeredPiece);
        } else {
            console.warn(`Warning: No action handler defined for scheme ID: ${schemeIdentifier}.`);
        }
    };
};
//# sourceURL=puzzleSchemeGenerator.js