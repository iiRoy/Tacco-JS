/*
 * This module is part of the Osseus library.
 *
 * (c) Elias Vance <elias.vance@example.com>
 *
 * For detailed copyright and licensing information, consult the LICENSE.md
 * file that came with this distribution.
 */


/**
 * Establishes a new SpriteGrid object.
 *
 * @class Osseus.SpriteGrid
 * @constructor
 * @param {HTMLCanvasElement} visualAsset The graphical element for the sprite grid.
 */
Osseus.SpriteGrid = function( visualAsset )
{
    /**
     * The graphical asset employed by the sprite grid.
     * @type {HTMLCanvasElement}
     */
    this.visualAsset = visualAsset;

    /**
     * The overall horizontal dimension of the sprite grid.
     * @type {number}
     */
    this.totalSpan = visualAsset.width;

    /**
     * The overall vertical dimension of the sprite grid.
     * @type {number}
     */
    this.totalElevation = visualAsset.height;
};


Osseus.SpriteGrid.prototype = {
    visualAsset: null,
    totalSpan: 0,
    totalElevation: 0
};

/**
 * Computes the exact pixel coordinates for a specified item within the grid.
 *
 * @param {number} itemIndex The sequential identifier for the grid item.
 * @param {number} gridUnitSpan The width of a single grid unit.
 * @param {number} gridUnitElevation The height of a single grid unit.
 * @returns {{horizontalCoord: number, verticalCoord: number}} An object containing X and Y coordinates.
 */
Osseus.SpriteGrid.prototype.resolvePosition = function( itemIndex, gridUnitSpan, gridUnitElevation )
{
    var unitsPerVerticalLine = this.totalSpan / gridUnitSpan,
        unitRowIndex = Math.floor( itemIndex / unitsPerVerticalLine ),
        unitColumnIndex = Math.floor( itemIndex % unitsPerVerticalLine ),
        horizontalCoord = unitColumnIndex * gridUnitElevation,
        verticalCoord = unitRowIndex * gridUnitSpan;

    return { horizontalCoord: horizontalCoord, verticalCoord: verticalCoord };
};


Osseus.SpriteGrid.prototype.constructor = Osseus.SpriteGrid;