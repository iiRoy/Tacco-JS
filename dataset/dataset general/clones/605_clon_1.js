/*
 * Tiler v0.2.4
 *
 * This is an implementation of an endless grid of tiles.
 * See more at: https://github.com/borbit/tiler/
 *
 * (C) 2011-2015 Serge Borbit <serge.borbit@gmail.com>
 * All rights reserved under the MIT license.
 *
 * Please note: This file has been extensively modified for whitespace and comments
 * to create a Type I clone. The core logic remains absolutely identical.
 */

( function ( root ) {

    // Retrieve global dependencies if available.
    var $ = root.jQuery;
    var Grid = root.Grid;

    // Check for CommonJS environment and require modules if necessary.
    if ( typeof require !== 'undefined'
        && typeof module !== 'undefined'
        && module.exports
    ) {
        $ = require( 'jquery' );
        Grid = require( 'grid' );
    }


    /**
     * Tiler Constructor function.
     * Initializes a new Tiler instance.
     *
     * @param {jQuery|DOM} element The DOM element or jQuery object representing the viewport.
     * @param {Object} options Configuration options for the Tiler.
     */
    function Tiler( element, options ) {
        // Initialize options: extend default settings with user-provided custom options.
        this.options = $.extend( {}, Tiler.defaults, options );

        // A Grid instance to store and manage the tiles.
        this.tiles = new Grid();

        // Store the viewport element. Convert to jQuery object if it's a DOM element.
        this.element = element.jquery ? element : $( element );

        // Initial and current coordinates of the top-left visible tile.
        this.x = this.initX = this.options.x;
        this.y = this.initY = this.options.y;

        // Grid element's offset in tiles from the last refresh operation.
        this.gridOffsetX = 0;
        this.gridOffsetY = 0;

        // Create the grid container element. Append it to the viewport.
        this.grid = $( '<div/>' ).css( { 'position': 'absolute' } ).appendTo( this.element );

        // Calculate initial row and column counts based on viewport size.
        this.calcRowsColsCount();
        // Determine the coordinates of the corner tiles.
        this.calcCornersCoords();
        // Set the initial position of the grid element.
        this.setGridPosition();
    }


    /**
     * Default configuration options for Tiler instances.
     */
    Tiler.defaults = {
        fetch: null,      // Function to call when tiles need to be fetched.
        tileSize: null,   // Size of a single tile (width and height assumed equal).
        margin: 2,        // Number of extra tiles to fetch around the visible area.
        x: 0,             // Initial X coordinate.
        y: 0              // Initial Y coordinate.
    };


    // Alias for Tiler.prototype for brevity and cleaner code.
    var Proto = Tiler.prototype;


    /**
     * Resets the grid element's position to (0,0).
     * This is relative to its parent container (the viewport).
     *
     * @api private
     */
    Proto.setGridPosition = function () {
        this.grid.css( { left: 0, top: 0 } );
    };


    /**
     * Computes the grid's offset in terms of tiles.
     * This considers both the current absolute position and the previously recorded offset.
     *
     * @return {Object} An object containing the x and y offset in tiles.
     * @api private
     */
    Proto.calcGridOffset = function () {
        var pos = this.grid.position(); // Get current absolute position.
        var ts = this.options.tileSize; // Get tile size.

        // Adjust positive offsets to correctly account for partial tiles.
        pos.left > 0 && ( pos.left += ts );
        pos.top > 0 && ( pos.top += ts );

        // Calculate the actual tile offset.
        return {
            x: ~~( pos.left / ts ) - this.gridOffsetX,
            y: ~~( pos.top / ts ) - this.gridOffsetY
        };
    };


    /**
     * Refreshes the grid by removing hidden tiles and fetching new ones.
     * This method should be called after grid movement or viewport resizing.
     * It ensures only relevant tiles are displayed and loaded.
     *
     * @api public
     */
    Proto.refresh = function () {
        // Calculate the grid's movement offset.
        var offset = this.calcGridOffset();

        // Update current grid coordinates based on movement.
        this.x -= offset.x;
        this.y -= offset.y;

        // Accumulate the grid's total offset.
        this.gridOffsetX += offset.x;
        this.gridOffsetY += offset.y;

        // Recalculate grid dimensions and corner coordinates.
        this.calcRowsColsCount();
        this.calcCornersCoords();

        // Identify tiles that are now outside the visible grid.
        var removed = this.getHiddenTilesCoords();
        // Identify tiles that should be visible but are not yet loaded.
        var tofetch = this.getTilesCoordsToFetch();

        // If there are tiles to remove, proceed with removal.
        if ( removed.length ) {
            this.remove( removed );
        }
        // If new tiles are needed or tiles were removed, trigger a fetch.
        if ( tofetch.length || removed.length ) {
            this.fetchTiles( tofetch, removed );
        }
    };


    /**
     * Reloads all tiles that fall within the current grid area.
     * This effectively forces a re-fetch of all visible tiles.
     *
     * @api public
     */
    Proto.reload = function () {
        // Fetch all tiles that should be present, treating all as new.
        this.fetchTiles( this.getAllTilesCoords(), [] );
    };


    /**
     * Manages current grid coordinates.
     * If (x, y) are provided, it updates the grid's top-left visible tile coordinates,
     * re-initializes offsets, and triggers a refresh.
     * If no arguments are given, it returns the current coordinates.
     *
     * @param {Number} [x] The new X coordinate for the top-left tile.
     * @param {Number} [y] The new Y coordinate for the top-left tile.
     * @return {Object} An object {x: Number, y: Number} representing the current coordinates.
     * @api public
     */
    Proto.coords = function ( x, y ) {
        // If no arguments, return current coordinates.
        if ( !arguments.length ) {
            return { x: this.x, y: this.y };
        }

        // Set new initial and current coordinates.
        this.x = this.initX = x;
        this.y = this.initY = y;

        // Reset grid offsets.
        this.gridOffsetX = 0;
        this.gridOffsetY = 0;

        // Recalculate grid dimensions and corner coordinates.
        this.calcRowsColsCount();
        this.calcCornersCoords();
        // Reset grid element position.
        this.setGridPosition();

        // Identify tiles to be removed and fetched.
        var removed = this.getHiddenTilesCoords();
        var tofetch = this.getTilesCoordsToFetch();

        // Remove the identified hidden tiles.
        this.remove( removed );
        // Rearrange all remaining tiles to their correct positions.
        this.arrangeAll();

        // Fetch new tiles.
        this.fetchTiles( tofetch, removed );
    };


    /**
     * Displays tiles on the grid.
     * Can be called with individual tile coordinates and elements, or an array of tile data.
     *
     * Overloads:
     *   show(x, y, tile) - single tile
     *   @param {Number} x The X coordinate of the tile.
     *   @param {Number} y The Y coordinate of the tile.
     *   @param {jQuery|DOM|Array} elems The tile element(s) to display.
     *
     *   show(tiles) - array of tiles
     *   @param {Array} tiles Array of tile data, e.g., [[x1, y1, el1], [x2, y2, [el3, el4]]].
     *
     * @api public
     */
    Proto.show = function ( x, y, elems ) {
        // Create a document fragment for efficient DOM manipulation.
        var fragment = document.createDocumentFragment();
        // Normalize input: if 'x' is an array, assume it's the 'tiles' array.
        var tiles = $.isArray( x ) ? x : [ [x, y, elems] ];
        // Variable to hold elements for the current tile.
        var currentTileElems;

        // Iterate through all tiles to be shown.
        for ( var i = 0, l = tiles.length; i < l; i++ ) {
            x = tiles[i][0]; // Get X coordinate.
            y = tiles[i][1]; // Get Y coordinate.

            // Skip if the tile is not within the current grid boundaries.
            if ( !this.inGrid( x, y ) ) {
                continue;
            }

            currentTileElems = tiles[i][2];
            // Ensure currentTileElems is an array.
            currentTileElems = $.isArray( currentTileElems ) ? currentTileElems : [ currentTileElems ];
            // Convert all elements to jQuery objects.
            currentTileElems = $.map( currentTileElems, function ( elem ) {
                return elem.jquery ? elem : $( elem );
            } );

            // Append each element to the document fragment.
            $.each( currentTileElems, function ( i, elem ) {
                fragment.appendChild( elem.get( 0 ) );
            } );

            // Remove any existing tiles at these coordinates before adding new ones.
            this.remove( x, y );
            // Store the new elements in the grid.
            this.tiles.set( x, y, currentTileElems );
            // Arrange the position of the newly added tiles.
            this.arrange( x, y );
        }

        // Append the entire fragment to the grid element in one go.
        this.grid.append( fragment );
    };


    /**
     * Arranges the visual position of a single tile based on its coordinates.
     *
     * @param {Number} x The X coordinate of the tile.
     * @param {Number} y The Y coordinate of the tile.
     *
     * @api private
     */
    Proto.arrange = function ( x, y ) {
        var elems = this.tiles.get( x, y ); // Get the elements for the tile at (x, y).
        var ts = this.options.tileSize;     // Tile size.
        var ix = this.initX;                // Initial X coordinate of the grid.
        var iy = this.initY;                // Initial Y coordinate of the grid.

        // Apply CSS positioning to each element associated with this tile.
        $.each( elems, function ( i, elem ) {
            elem.css( {
                position: 'absolute',
                left: ( x - ix ) * ts, // Calculate left position.
                top: ( y - iy ) * ts   // Calculate top position.
            } );
        } );
    };


    /**
     * Arranges the position of all tiles currently managed by the Tiler.
     * Iterates through all stored tiles and calls `arrange` for each.
     *
     * @api private
     */
    Proto.arrangeAll = function () {
        var coords = this.tiles.coords(); // Get coordinates of all stored tiles.
        // Iterate backwards for potentially minor performance gain (not critical here).
        for ( var i = coords.length; i--; ) {
            this.arrange( coords[i][0], coords[i][1] );
        }
    };


    /**
     * Removes tiles from the grid.
     * Can remove a single tile by coordinates or multiple tiles via an array of coordinates.
     *
     * Overloads:
     *   remove(x, y) - removes a single tile
     *   @param {Number} x The X coordinate of the tile to remove.
     *   @param {Number} y The Y coordinate of the tile to remove.
     *
     *   remove(coords) - removes multiple tiles
     *   @param {Array} coords An array of [x, y] coordinate pairs to remove.
     *
     * @api private
     */
    Proto.remove = function ( x, y ) {
        // Normalize input: if 'x' is an array, assume it's 'coords'.
        var coords = $.isArray( x ) ? x : [ [x, y] ];

        // Iterate through each coordinate pair to remove.
        for ( var i = 0, l = coords.length; i < l; i++ ) {
            x = coords[i][0]; // Get X coordinate.
            y = coords[i][1]; // Get Y coordinate.

            var present = this.tiles.get( x, y ); // Check if tiles exist at these coordinates.

            if ( present ) {
                this.tiles.remove( x, y ); // Remove from internal grid storage.
                // Remove each associated DOM element.
                $.each( present, function ( i, elem ) {
                    elem.remove();
                } );
            }
        }
    };


    /**
     * Determines which tiles within the current grid area are not yet present in the `tiles` collection.
     *
     * @return {Array} An array of [x, y] coordinate pairs for tiles that need to be fetched.
     * @api private
     */
    Proto.getTilesCoordsToFetch = function () {
        var tofetch = []; // Initialize an empty array for coordinates to fetch.
        var all = this.getAllTilesCoords(); // Get all coordinates that *should* be in the grid.
        var x, y; // Variables for current tile coordinates.

        // Iterate through all desired tiles.
        for ( var i = 0, l = all.length; i < l; i++ ) {
            x = all[i][0];
            y = all[i][1];

            // If a tile is not currently in our `tiles` collection, add it to `tofetch`.
            if ( !this.tiles.get( x, y ) ) {
                tofetch.push( [x, y] );
            }
        }
        return tofetch;
    };


    /**
     * Identifies tiles currently in the `tiles` collection that are no longer within the visible grid area.
     * These tiles are considered "hidden" and might need to be removed.
     *
     * @return {Array} An array of [x, y] coordinate pairs for tiles that are now hidden.
     * @api private
     */
    Proto.getHiddenTilesCoords = function () {
        var coords = []; // Array to store coordinates of hidden tiles.
        var self = this; // Maintain reference to `this` for use in callback.

        // Iterate over all tiles currently stored in the grid.
        this.tiles.each( function ( tile, x, y ) {
            // If a tile is outside the current grid boundaries, add its coordinates to the list.
            if ( !self.inGrid( x, y ) ) {
                coords.push( [x, y] );
            }
        } );
        return coords;
    };


    /**
     * Generates a list of all [x, y] coordinates that fall within the current grid area.
     * This includes the visible area plus the margin.
     *
     * @return {Array} An array of [x, y] coordinate pairs representing all tiles in the grid area.
     * @api private
     */
    Proto.getAllTilesCoords = function () {
        var coords = []; // Initialize array to hold all coordinates.

        // Loop through the Y coordinates from the top corner to the bottom corner.
        for ( var y = this.corners.y1; y <= this.corners.y2; y++ ) {
            // For each Y coordinate, loop through the X coordinates from left to right.
            for ( var x = this.corners.x1; x <= this.corners.x2; x++ ) {
                coords.push( [x, y] ); // Add the [x, y] pair to the list.
            }
        }
        return coords;
    };


    /**
     * Triggers the `fetch` callback function defined in options, if it exists.
     * This function is responsible for loading new tile data.
     *
     * @param {Array} tofetch An array of [x, y] coordinates of tiles that need to be fetched.
     * @param {Array} removed An array of [x, y] coordinates of tiles that were removed/hidden.
     * @api private
     */
    Proto.fetchTiles = function ( tofetch, removed ) {
        // Check if a fetch function is provided in the options and if it's a valid function.
        if ( $.isFunction( this.options.fetch ) ) {
            this.options.fetch( tofetch, removed ); // Call the fetch function.
        }
    };


    /**
     * Calculates the number of columns required for the current viewport size,
     * including the specified margin.
     *
     * @return {Number} The calculated number of columns, or 0 if width or tileSize is missing.
     * @api private
     */
    Proto.calcColsCount = function () {
        var width = this.element.width(); // Get the width of the viewport element.
        var op = this.options;             // Shorthand for options.

        // If width and tileSize are valid, calculate columns.
        if ( width && op.tileSize ) {
            return Math.ceil( width / op.tileSize ) + op.margin * 2;
        }
        return 0; // Return 0 if calculation is not possible.
    };


    /**
     * Calculates the number of rows required for the current viewport size,
     * including the specified margin.
     *
     * @return {Number} The calculated number of rows, or 0 if height or tileSize is missing.
     * @api private
     */
    Proto.calcRowsCount = function () {
        var height = this.element.height(); // Get the height of the viewport element.
        var op = this.options;              // Shorthand for options.

        // If height and tileSize are valid, calculate rows.
        if ( height && op.tileSize ) {
            return Math.ceil( height / op.tileSize ) + op.margin * 2;
        }
        return 0; // Return 0 if calculation is not possible.
    };


    /**
     * Calculates and updates the `rowsCount` and `colsCount` properties of the Tiler instance.
     *
     * @api private
     */
    Proto.calcRowsColsCount = function () {
        this.rowsCount = this.calcRowsCount(); // Set the number of rows.
        this.colsCount = this.calcColsCount(); // Set the number of columns.
    };


    /**
     * Calculates and updates the coordinates of the four corner tiles of the grid area.
     * This defines the extent of the grid, including the margin.
     *
     * @api private
     */
    Proto.calcCornersCoords = function () {
        var x1 = this.x - this.options.margin; // Calculate top-left X coordinate.
        var y1 = this.y - this.options.margin; // Calculate top-left Y coordinate.

        // Store the corner coordinates in an object.
        this.corners = {
            x1: x1,
            y1: y1,
            x2: x1 + this.colsCount - 1, // Calculate bottom-right X coordinate.
            y2: y1 + this.rowsCount - 1  // Calculate bottom-right Y coordinate.
        };
    };


    /**
     * Checks if a given tile coordinate (x, y) falls within the current grid area.
     *
     * @param {Number} x The X coordinate of the tile to check.
     * @param {Number} y The Y coordinate of the tile to check.
     * @return {Boolean} True if the tile is within the grid, false otherwise.
     */
    Proto.inGrid = function ( x, y ) {
        // Check if y is outside the vertical bounds OR x is outside the horizontal bounds.
        if ( y < this.corners.y1 || y > this.corners.y2 ||
            x < this.corners.x1 || x > this.corners.x2
        ) {
            return false; // Tile is out of bounds.
        }
        return true; // Tile is within the grid.
    };


    // Exporting the Tiler module based on the environment.
    // This section handles CommonJS, AMD, and global object exports.
    if ( typeof exports !== 'undefined' ) {
        if ( typeof module !== 'undefined' && module.exports ) {
            exports = module.exports = Tiler; // CommonJS export.
        }
        exports.Tiler = Tiler; // Also export Tiler as a named property.
    } else if ( typeof define === 'function' && define.amd ) {
        // AMD (Asynchronous Module Definition) export.
        define( [], function () {
            return Tiler;
        } );
    } else {
        // Global object export (e.g., browser window).
        root['Tiler'] = Tiler;
    }

} )( this );