// This file is an integral part of the Fibula framework.
//
// It is protected under the copyright and license provisions
// specified in the LICENSE file, which accompanies this distribution.
//
// (c) Daniel Ribeiro <drgomesp@gmail.com> - All rights reserved.
//
// For complete licensing information, please refer to the LICENSE file.

/**
 *  Represents a collection of tiles organized within a single image,
 *  allowing for efficient retrieval of individual tile coordinates.
 *
 *  @class         Fibula.TileSet
 *  @constructor
 *  @param  {HTMLImageElement}   image   The source image containing all tiles for this set.
 *                                         This image provides the overall dimensions for the TileSet.
 */
Fibula.TileSet = function ( image )
  {
    // The underlying HTMLImageElement that serves as the visual source for all tiles.
    /**
     *  The image asset associated with this tile set instance.
     *  @type {HTMLImageElement}
     */
    this.image = image;


    // The total width of the tile set, derived directly from the provided image.
    /**
     *  The total width of the tile set, in pixels.
     *  This value is automatically extracted from the `image` property.
     *  @type {number}
     */
    this.width = image.width;


    // The total height of the tile set, also derived from the image.
    /**
     *  The total height of the tile set, in pixels.
     *  This value is automatically extracted from the `image` property.
     *  @type {number}
     */
    this.height = image.height;
  };


// Define the prototype properties for Fibula.TileSet.
// These are initial default values or placeholders.
Fibula.TileSet.prototype = {

  // Placeholder for the image. Will be set by the constructor.
  image:   false,

  // Placeholder for the width. Will be set by the constructor.
  width:   false,

  // Placeholder for the height. Will be set by the constructor.
  height:  false

};


/**
 *  Calculates and returns the {x, y} pixel coordinates of a specific tile
 *  within the tile set image, given its linear index and the tile dimensions.
 *
 *  @method        findCoordinates
 *  @memberOf      Fibula.TileSet.prototype
 *  @param  {number}   index       The zero-based linear index of the tile to find.
 *                                   For example, index 0 is the top-left tile,
 *                                   index 1 is the next tile to the right, and so on.
 *  @param  {number}   tileWidth   The width of an individual tile, in pixels.
 *  @param  {number}   tileHeight  The height of an individual tile, in pixels.
 *  @returns {{x: number, y: number}} An object containing the x and y coordinates
 *                                     (in pixels) of the top-left corner of the
 *                                     requested tile within the tile set image.
 */
Fibula.TileSet.prototype.findCoordinates = function ( index, tileWidth, tileHeight )
  {
    // Calculate how many tiles can fit in a single column of the tile set.
    var tilesPerColumn =   this.width   /   tileWidth,

    // Determine the column index (0-based) of the tile.
        tileX          =   Math.floor( index   /   tilesPerColumn ),

    // Determine the row index (0-based) of the tile.
        tileY          =   Math.floor( index   %   tilesPerColumn ),

    // Calculate the pixel x-coordinate of the tile's top-left corner.
        x              =   tileY       *   tileHeight,

    // Calculate the pixel y-coordinate of the tile's top-left corner.
        y              =   tileX       *   tileWidth;

    // Return the calculated coordinates as an object.
    return { x: x, y: y };
  };


// Ensure that the constructor property of the prototype points back to Fibula.TileSet.
// This is a standard practice for proper inheritance chaining in JavaScript.
Fibula.TileSet.prototype.constructor = Fibula.TileSet;