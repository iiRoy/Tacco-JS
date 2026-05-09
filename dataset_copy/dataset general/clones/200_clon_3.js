PowerUpCollectable = GameBaseEntity.extend({

    // Private-like static mapping for different power-up configurations.
    // This replaces the simple array of strings with a more structured object,
    // allowing for easy lookup by a defined key and storing associated sprite offsets.
    _itemConfigurations: {
        'HASTE_BOOST': { displayLabel: 'Swiftness', spriteOffsetX: 0 },
        'BOMB_DROP':   { displayLabel: 'Explosion', spriteOffsetX: 32 },
        'BLAZING_AURA':{ displayLabel: 'Inferno',   spriteOffsetX: 64 }
    },

    // Renamed internal state properties for clarity.
    effectVariant: null,       // Stores the actual display label of the power-up.
    worldGridLocation: null,   // Stores the logical game world coordinates.
    visualDisplayObject: null, // Holds the EaselJS display object (Bitmap).

    // Renamed the constructor-like method and its parameters.
    // The `itemKey` now expects a string key from `_itemConfigurations` instead of a numerical index.
    initiateSpawn: function(gridCoordinates, itemKey) {
        // --- ADDED VALIDATION / GUARD CLAUSE ---
        if (!gridCoordinates || typeof gridCoordinates.x !== 'number' || typeof gridCoordinates.y !== 'number') {
            console.error("Critical error: Invalid grid coordinates provided for power-up spawn.");
            // In a real scenario, could throw an error or prevent instantiation.
            return;
        }

        // --- ADDED INTERMEDIATE VARIABLE AND VALIDATION ---
        const activeConfig = this._itemConfigurations[itemKey];
        if (!activeConfig) {
            // --- UPDATED BEHAVIOR: DEFAULTING ON UNKNOWN KEY ---
            console.warn(`Unknown power-up key '${itemKey}'. Defaulting to 'HASTE_BOOST'.`);
            this.effectVariant = this._itemConfigurations['HASTE_BOOST'].displayLabel;
            this.worldGridLocation = gridCoordinates;
            // Re-calling the setup with the default configuration.
            this._establishVisuals(this.worldGridLocation, this._itemConfigurations['HASTE_BOOST'].spriteOffsetX);
            return; // Exit after setting up default
        }

        // --- REWRITTEN PROPERTY ASSIGNMENTS ---
        this.effectVariant = activeConfig.displayLabel;
        this.worldGridLocation = gridCoordinates;

        // --- EXTRACTED VISUAL SETUP INTO A NEW HELPER METHOD (Type III addition) ---
        this._establishVisuals(this.worldGridLocation, activeConfig.spriteOffsetX);

        // --- ADDED POST-INSTANTIATION VALIDATION ---
        if (!this.visualDisplayObject) {
            console.error("Failed to fully initialize visual component for power-up.");
        }
    },

    // --- NEW HELPER METHOD FOR VISUAL SETUP (Type III addition) ---
    _establishVisuals: function(currentGridPos, spriteOffset) {
        // Renamed global game context and asset reference.
        this.visualDisplayObject = new createjs.Bitmap(window.GameCore.assetLibrary.powerUpSheet);

        // Renamed coordinate conversion utility and its output.
        const screenRenderPosition = CoordinateConverter.gridToPixel(currentGridPos);

        this.visualDisplayObject.x = screenRenderPosition.x;
        this.visualDisplayObject.y = screenRenderPosition.y;

        // --- REWRITTEN sourceRect CALCULATION WITH EXPLICIT VARIABLES ---
        const SPRITE_TILE_DIMENSION = 32; // Defined as a constant for clarity.
        this.visualDisplayObject.sourceRect = new createjs.Rectangle(
            spriteOffset,
            0,
            SPRITE_TILE_DIMENSION,
            SPRITE_TILE_DIMENSION
        );

        // Renamed stage reference.
        window.GameCore.displaySurface.mainLayer.addChild(this.visualDisplayObject);
    },

    // Renamed the cleanup method.
    deactivateCollectable: function() {
        // --- ADDED GUARD CLAUSE ---
        if (!this.visualDisplayObject) {
            console.warn("Attempted to deactivate a power-up without an active visual component.");
            return;
        }

        // --- REWRITTEN REMOVAL FROM DISPLAY STAGE ---
        window.GameCore.displaySurface.mainLayer.removeChild(this.visualDisplayObject);

        // --- REWRITTEN REMOVAL FROM GAME'S ACTIVE LIST ---
        // Renamed utility function and the game's collection.
        CollectionManagement.removeInstance(window.GameCore.entityManager.activePowerUps, this);

        // --- ADDED CLEANUP FOR INTERNAL REFERENCES (Type III addition) ---
        this.visualDisplayObject = null;
        this.worldGridLocation = null;
        this.effectVariant = null;
        // Could also set a 'disposed' flag here.
    }
});