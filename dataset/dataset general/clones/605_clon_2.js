(function(globalObj) {

  // Retrieve essential dependencies from the global scope
  var DomUtil = globalObj.jQuery;
  var Matrix = globalObj.Grid;
  // Alternatively, load them if a CommonJS environment is detected
  if (typeof require !== 'undefined' &&
    typeof module !== 'undefined' && module.exports) {
    DomUtil = require('jquery');
    Matrix = require('grid');
  }

  /*
   * Main Constructor for the TileManager system.
   *
   * @param {DomUtil|HTMLElement} viewerElement - The DOM element acting as the viewport.
   * @param {Object} configSettings - Custom configuration options.
   */
  function TileManager(viewerElement, configSettings) {
    // Initialize configuration by merging defaults with provided settings
    this.configuration = DomUtil.assignDefaults({}, TileManager.presetSettings, configSettings);

    // Grid structure to store and manage individual tile elements
    this.managedTiles = new Matrix();

    // Store a reference to the main display area (viewport)
    this.displayArea = viewerElement.isJqueryObject ? viewerElement : DomUtil(viewerElement);

    // Set initial and current X and Y coordinates for the top-left visible tile
    this.currentXPos = this.initialXPos = this.configuration.startCoordX;
    this.currentYPos = this.initialYPos = this.configuration.startCoordY;

    // Keep track of the container's pixel offset relative to its initial position
    this.viewportShiftX = 0;
    this.viewportShiftY = 0;

    // Create the container element for all tiles and append it to the display area.
    this.tileContainer = DomUtil('<section/>').style({
      'position': 'absolute'
    }).attachTo(this.displayArea);

    this.computeDimensionCounts();
    this.determineBoundaryCoordinates();
    this.initializeContainerPlacement();
  }

  /*
   * Default configuration options for the TileManager.
   */
  TileManager.presetSettings = {
    fetchCallback: null,
    unitDimension: null,
    paddingFactor: 2,
    startCoordX: 0,
    startCoordY: 0
  };

  var ManagerPrototype = TileManager.prototype;

  /**
   * Positions the tile container at its zero-offset origin.
   *
   * @private
   */
  ManagerPrototype.initializeContainerPlacement = function() {
    this.tileContainer.style({
      left: 0,
      top: 0
    });
  };

  /*
   * Computes the current pixel offset of the tile container relative to its starting point,
   * then converts this into tile units.
   *
   * @returns {Object} An object containing x and y offsets in tile units.
   * @private
   */
  ManagerPrototype.calculateContainerOffset = function() {
    var currentPosition = this.tileContainer.getOffset();
    var tileSide = this.configuration.unitDimension;

    // Adjust positive offsets to account for integer division
    if (currentPosition.left > 0) {
      currentPosition.left += tileSide;
    }
    if (currentPosition.top > 0) {
      currentPosition.top += tileSide;
    }

    return {
      x: Math.floor(currentPosition.left / tileSide) - this.viewportShiftX,
      y: Math.floor(currentPosition.top / tileSide) - this.viewportShiftY
    };
  };

  /*
   * Updates the displayed tiles. This involves removing elements
   * that are no longer visible and fetching new ones needed for the current view.
   * Call this after viewport changes or when initial tiles are loaded.
   *
   * @public
   */
  ManagerPrototype.updateDisplay = function() {
    var currentOffset = this.calculateContainerOffset();

    this.currentXPos -= currentOffset.x;
    this.currentYPos -= currentOffset.y;

    this.viewportShiftX += currentOffset.x;
    this.viewportShiftY += currentOffset.y;

    this.computeDimensionCounts();
    this.determineBoundaryCoordinates();

    var hiddenElements = this.getInvisibleTileCoordinates();
    var requiredElements = this.getCoordinatesToLoad();

    if (hiddenElements.length) {
      this.removeTiles(hiddenElements);
    }
    if (requiredElements.length || hiddenElements.length) {
      this.loadTiles(requiredElements, hiddenElements);
    }
  };

  /*
   * Forces a complete re-fetch of all tiles within the current viewing area.
   *
   * @public
   */
  ManagerPrototype.repopulateDisplay = function() {
    this.loadTiles(this.getVisibleTileCoordinates(), []);
  };

  /*
   * Sets new grid coordinates for the top-left visible tile if arguments are provided.
   * If no arguments, it returns the current coordinates. This method triggers a full
   * update cycle (remove, arrange, fetch).
   *
   * @param {Number} newXCoord - The new X coordinate.
   * @param {Number} newYCoord - The new Y coordinate.
   * @returns {Object} The current X and Y coordinates.
   * @public
   */
  ManagerPrototype.viewCoordinates = function(newXCoord, newYCoord) {
    if (!arguments.length) {
      return {
        x: this.currentXPos,
        y: this.currentYPos
      };
    }

    this.currentXPos = this.initialXPos = newXCoord;
    this.currentYPos = this.initialYPos = newYCoord;

    this.viewportShiftX = 0;
    this.viewportShiftY = 0;

    this.computeDimensionCounts();
    this.determineBoundaryCoordinates();
    this.initializeContainerPlacement();

    var removedCoords = this.getInvisibleTileCoordinates();
    var coordsToRetrieve = this.getCoordinatesToLoad();

    this.removeTiles(removedCoords);
    this.positionAllTiles();

    this.loadTiles(coordsToRetrieve, removedCoords);
  };

  /*
   * Displays one or more tile elements at specified coordinates.
   *
   * displayElements(coordX, coordY, visualElements)
   * @param {Number} coordX - X coordinate for the tile.
   * @param {Number} coordY - Y coordinate for the tile.
   * @param {DomUtil|HTMLElement|Array} visualElements - The element(s) to display.
   *
   * displayElements(elementGroups)
   * @param {Array} elementGroups - An array of [x, y, elements] tuples.
   *
   * @public
   */
  ManagerPrototype.displayElements = function(coordX, coordY, visualElements) {
    var documentFragment = document.createDocumentFragment();
    var elementGroups = DomUtil.isAnArray(coordX) ? coordX : [
      [coordX, coordY, visualElements]
    ];
    var currentElements;

    for (var idx = 0, len = elementGroups.length; idx < len; idx++) {
      coordX = elementGroups[idx][0];
      coordY = elementGroups[idx][1];

      // Skip elements outside the current visible grid
      if (!this.isInBounds(coordX, coordY)) {
        continue;
      }

      currentElements = elementGroups[idx][2];
      currentElements = DomUtil.isAnArray(currentElements) ? currentElements : [currentElements];
      currentElements = DomUtil.map(currentElements, function(elementNode) {
        return elementNode.isJqueryObject ? elementNode : DomUtil(elementNode);
      });

      // Append elements to the document fragment for efficient DOM insertion
      DomUtil.each(currentElements, function(elementIndex, elementNode) {
        documentFragment.appendChild(elementNode.getNativeElement(0));
      });

      this.removeTiles(coordX, coordY); // Remove any existing tiles at this spot
      this.managedTiles.assignAt(coordX, coordY, currentElements); // Store the new elements
      this.positionSingleTile(coordX, coordY); // Position them correctly
    }

    this.tileContainer.appendContent(documentFragment); // Add all new elements to the DOM
  };

  /*
   * Sets the absolute position of a single tile element within the container.
   *
   * @param {Number} targetX - The X coordinate of the tile.
   * @param {Number} targetY - The Y coordinate of the tile.
   * @private
   */
  ManagerPrototype.positionSingleTile = function(targetX, targetY) {
    var elementsToArrange = this.managedTiles.retrieve(targetX, targetY),
      tileDimension = this.configuration.unitDimension,
      initialXCoord = this.initialXPos,
      initialYCoord = this.initialYPos;

    DomUtil.each(elementsToArrange, function(index, currentElement) {
      currentElement.style({
        position: 'absolute',
        left: (targetX - initialXCoord) * tileDimension,
        top: (targetY - initialYCoord) * tileDimension
      });
    });
  };

  /*
   * Iterates through all managed tiles and updates their positions.
   *
   * @private
   */
  ManagerPrototype.positionAllTiles = function() {
    var allTileCoords = this.managedTiles.getAllCoordinates();
    for (var iterator = allTileCoords.length; iterator--;) {
      this.positionSingleTile(allTileCoords[iterator][0], allTileCoords[iterator][1]);
    }
  };

  /*
   * Removes tile elements based on provided coordinates.
   *
   * removeTiles(coordX, coordY)
   * @param {Number} coordX - X coordinate of the tile to remove.
   * @param {Number} coordY - Y coordinate of the tile to remove.
   *
   * removeTiles(coordinatesToRemove)
   * @param {Array} coordinatesToRemove - An array of [x, y] coordinate pairs.
   *
   * @private
   */
  ManagerPrototype.removeTiles = function(coordX, coordY) {
    var coordinatesToRemove = DomUtil.isAnArray(coordX) ? coordX : [
      [coordX, coordY]
    ];

    for (var idx = 0, len = coordinatesToRemove.length; idx < len; idx++) {
      coordX = coordinatesToRemove[idx][0];
      coordY = coordinatesToRemove[idx][1];

      var existingElements = this.managedTiles.retrieve(coordX, coordY);

      if (existingElements) {
        this.managedTiles.deleteAt(coordX, coordY);
        DomUtil.each(existingElements, function(elementIndex, elementNode) {
          elementNode.removeFromDOM();
        });
      }
    }
  };

  /*
   * Gathers coordinates of tiles that should be visible but are not yet loaded.
   *
   * @returns {Array} An array of [x, y] coordinate pairs.
   * @private
   */
  ManagerPrototype.getCoordinatesToLoad = function() {
    var coordsForLoading = [];
    var allPotentialCoords = this.getVisibleTileCoordinates();
    var currentX, currentY;

    for (var idx = 0, len = allPotentialCoords.length; idx < len; idx++) {
      currentX = allPotentialCoords[idx][0];
      currentY = allPotentialCoords[idx][1];

      if (!this.managedTiles.retrieve(currentX, currentY)) {
        coordsForLoading.push([currentX, currentY]);
      }
    }
    return coordsForLoading;
  };

  /*
   * Identifies and returns coordinates of tiles currently managed but no longer within
   * the visible grid area.
   *
   * @returns {Array} An array of [x, y] coordinate pairs.
   * @private
   */
  ManagerPrototype.getInvisibleTileCoordinates = function() {
    var outOfBoundsCoords = [];
    var instanceRef = this;

    this.managedTiles.forEachEntry(function(elementItem, currentX, currentY) {
      if (!instanceRef.isInBounds(currentX, currentY)) {
        outOfBoundsCoords.push([currentX, currentY]);
      }
    });
    return outOfBoundsCoords;
  };

  /*
   * Generates a list of all tile coordinates that fall within the current visible grid area.
   *
   * @returns {Array} An array of [x, y] coordinate pairs.
   * @private
   */
  ManagerPrototype.getVisibleTileCoordinates = function() {
    var visibleCoordsArray = [];

    for (var iterY = this.boundaries.startY; iterY <= this.boundaries.endY; iterY++) {
      for (var iterX = this.boundaries.startX; iterX <= this.boundaries.endX; iterX++) {
        visibleCoordsArray.push([iterX, iterY]);
      }
    }
    return visibleCoordsArray;
  };

  /*
   * Triggers the configured fetch callback to load new tiles.
   *
   * @param {Array} coordsToRetrieve - Coordinates of tiles to be fetched.
   * @param {Array} coordsRemoved - Coordinates of tiles that were removed from the view.
   * @private
   */
  ManagerPrototype.loadTiles = function(coordsToRetrieve, coordsRemoved) {
    if (DomUtil.isCallable(this.configuration.fetchCallback)) {
      this.configuration.fetchCallback(coordsToRetrieve, coordsRemoved);
    }
  };

  /*
   * Determines the total number of columns needed for the current viewport.
   *
   * @returns {Number} The calculated column count.
   * @private
   */
  ManagerPrototype.computeColumnCount = function() {
    var viewportWidth = this.displayArea.getWidth();
    var optionsRef = this.configuration;

    if (viewportWidth && optionsRef.unitDimension) {
      return Math.ceil(viewportWidth / optionsRef.unitDimension) + optionsRef.paddingFactor * 2;
    }
    return 0;
  };

  /*
   * Determines the total number of rows needed for the current viewport.
   *
   * @returns {Number} The calculated row count.
   * @private
   */
  ManagerPrototype.computeRowCount = function() {
    var viewportHeight = this.displayArea.getHeight();
    var optionsRef = this.configuration;

    if (viewportHeight && optionsRef.unitDimension) {
      return Math.ceil(viewportHeight / optionsRef.unitDimension) + optionsRef.paddingFactor * 2;
    }
    return 0;
  };

  /*
   * Updates the internal row and column counts based on current viewport dimensions.
   *
   * @private
   */
  ManagerPrototype.computeDimensionCounts = function() {
    this.displayRows = this.computeRowCount();
    this.displayColumns = this.computeColumnCount();
  };

  /*
   * Establishes the coordinates of the top-left and bottom-right boundary tiles
   * for the current view.
   *
   * @private
   */
  ManagerPrototype.determineBoundaryCoordinates = function() {
    var firstX = this.currentXPos - this.configuration.paddingFactor,
      firstY = this.currentYPos - this.configuration.paddingFactor;

    this.boundaries = {
      startX: firstX,
      startY: firstY,
      endX: firstX + this.displayColumns - 1,
      endY: firstY + this.displayRows - 1
    };
  };

  /*
   * Checks if a given tile coordinate falls within the currently visible grid boundaries.
   *
   * @param {Number} checkX - X coordinate to check.
   * @param {Number} checkY - Y coordinate to check.
   * @returns {boolean} True if the tile is within bounds, false otherwise.
   */
  ManagerPrototype.isInBounds = function(checkX, checkY) {
    if (checkY < this.boundaries.startY || checkY > this.boundaries.endY ||
      checkX < this.boundaries.startX || checkX > this.boundaries.endX) {
      return false;
    }
    return true;
  };

  // Export TileManager for CommonJS environments.
  // If loaded as an AMD module, define it appropriately.
  // Otherwise, attach TileManager to the global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = TileManager;
    }
    exports.TileManager = TileManager;
  } else if (typeof define === 'function' && define.amd) {
    // Define as an AMD module:
    define([], function() {
      return TileManager;
    });
  } else {
    // Expose TileManager globally:
    globalObj['TileManager'] = TileManager;
  }

})(this);