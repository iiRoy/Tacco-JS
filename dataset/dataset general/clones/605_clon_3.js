/**
 * GridManager 1.0.0
 *
 * An adaptable grid system for displaying spatial data.
 * Inspired by https://github.com/borbit/tiler/
 *
 * (c) 2011-2023 [Original Author Name/Organization]
 *
 * Licensed under the MIT license.
 */

(function (globalContext) {
  'use strict';

  // Acquire primary dependencies from the global scope.
  let domUtility = globalContext.jQuery;
  let SpatialGrid = globalContext.Grid;

  // Alternatively, attempt to load dependencies via CommonJS/Node.js if available.
  if (typeof require === 'function' && typeof module !== 'undefined' && module.exports) {
    try {
      domUtility = require('jquery');
      SpatialGrid = require('grid');
    } catch (dependencyError) {
      console.error('GridManager: Failed to load dependencies via require(). Ensure jQuery and Grid are installed.', dependencyError);
      return; // Exit if critical dependencies cannot be loaded
    }
  }

  // Basic validation for dependencies
  if (!domUtility || !SpatialGrid) {
    console.error('GridManager: Essential dependencies (jQuery, Grid) are not available. Initialization aborted.');
    return;
  }

  /**
   * The main constructor for the GridManager component.
   * Manages a dynamic grid of spatial units within a viewport.
   *
   * @param {domUtility|HTMLElement} containerEl - The DOM element or jQuery object serving as the viewport.
   * @param {Object} componentConfig - Configuration options for this GridManager instance.
   */
  function GridManager(containerEl, componentConfig) {
    // Merge provided configuration with default settings.
    this.componentConfig = domUtility.extend({}, GridManager.DEFAULT_CONFIG, componentConfig);

    // Validate essential configuration parameters.
    if (!this.componentConfig.unitSize || this.componentConfig.unitSize <= 0) {
      console.error('GridManager: "unitSize" must be a positive number.');
      throw new Error('Invalid unitSize configuration.');
    }

    // Storage for all managed spatial units.
    this.spatialMap = new SpatialGrid();

    // Reference to the viewport element, ensuring it's a jQuery object.
    this.containerEl = containerEl.jquery ? containerEl : domUtility(containerEl);

    // Initial and current top-left coordinates of the visible grid section.
    this.initialXCoord = this.componentConfig.x;
    this.initialYCoord = this.componentConfig.y;
    this.currentXPos = this.initialXCoord;
    this.currentYPos = this.initialYCoord;

    // Accumulated pixel offset of the inner grid content relative to the viewport.
    this.totalXShift = 0;
    this.totalYShift = 0;

    // Create the inner grid container and append it to the viewport.
    // This element will house all individual spatial units.
    this.innerGridContainer = domUtility('<div/>')
      .addClass('grid-manager-inner-container') // Add a class for styling/identification
      .css({ 'position': 'absolute', 'overflow': 'hidden' }) // Ensure proper positioning context
      .appendTo(this.containerEl);

    // Perform initial calculations and positioning.
    this.updateGridDimensions();
    this.calculateVisibleBoundaryCoords();
    this.resetContainerPosition();

    // Optionally, emit an event after initialization (e.g., using a custom event system)
    // this.containerEl.trigger('gridmanager:initialized', [this]);
  }

  /**
   * Default configuration options for all GridManager instances.
   */
  GridManager.DEFAULT_CONFIG = {
    dataFetcher: null, // Function to call when new tile data is needed.
    unitSize: 64,      // The pixel dimension of a single square tile.
    viewportPadding: 2, // Number of extra tiles to load around the visible area.
    x: 0,              // Initial X-coordinate for the top-left visible tile.
    y: 0               // Initial Y-coordinate for the top-left visible tile.
  };

  // Assign the prototype for convenience and brevity.
  const GMProto = GridManager.prototype;

  /**
   * Resets the visual position of the inner grid container to its origin.
   * This effectively aligns the container's top-left corner with the viewport's top-left.
   *
   * @private
   */
  GMProto.resetContainerPosition = function () {
    this.innerGridContainer.css({ left: 0, top: 0 });
  };

  /**
   * Determines the shift in grid coordinates based on the inner container's current
   * absolute pixel position relative to its last known offset.
   *
   * @returns {Object} An object containing the calculated X and Y coordinate shifts.
   * @private
   */
  GMProto.determineSpatialShift = function () {
    const currentContainerPos = this.innerGridContainer.position();
    const currentUnitSize = this.componentConfig.unitSize;

    // Adjust position values if they are positive to ensure correct floor division for offsets.
    let adjustedLeft = currentContainerPos.left;
    let adjustedTop = currentContainerPos.top;

    if (adjustedLeft > 0) {
      adjustedLeft += currentUnitSize;
    }
    if (adjustedTop > 0) {
      adjustedTop += currentUnitSize;
    }

    const xShift = Math.floor(adjustedLeft / currentUnitSize) - this.totalXShift;
    const yShift = Math.floor(adjustedTop / currentUnitSize) - this.totalYShift;

    return { x: xShift, y: yShift };
  };

  /**
   * Recalculates visible grid boundaries, removes off-screen tiles,
   * and requests new data for newly visible areas.
   * This method should be called after grid movement or viewport resizing.
   *
   * @api public
   */
  GMProto.updateView = function () {
    const coordinateShift = this.determineSpatialShift();

    // Update the current logical grid position based on the detected shift.
    this.currentXPos -= coordinateShift.x;
    this.currentYPos -= coordinateShift.y;

    // Accumulate the total shift for future calculations.
    this.totalXShift += coordinateShift.x;
    this.totalYShift += coordinateShift.y;

    // Re-evaluate grid dimensions and visible coordinate range.
    this.updateGridDimensions();
    this.calculateVisibleBoundaryCoords();

    // Identify tiles that are no longer visible and those that are newly needed.
    const offscreenLocations = this.findOffscreenTileLocations();
    const newTileLocations = this.identifyMissingTileLocations();

    // Process removals first.
    if (offscreenLocations.length > 0) {
      this.clearTiles(offscreenLocations);
    }

    // Request new tile data if needed, or if any tiles were removed (to potentially re-fetch).
    if (newTileLocations.length > 0 || offscreenLocations.length > 0) {
      this.requestTileData(newTileLocations, offscreenLocations);
    }
  };

  /**
   * Forces a complete re-fetch of all tiles within the current visible grid area.
   * Existing tiles in the `spatialMap` that fall within the current view will be treated as missing
   * and their data requested again.
   *
   * @api public
   */
  GMProto.repopulateAllTiles = function () {
    const allVisibleTileCoords = this.calculateVisibleTileLocations();
    // In a reload, we conceptually remove all current tiles to force a re-fetch.
    // However, we don't actually remove them from the DOM until new ones arrive.
    // The `requestTileData` will then handle replacing existing elements.
    this.requestTileData(allVisibleTileCoords, []); // Pass empty array for removed, as nothing was explicitly removed yet.
  };

  /**
   * Sets the current logical coordinates of the top-left visible tile,
   * triggering a refresh of the grid. If no arguments are provided,
   * it returns the current coordinates.
   *
   * @param {Number} [newX] - The new X-coordinate for the top-left tile.
   * @param {Number} [newY] - The new Y-coordinate for the top-left tile.
   * @returns {Object} An object containing the current X and Y coordinates.
   * @api public
   */
  GMProto.manageCoordinates = function (newX, newY) {
    if (arguments.length === 0) {
      return { x: this.currentXPos, y: this.currentYPos };
    }

    // Validate inputs
    if (typeof newX !== 'number' || typeof newY !== 'number' || !Number.isInteger(newX) || !Number.isInteger(newY)) {
      console.warn('GridManager: Invalid coordinates provided to manageCoordinates. Must be integers.');
      return { x: this.currentXPos, y: this.currentYPos }; // Return current without changing
    }

    this.currentXPos = this.initialXCoord = newX;
    this.currentYPos = this.initialYCoord = newY;

    // Reset accumulated pixel shifts as we are moving to a new logical origin.
    this.totalXShift = 0;
    this.totalYShift = 0;

    // Re-calculate grid dimensions and visible boundaries.
    this.updateGridDimensions();
    this.calculateVisibleBoundaryCoords();
    this.resetContainerPosition();

    // Identify tiles to remove and tiles to fetch for the new view.
    const tilesToDiscard = this.findOffscreenTileLocations();
    const tilesToAcquire = this.identifyMissingTileLocations();

    // Remove old tiles before arranging existing ones and fetching new.
    this.clearTiles(tilesToDiscard);
    this.repositionAllDisplayedTiles(); // Re-arrange existing tiles relative to new origin.

    this.requestTileData(tilesToAcquire, tilesToDiscard);

    return { x: this.currentXPos, y: this.currentYPos }; // Return the newly set coordinates
  };

  /**
   * Displays one or more spatial units (tiles) on the grid.
   *
   * This method can be called in two ways:
   * 1. `displayTiles(x, y, elements)`: To display a single tile at (x, y).
   * 2. `displayTiles(tileDataArray)`: To display multiple tiles using an array of `[x, y, elements]` tuples.
   *
   * @param {Number|Array} x - The x-coordinate of the tile, or an array of tile data.
   * @param {Number} [y] - The y-coordinate of the tile (if `x` is a number).
   * @param {domUtility|HTMLElement|Array<domUtility|HTMLElement>} [elements] - The DOM element(s) to display as the tile content.
   * @api public
   */
  GMProto.displayTiles = function (x, y, elements) {
    const fragment = document.createDocumentFragment();
    const tileInputData = Array.isArray(x) ? x : [[x, y, elements]];

    tileInputData.forEach(tileEntry => {
      const tileX = tileEntry[0];
      const tileY = tileEntry[1];
      let tileElements = tileEntry[2];

      // Skip if the tile is not within the currently visible grid area.
      if (!this.isTileVisible(tileX, tileY)) {
        return;
      }

      // Ensure tileElements is an array of jQuery objects.
      tileElements = Array.isArray(tileElements) ? tileElements : [tileElements];
      tileElements = tileElements.map(el => domUtility(el)); // Convert to jQuery objects.

      // Pre-process elements: add attributes, append to fragment
      tileElements.forEach(elem => {
        if (elem && elem.length) { // Ensure element is valid and exists
          elem.attr({ 'data-tile-x': tileX, 'data-tile-y': tileY });
          fragment.appendChild(elem[0]); // Append the raw DOM element to the fragment
        }
      });

      // Remove any existing tile at this location before setting the new one.
      this.clearTiles(tileX, tileY);
      this.spatialMap.set(tileX, tileY, tileElements);
      this.positionTileElement(tileX, tileY);
    });

    // Append all new elements to the DOM in a single operation.
    if (fragment.children.length > 0) {
      this.innerGridContainer.append(fragment);
    }
  };

  /**
   * Sets the absolute CSS position for a specific tile's elements.
   * The position is calculated relative to the `innerGridContainer`.
   *
   * @param {Number} tileX - The X-coordinate of the tile.
   * @param {Number} tileY - The Y-coordinate of the tile.
   * @private
   */
  GMProto.positionTileElement = function (tileX, tileY) {
    const tileContentElements = this.spatialMap.get(tileX, tileY);
    const currentUnitSize = this.componentConfig.unitSize;
    const initialGridX = this.initialXCoord;
    const initialGridY = this.initialYCoord;

    if (!tileContentElements) {
      return; // No elements to position at this coordinate.
    }

    // Calculate the pixel offset for this tile based on its grid coordinates.
    const pixelLeft = (tileX - initialGridX) * currentUnitSize;
    const pixelTop = (tileY - initialGridY) * currentUnitSize;

    tileContentElements.forEach(element => {
      element.css({
        position: 'absolute',
        left: `${pixelLeft}px`,
        top: `${pixelTop}px`
      });
    });
  };

  /**
   * Iterates through all currently managed tiles and updates their visual positions
   * based on the current `initialXCoord` and `initialYCoord`.
   *
   * @private
   */
  GMProto.repositionAllDisplayedTiles = function () {
    const allManagedTileCoords = this.spatialMap.coords();
    for (let i = allManagedTileCoords.length - 1; i >= 0; i--) {
      const [x, y] = allManagedTileCoords[i];
      this.positionTileElement(x, y);
    }
  };

  /**
   * Removes tiles from both the `spatialMap` and the DOM.
   * This method can be called in two ways:
   * 1. `clearTiles(x, y)`: To remove a single tile at (x, y).
   * 2. `clearTiles(coordinatesArray)`: To remove multiple tiles specified by an array of `[x, y]` tuples.
   *
   * @param {Number|Array} x - The x-coordinate of the tile, or an array of `[x, y]` coordinate pairs.
   * @param {Number} [y] - The y-coordinate of the tile (if `x` is a number).
   * @api private
   */
  GMProto.clearTiles = function (x, y) {
    const coordinateList = Array.isArray(x) ? x : [[x, y]];

    coordinateList.forEach(([coordX, coordY]) => {
      const existingElements = this.spatialMap.get(coordX, coordY);

      if (existingElements && existingElements.length > 0) {
        this.spatialMap.remove(coordX, coordY); // Remove from internal data structure
        existingElements.forEach(elem => {
          if (elem && elem.remove) {
            elem.remove(); // Remove from the DOM
          }
        });
      }
    });
  };

  /**
   * Generates a list of coordinates for tiles that *should* be visible
   * according to `calculateVisibleTileLocations` but are not currently
   * present in the `spatialMap`. These are candidates for fetching.
   *
   * @returns {Array<Array<Number>>} An array of `[x, y]` coordinate pairs for missing tiles.
   * @api private
   */
  GMProto.identifyMissingTileLocations = function () {
    const tilesToFetch = [];
    const allRequiredCoords = this.calculateVisibleTileLocations();

    for (const [x, y] of allRequiredCoords) {
      if (!this.spatialMap.get(x, y)) {
        tilesToFetch.push([x, y]);
      }
    }
    return tilesToFetch;
  };

  /**
   * Returns an array of coordinates for tiles that are currently
   * managed by the `spatialMap` but fall outside the visible grid boundaries.
   * These tiles are candidates for removal.
   *
   * @returns {Array<Array<Number>>} An array of `[x, y]` coordinate pairs for off-screen tiles.
   * @api private
   */
  GMProto.findOffscreenTileLocations = function () {
    const offscreenCoords = [];
    this.spatialMap.each((tileData, x, y) => {
      if (!this.isTileVisible(x, y)) {
        offscreenCoords.push([x, y]);
      }
    });
    return offscreenCoords;
  };

  /**
   * Calculates and returns an array of all `[x, y]` coordinates
   * that fall within the currently determined visible grid area,
   * including the configured `viewportPadding`.
   *
   * @returns {Array<Array<Number>>} An array of `[x, y]` coordinate pairs for all tiles in the visible region.
   * @api private
   */
  GMProto.calculateVisibleTileLocations = function () {
    const visibleCoords = [];
    const currentCorners = this.corners;

    for (let y = currentCorners.y1; y <= currentCorners.y2; y++) {
      for (let x = currentCorners.x1; x <= currentCorners.x2; x++) {
        visibleCoords.push([x, y]);
      }
    }
    return visibleCoords;
  };

  /**
   * Invokes the registered `dataFetcher` callback function to request tile data.
   *
   * @param {Array<Array<Number>>} locationsToAcquire - An array of `[x, y]` coordinates for tiles that need to be fetched.
   * @param {Array<Array<Number>>} locationsDiscarded - An array of `[x, y]` coordinates for tiles that were removed from the grid.
   * @api private
   */
  GMProto.requestTileData = function (locationsToAcquire, locationsDiscarded) {
    const fetchHandler = this.componentConfig.dataFetcher;

    if (typeof fetchHandler === 'function') {
      // Pass both arrays to the fetcher, allowing it to optimize requests.
      // E.g., a fetcher might cancel requests for discarded tiles.
      fetchHandler(locationsToAcquire, locationsDiscarded);
    } else if (locationsToAcquire.length > 0) {
      console.warn('GridManager: No dataFetcher function configured, but new tiles are needed.');
    }
  };

  /**
   * Computes the number of columns required to fill the viewport,
   * including the `viewportPadding`.
   *
   * @returns {Number} The calculated number of columns.
   * @api private
   */
  GMProto.computeColumnCount = function () {
    const viewportWidth = this.containerEl.width();
    const config = this.componentConfig;

    if (viewportWidth <= 0 || config.unitSize <= 0) {
      return 0; // Cannot calculate if dimensions are invalid.
    }

    const columns = Math.ceil(viewportWidth / config.unitSize) + (config.viewportPadding * 2);
    return columns;
  };

  /**
   * Computes the number of rows required to fill the viewport,
   * including the `viewportPadding`.
   *
   * @returns {Number} The calculated number of rows.
   * @api private
   */
  GMProto.computeRowCount = function () {
    const viewportHeight = this.containerEl.height();
    const config = this.componentConfig;

    if (viewportHeight <= 0 || config.unitSize <= 0) {
      return 0; // Cannot calculate if dimensions are invalid.
    }

    const rows = Math.ceil(viewportHeight / config.unitSize) + (config.viewportPadding * 2);
    return rows;
  };

  /**
   * Updates the internal `rowsCount` and `colsCount` properties
   * by calling their respective calculation methods.
   *
   * @api private
   */
  GMProto.updateGridDimensions = function () {
    this.rowsCount = this.computeRowCount();
    this.colsCount = this.computeColumnCount();
  };

  /**
   * Calculates and stores the logical coordinates of the four corners
   * of the currently visible grid area (including padding).
   *
   * @api private
   */
  GMProto.calculateVisibleBoundaryCoords = function () {
    const padding = this.componentConfig.viewportPadding;
    const currentX = this.currentXPos;
    const currentY = this.currentYPos;

    // Top-left visible tile coordinates, adjusted by padding.
    const boundaryX1 = currentX - padding;
    const boundaryY1 = currentY - padding;

    this.corners = {
      x1: boundaryX1,
      y1: boundaryY1,
      // Bottom-right visible tile coordinates.
      x2: boundaryX1 + this.colsCount - 1,
      y2: boundaryY1 + this.rowsCount - 1
    };
  };

  /**
   * Checks if a given tile coordinate `(x, y)` falls within the
   * currently defined visible grid boundaries (including padding).
   *
   * @param {Number} tileX - The X-coordinate of the tile to check.
   * @param {Number} tileY - The Y-coordinate of the tile to check.
   * @returns {Boolean} `true` if the tile is visible, `false` otherwise.
   */
  GMProto.isTileVisible = function (tileX, tileY) {
    const boundary = this.corners;
    if (tileY < boundary.y1 || tileY > boundary.y2 ||
      tileX < boundary.x1 || tileX > boundary.x2) {
      return false;
    }
    return true;
  };

  // --- Module Exporting Logic ---

  // Export for CommonJS environments (Node.js, Browserify, Webpack)
  if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = GridManager;
    exports.GridManager = GridManager; // Also export as a named property
  }
  // Export for AMD environments (RequireJS)
  else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return GridManager;
    });
  }
  // Export to the global context (e.g., browser window)
  else {
    globalContext['GridManager'] = GridManager;
  }

})(this);