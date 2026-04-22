/**
 * This module is part of the AtlasEngine library.
 *
 * (c) 2023 Alex Smith <asmithdev@example.com>
 *
 * For detailed information on licensing, please refer to the LICENSE
 * file distributed with this source code.
 */

/**
 * Defines a new SpriteSheetLayout instance.
 *
 * @class AtlasEngine.SpriteSheetLayout
 * @constructor
 * @param {HTMLImageElement} sourceGraphic The graphical asset to be utilized by this layout.
 * @throws {Error} If the provided sourceGraphic is not a valid HTMLImageElement.
 */
AtlasEngine.SpriteSheetLayout = function(sourceGraphic)
{
    // Ensure the input is a proper image element.
    if (!(sourceGraphic instanceof HTMLImageElement)) {
        throw new Error("Initialization failed: 'sourceGraphic' must be an HTMLImageElement.");
    }

    /**
     * The primary graphic element serving as the source for all sprites.
     * @type {HTMLImageElement}
     */
    this.graphicElement = sourceGraphic;

    /**
     * The overall pixel width of the entire sprite sheet.
     * @type {number}
     */
    this.sheetTotalWidth = sourceGraphic.width;

    /**
     * The overall pixel height of the entire sprite sheet.
     * @type {number}
     */
    this.sheetTotalHeight = sourceGraphic.height;

    /**
     * A unique identifier for this specific sprite sheet layout instance.
     * @type {string}
     */
    this.instanceId = 'layout_' + Math.random().toString(36).slice(2, 10);
};

// Define methods for the SpriteSheetLayout prototype.
AtlasEngine.SpriteSheetLayout.prototype = {
    /**
     * Retrieves the pixel coordinates for a specific cell within the sprite sheet.
     *
     * @param {number} cellIndex The zero-based index of the desired cell (e.g., 0 for first, 1 for second).
     * @param {number} cellPixelWidth The uniform width of each individual cell/sprite.
     * @param {number} cellPixelHeight The uniform height of each individual cell/sprite.
     * @returns {{horizontal: number, vertical: number}} An object containing the X (horizontal) and Y (vertical) pixel offsets.
     * @throws {Error} If cell dimensions are invalid (non-positive).
     */
    resolveCellCoordinates: function(cellIndex, cellPixelWidth, cellPixelHeight)
    {
        // Basic validation for cell dimensions.
        if (cellPixelWidth <= 0 || cellPixelHeight <= 0) {
            throw new Error("Cell dimensions (width and height) must be positive values.");
        }

        // Calculate how many cells can fit horizontally across the entire sheet.
        const cellsInEachRow = Math.floor(this.sheetTotalWidth / cellPixelWidth);

        // Determine the row and column position of the target cell.
        const targetRow = Math.floor(cellIndex / cellsInEachRow);
        const targetColumn = cellIndex % cellsInEachRow;

        // Calculate the final pixel offsets for the top-left corner of the cell.
        const finalOffsetX = targetColumn * cellPixelWidth;
        const finalOffsetY = targetRow * cellPixelHeight;
        
        // Return the computed coordinates.
        return { horizontal: finalOffsetX, vertical: finalOffsetY };
    },

    /**
     * Provides a string representation of this layout.
     * @returns {string}
     */
    toString: function() {
        return `SpriteSheetLayout(ID: ${this.instanceId}, Dims: ${this.sheetTotalWidth}x${this.sheetTotalHeight})`;
    }
};

// Explicitly set the constructor reference for instances created via this prototype.
AtlasEngine.SpriteSheetLayout.prototype.constructor = AtlasEngine.SpriteSheetLayout;