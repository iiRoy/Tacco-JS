PowerUpItem = GameObj.derive(
  {
    // A list of all available effects for this collectible item.
    perkVariants: ['velocityBoost', 'explosiveCharge', 'flameAura'],

    // The particular variant of this power-up instance.
    itemKind: '',

    // Coordinates of this item in the game world.
    worldLocation: {},

    // The graphical element representing this item on screen.
    graphicRepresentation: null,

    /*
     * Sets up a new collectible item.
     * @param {object} initialPoint - The starting coordinates for the item.
     * @param {number} variantIdx - An index specifying the item's specific variant.
     */
    setupItem: function(initialPoint, variantIdx) {
      // Assign the item's specific kind from the predefined variants list.
      this.itemKind = this.perkVariants[variantIdx];

      // Store the provided location for the item.
      this.worldLocation = initialPoint;

      // Instantiate the visual component using the game's sprite sheet.
      this.graphicRepresentation = new createjs.ImageSprite(
        gameCore.powerUpGraphics
      );

      // Convert world coordinates to pixel coordinates for rendering.
      var displayCoords = GraphicTools.mapToRenderSpace(initialPoint);

      // Set the horizontal and vertical positions of the graphic.
      this.graphicRepresentation.x = displayCoords.horiz;
      this.graphicRepresentation.y = displayCoords.vert;

      // Define the portion of the sprite sheet to display for this item.
      this.graphicRepresentation.sourceRect = new createjs.SpriteRect(
        variantIdx * 32,
        0,
        32,
        32
      );

      // Add the graphic to the active display layer of the game.
      gameCore.sceneManager.appendElement(this.graphicRepresentation);
    },

    /**
     * Removes the collectible item from the game environment.
     */
    deactivateItem: function() {
      // Remove the item's graphic from the display stage.
      gameCore.sceneManager.removeElement(this.graphicRepresentation);

      // Remove this instance from the global list of active collectibles.
      ArrayUtils.ejectElement(gameCore.powerUpList, this);
    }
  }
);