/*
 * This file defines core classes for a draggable, deformable grid.
 * It includes Point, Tile, and Grid objects to manage interactive 2D transformations.
 */

// Global constant: TILE_OVERLAP
// When tiles are transformed, there might be small visual seams between them.
// This constant specifies how many pixels tiles should overlap to hide these seams.
var TILE_OVERLAP = 1;

/**
 * Represents a single control point in the grid.
 * Users can drag these points to deform the grid.
 *
 * @param {number} xIndex The column index of the point within the grid.
 * @param {number} yIndex The row index of the point within the grid.
 * @param {number} x The initial X coordinate of the point.
 * @param {number} y The initial Y coordinate of the point.
 * @param {HTMLElement} containerNode The DOM element where the point's visual representation will be appended.
 * @constructor
 */
function Point(xIndex, yIndex, x, y, containerNode) {

  // Store the grid indices
  this.xIndex_ = xIndex;
  this.yIndex_ = yIndex;

  // Store the actual pixel coordinates
  this.x_ = x;
  this.y_ = y;

  // An array to keep track of all tiles associated with this point.
  // A point can be part of up to four tiles.
  this.associatedTiles_ = [];

  // Create the visual DOM node for this point.
  this.node_ = document.createElement('div');
  this.node_.className = 'point';

  // Update the visual position of the point.
  this.updateDisplay_();

  // Store a reference to this Point object on its DOM node for easy access during event handling.
  this.node_.point_ = this;

  // Append the point's node to the provided container.
  containerNode.appendChild(this.node_);
}

/**
 * Prototype methods and properties for the Point class.
 * Defines getters for coordinates and indices, and methods for interaction.
 */
Point.prototype = {

  /**
   * Getter for the xIndex (column index) of the point.
   * @return {number} The xIndex.
   */
  get xIndex() {
    return this.xIndex_;
  },

  /**
   * Getter for the yIndex (row index) of the point.
   * @return {number} The yIndex.
   */
  get yIndex() {
    return this.yIndex_;
  },

  /**
   * Getter for the current x coordinate of the point.
   * @return {number} The x coordinate.
   */
  get x() {
    return this.x_;
  },

  /**
   * Getter for the current y coordinate of the point.
   * @return {number} The y coordinate.
   */
  get y() {
    return this.y_;
  },

  /**
   * Getter for the array of tiles associated with this point.
   * @return {Array<Tile>} An array of Tile objects.
   */
  get associatedTiles() {
    return this.associatedTiles_;
  },

  /**
   * Attempts to move the point by a given delta.
   * Checks if the move would cause any associated tile to become concave.
   * If so, the move is rejected.
   *
   * @param {number} deltaX The change in the x coordinate.
   * @param {number} deltaY The change in the y coordinate.
   * @return {boolean} True if the move was successful, false otherwise.
   */
  moveBy: function(deltaX, deltaY) {

    // Tentatively apply the movement.
    this.x_ += deltaX;
    this.y_ += deltaY;

    var makesPointsConcave = false;

    // Iterate through all associated tiles to check for concavity.
    for (var i = 0, tile;
      (tile = this.associatedTiles_[i]); i++) {
      if (tile.isConcave) {
        makesPointsConcave = true;
        break; // Found a concave tile, no need to check further.
      }
    }

    // If the move resulted in a concave tile, revert the position.
    if (makesPointsConcave) {
      this.x_ -= deltaX;
      this.y_ -= deltaY;
      return false; // Indicate that the move was not allowed.
    }

    // If the move is valid, update the visual display of the point.
    this.updateDisplay_();

    return true; // Indicate that the move was successful.
  },

  /**
   * Updates the CSS position of the point's DOM node
   * based on its current x_ and y_ coordinates.
   * Uses Math.round to ensure integer pixel values.
   * @private
   */
  updateDisplay_: function() {
    this.node_.style.top = Math.round(this.y_) + 'px';
    this.node_.style.left = Math.round(this.x_) + 'px';
  }
};

/**
 * Represents a single deformable quadrilateral tile in the grid.
 * Each tile is defined by four Point objects.
 *
 * @param {Array<Point>} points An array of four Point objects, ordered top-left, top-right, bottom-right, bottom-left.
 * @param {HTMLElement} containerNode The DOM element where the tile's visual representation will be appended.
 * @constructor
 */
function Tile(points, containerNode) {

  // For each point that defines this tile, add this tile to its list of associated tiles.
  points.forEach(function(point) {
    point.associatedTiles.push(this);
  }, this); // 'this' context for the forEach callback is the Tile object.

  // Store the four Point objects that define this tile.
  this.points_ = points;

  // Store the initial (source) coordinates of the tile's corners.
  // These are used as the reference for the perspective transformation.
  this.source_ = [{
    x: points[0].x,
    y: points[0].y
  }, {
    x: points[1].x,
    y: points[1].y
  }, {
    x: points[2].x,
    y: points[2].y
  }, {
    x: points[3].x,
    y: points[3].y
  }];

  // Generate a unique ID for the tile based on its top-left point's indices.
  this.id = points[0].xIndex + '-' + points[0].yIndex;

  // Create the visual DOM node for this tile.
  this.node_ = document.createElement('div');
  this.node_.className = 'tile';

  // Set initial position and dimensions for the tile's DOM node.
  // These are based on the *source* coordinates, as the actual deformation is handled by webkitTransform.
  this.node_.style.left = this.x + 'px';
  this.node_.style.top = this.y + 'px';
  this.node_.style.width = this.width + 'px';
  this.node_.style.height = this.height + 'px';

  // Append the tile's node to the provided container.
  containerNode.appendChild(this.node_);
}

/**
 * Prototype methods and properties for the Tile class.
 * Includes methods for matrix computation, concavity check, and getters.
 */
Tile.prototype = {

  /**
   * Recomputes and applies the CSS perspective transform matrix for the tile.
   * This transformation maps the original (source) quadrilateral to the
   * currently deformed (destination) quadrilateral defined by the points_.
   * The implementation is based on a JavaScript port of OpenCV's cvGetPerspectiveTransform.
   */
  recomputeMatrix: function() {

    // Source points (original, undeformed positions)
    var src = this.source_;
    // Destination points (current, deformed positions)
    var dst = this.points_;

    // Offset for calculations to improve numerical stability.
    // We translate all points so that the top-left source point is at (0,0).
    var offsetX = src[0].x;
    var offsetY = src[0].y;

    // Initialize the 8x8 matrix 'a' and 8x1 vector 'b' for the linear system.
    // This system solves for the 8 parameters of the perspective transform matrix.
    var a = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var b = [0, 0, 0, 0, 0, 0, 0, 0];

    // Populate the 'a' matrix and 'b' vector based on source and destination points.
    // There are 8 equations, 2 for each of the 4 points.
    for (var i = 0; i < 4; i++) {
      // Initialize the i-th row of 'a' (first 4 equations correspond to x coordinates)
      a[i] = [];

      // Coefficients for the first 4 equations (for x-transformation)
      a[i][0] = a[i + 4][3] = src[i].x - offsetX; // x_s
      a[i][1] = a[i + 4][4] = src[i].y - offsetY; // y_s
      a[i][2] = a[i + 4][5] = 1; // 1

      // Zero out other coefficients for these rows
      a[i][3] = a[i][4] = a[i][5] =
        a[i + 4][0] = a[i + 4][1] = a[i + 4][2] = 0;

      // Coefficients for the perspective terms (p_x * x_d and p_y * x_d)
      a[i][6] = -(src[i].x - offsetX) * (dst[i].x - offsetX); // -x_s * x_d
      a[i][7] = -(src[i].y - offsetY) * (dst[i].x - offsetX); // -y_s * x_d

      // Coefficients for the next 4 equations (for y-transformation, starting at row i+4)
      a[i + 4][6] = -(src[i].x - offsetX) * (dst[i].y - offsetY); // -x_s * y_d
      a[i + 4][7] = -(src[i].y - offsetY) * (dst[i].y - offsetY); // -y_s * y_d

      // Populate the 'b' vector (the right-hand side of the equations)
      b[i] = dst[i].x - offsetX; // x_d
      b[i + 4] = dst[i].y - offsetY; // y_d
    }

    // Convert the 'b' vector into a column matrix for the matrix solver.
    var bM = [];
    for (var i = 0; i < b.length; i++) {
      bM[i] = [b[i]];
    }

    // Create Matrix objects from the raw arrays.
    var A = Matrix.create(a);
    var B = Matrix.create(bM);

    // Solve the linear system A * X = B for X (the perspective transform parameters).
    var X = Matrix.solve(A, B);

    // Create a new WebKitCSSMatrix object to store the computed transformation.
    var cssMatrix = new WebKitCSSMatrix();

    // Assign the solved parameters to the CSS matrix properties.
    // The order of parameters in X corresponds to:
    // [a, b, c, d, e, f, g, h] where the matrix is:
    // [a, d, 0, g]
    // [b, e, 0, h]
    // [0, 0, 1, 0]
    // [c, f, 0, 1]
    // (Note: WebKitCSSMatrix uses m11-m44, which maps to a 4x4 matrix representation.)
    cssMatrix.m11 = X.mat[0][0]; // a
    cssMatrix.m12 = X.mat[3][0]; // d
    cssMatrix.m13 = 0; // Not used in 2D perspective
    cssMatrix.m14 = X.mat[6][0]; // g (perspective x)

    cssMatrix.m21 = X.mat[1][0]; // b
    cssMatrix.m22 = X.mat[4][0]; // e
    cssMatrix.m23 = 0; // Not used
    cssMatrix.m24 = X.mat[7][0]; // h (perspective y)

    cssMatrix.m31 = 0;
    cssMatrix.m32 = 0;
    cssMatrix.m33 = 1; // Z-axis scaling, typically 1 for 2D
    cssMatrix.m34 = 0;

    cssMatrix.m41 = X.mat[2][0]; // c (translate x)
    cssMatrix.m42 = X.mat[5][0]; // f (translate y)
    cssMatrix.m43 = 0;
    cssMatrix.m44 = 1; // Homogeneous coordinate, typically 1

    // Apply the computed matrix to the tile's DOM node as a webkitTransform.
    this.node_.style.webkitTransform = cssMatrix;
  },

  /**
   * Checks if the tile has become concave (i.e., self-intersecting or folded in on itself).
   * This is determined by checking the "right turn" property of consecutive vertices.
   * A convex quadrilateral will always make "right turns" (or "left turns" if oriented differently)
   * when traversing its vertices in order. If any turn is not consistent, it's concave.
   *
   * @return {boolean} True if the tile is concave, false otherwise.
   */
  get isConcave() {
    // Based on the "right turn" check from http://en.wikipedia.org/wiki/Graham_scan
    // We iterate through each vertex and consider it as the middle point of a triplet (p1, p2, p3).
    for (var i = 0; i < 4; i++) {
      // Get the current point (p2)
      var p2 = this.points_[i];
      // Get the previous point (p1), handling wrap-around for the first point
      var p1 = this.points_[(i - 1 + 4) % 4];
      // Get the next point (p3), handling wrap-around for the last point
      var p3 = this.points_[(i + 1) % 4];

      // Calculate the cross product of vectors (p2 - p1) and (p3 - p1).
      // The sign of this cross product determines if p3 is to the left or right of vector p1->p2.
      // (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
      // If this value is <= 0, it indicates a "right turn" or collinearity.
      // For a convex polygon traversed clockwise, all turns should be "right turns" (positive value).
      // If we encounter a "left turn" (non-positive value here), the polygon is concave.
      if (((p2.x - p1.x) * (p3.y - p1.y)) - ((p2.y - p1.y) * (p3.x - p1.x)) <= 0) {
        return true; // The tile is concave.
      }
    }

    return false; // All turns are consistent, the tile is convex.
  },

  /**
   * Getter for the tile's DOM node.
   * @return {HTMLElement} The node.
   */
  get node() {
    return this.node_;
  },

  /**
   * Getter for the x coordinate of the tile's top-left source point.
   * @return {number} The x coordinate.
   */
  get x() {
    return this.source_[0].x;
  },

  /**
   * Getter for the y coordinate of the tile's top-left source point.
   * @return {number} The y coordinate.
   */
  get y() {
    return this.source_[0].y;
  },

  /**
   * Getter for the original width of the tile.
   * This is calculated from the source points and includes TILE_OVERLAP.
   * @return {number} The width.
   */
  get width() {
    return (this.source_[1].x - this.source_[0].x) + TILE_OVERLAP;
  },

  /**
   * Getter for the original height of the tile.
   * This is calculated from the source points and includes TILE_OVERLAP.
   * @return {number} The height.
   */
  get height() {
    return (this.source_[3].y - this.source_[0].y) + TILE_OVERLAP;
  },

  /**
   * Getter for the xIndex (column index) of the tile's top-left point.
   * @return {number} The xIndex.
   */
  get xIndex() {
    return this.points_[0].xIndex;
  },

  /**
   * Getter for the yIndex (row index) of the tile's top-left point.
   * @return {number} The yIndex.
   */
  get yIndex() {
    return this.points_[0].yIndex;
  }
};

/**
 * The main Grid class, responsible for creating and managing the deformable grid.
 * It initializes points, tiles, and handles user interaction (mouse/touch events).
 *
 * @param {HTMLElement} containerNode The DOM element that will contain the grid.
 * @param {number} gridSize The size of each square grid cell (before deformation).
 * @param {object} datasource An object that provides grid dimensions and can fill tile content.
 * @constructor
 */
function Grid(containerNode, gridSize, datasource) {

  // Start the datasource (e.g., load images).
  datasource.start();
  this.datasource_ = datasource;

  // Clear existing content in the container.
  containerNode.innerHTML = '';

  // Set the container's initial dimensions and center it.
  containerNode.style.width = datasource.width + 'px';
  containerNode.style.height = datasource.height + 'px';
  containerNode.style.marginLeft = (-datasource.width / 2) + 'px';
  containerNode.style.marginTop = (-datasource.height / 2) + 'px';

  // Create a canvas for drawing the grid lines.
  this.gridCanvas_ = document.createElement('canvas');
  this.gridCanvas_.id = 'grid-canvas';
  this.gridCanvas_.width = datasource.width;
  this.gridCanvas_.height = datasource.height;
  containerNode.appendChild(this.gridCanvas_);

  // Store grid dimensions.
  this.width_ = datasource.width;
  this.height_ = datasource.height;

  // Calculate the number of points needed along each axis.
  this.xPointCount_ = (this.width_ / gridSize) + 1;
  this.yPointCount_ = (this.height_ / gridSize) + 1;

  // Initialize a 2D array to store all Point objects.
  this.points_ = [];

  // Create all Point objects.
  for (var i = 0; i < this.xPointCount_; i++) {
    this.points_.push([]); // Add a new column array.
    for (var j = 0; j < this.yPointCount_; j++) {
      // Calculate initial x and y coordinates for each point.
      var x = i * gridSize;
      if (x > this.width_) {
        x = this.width_;
      } // Clamp to grid width for edge cases.
      var y = j * gridSize;
      if (y > this.height_) {
        y = this.height_;
      } // Clamp to grid height for edge cases.

      // Create a new Point and add it to the 2D array.
      this.points_[i][j] = new Point(i, j, x, y, containerNode);
    }
  }

  // Create all Tile objects using the generated points.
  // Tiles are created for each square cell in the grid.
  for (var i = 0; i < (this.xPointCount_ - 1); i++) {
    for (var j = 0; j < (this.yPointCount_ - 1); j++) {
      // Define the four points for the current tile (top-left, top-right, bottom-right, bottom-left).
      var tile = new Tile([
        this.points_[i][j], // Top-left
        this.points_[i + 1][j], // Top-right
        this.points_[i + 1][j + 1], // Bottom-right
        this.points_[i][j + 1] // Bottom-left
      ], containerNode);

      // Fill the tile with content using the datasource.
      datasource.fillTile(tile);
      // Recompute and apply the perspective transform for the newly created tile.
      tile.recomputeMatrix();
    }
  }

  // Bind event handlers to the Grid instance to preserve 'this' context.
  this.boundHandleMouseDown_ = this.handleMouseDown_.bind(this);
  this.boundHandleMouseMove_ = this.handleMouseMove_.bind(this);
  this.boundHandleMouseUp_ = this.handleMouseUp_.bind(this);

  // Attach event listeners for mouse or touch interactions.
  // Checks for 'ontouchmove' to determine if touch events should be used.
  if ('ontouchmove' in document) {
    document.addEventListener('touchstart', this.boundHandleMouseDown_, false);
    document.addEventListener('touchmove', this.boundHandleMouseMove_, false);
    document.addEventListener('touchend', this.boundHandleMouseUp_, false);
  } else {
    document.addEventListener('mousedown', this.boundHandleMouseDown_, false);
    document.addEventListener('mousemove', this.boundHandleMouseMove_, false);
    document.addEventListener('mouseup', this.boundHandleMouseUp_, false);
  }

  // Initial repaint of the grid lines on the canvas.
  this.repaintGrid_();
}

/**
 * Prototype methods and properties for the Grid class.
 * Includes methods for cleanup, event handling, and grid rendering.
 */
Grid.prototype = {

  /**
   * Cleans up event listeners and stops the datasource.
   * Should be called when the grid is no longer needed to prevent memory leaks.
   */
  dispose: function() {
    // Remove event listeners based on whether touch or mouse events were used.
    if ('ontouchmove' in document) {
      document.removeEventListener('touchstart', this.boundHandleMouseDown_, false);
      document.removeEventListener('touchmove', this.boundHandleMouseMove_, false);
      document.removeEventListener('touchend', this.boundHandleMouseUp_, false);
    } else {
      document.removeEventListener('mousedown', this.boundHandleMouseDown_, false);
      document.removeEventListener('mousemove', this.boundHandleMouseMove_, false);
      document.removeEventListener('mouseup', this.boundHandleMouseUp_, false);
    }

    // Stop the datasource (e.g., release image resources).
    this.datasource_.stop();
  },

  /**
   * Extracts the x and y coordinates from a mouse or touch event.
   *
   * @param {Event} event The DOM event object.
   * @return {{x: number, y: number}} An object containing the x and y coordinates.
   * @private
   */
  getEventCoordinates_: function(event) {
    if (event.touches) {
      // For touch events, use the coordinates of the first touch point.
      return {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      };
    } else {
      // For mouse events, use screenX/Y.
      return {
        x: event.screenX,
        y: event.screenY
      };
    }
  },

  /**
   * Handles the 'mousedown' or 'touchstart' event.
   * Identifies the point being dragged and sets up initial state for movement.
   *
   * @param {Event} event The DOM event object.
   * @private
   */
  handleMouseDown_: function(event) {
    // Get the Point object associated with the clicked/touched DOM node.
    var point = event.target.point_;
    if (!point) {
      return;
    } // If no point was clicked, ignore.

    // Store the currently dragged point.
    this.currentPoint_ = point;
    // Check for 'Alt' key to enable decay-based neighbor movement.
    this.moveNeighborsWithDecay_ = event.altKey;
    // Check for 'Shift' key to enable scaled movement of all points.
    this.moveAllPointsWithScale_ = event.shiftKey;
    // Store the coordinates of the event for delta calculation.
    this.lastEventCoordinates_ = this.getEventCoordinates_(event);
  },

  /**
   * Handles the 'mousemove' or 'touchmove' event.
   * Moves the current point and potentially its neighbors based on modifier keys.
   *
   * @param {Event} event The DOM event object.
   * @private
   */
  handleMouseMove_: function(event) {
    // Prevent default browser behavior (like scrolling on touch devices).
    event.preventDefault();

    // Object to store tiles that need their matrix recomputed.
    var dirtyTilesById = {};

    // Helper function to mark a point's associated tiles as dirty.
    function markPointAsDirty(point) {
      point.associatedTiles.forEach(function(tile) {
        dirtyTilesById[tile.id] = tile;
      });
    }

    // If no point is currently being dragged, do nothing.
    if (!this.currentPoint_) {
      return;
    }

    // Get current event coordinates and calculate the delta since the last event.
    var currentEventCoordinates = this.getEventCoordinates_(event);
    var deltaX = currentEventCoordinates.x - this.lastEventCoordinates_.x;
    var deltaY = currentEventCoordinates.y - this.lastEventCoordinates_.y;

    // Attempt to move the current point. If the move is invalid (causes concavity), stop.
    if (!this.currentPoint_.moveBy(deltaX, deltaY)) {
      return;
    }
    markPointAsDirty(this.currentPoint_);

    // Logic for moving neighboring points with decay.
    if (this.moveNeighborsWithDecay_) {
      for (var i = 0; i < this.xPointCount_; i++) {
        for (var j = 0; j < this.yPointCount_; j++) {
          var point = this.points_[i][j];
          if (point == this.currentPoint_) {
            continue;
          } // Don't move the current point again.

          // Calculate distance from the current point in grid units.
          var pointDX = Math.abs(point.xIndex - this.currentPoint_.xIndex);
          var pointDY = Math.abs(point.yIndex - this.currentPoint_.yIndex);

          // Calculate a decay factor: points further away move less.
          var decay = (1.0 / Math.pow(1.3, pointDX + pointDY)) - 0.05;

          if (decay <= 0) {
            continue;
          } // If decay is too low, don't move.

          // Move the neighbor point and mark its tiles as dirty.
          point.moveBy(deltaX * decay, deltaY * decay);
          markPointAsDirty(point);
        }
      }
    }
    // Logic for moving all points with a scaling factor (shift key).
    else if (this.moveAllPointsWithScale_) {
      // Calculate the number of points before and after the current point along each axis.
      var xPointsBefore = this.currentPoint_.xIndex;
      var xPointsAfter = this.xPointCount_ - this.currentPoint_.xIndex - 1;
      var yPointsBefore = this.currentPoint_.yIndex;
      var yPointsAfter = this.yPointCount_ - this.currentPoint_.yIndex - 1;

      for (var i = 0; i < this.xPointCount_; i++) {
        var xFactor;
        if (i == this.currentPoint_.xIndex) {
          xFactor = 1; // The current point itself moves fully.
        } else if (i == 0 || i == this.xPointCount_ - 1) {
          xFactor = 0; // Points on the absolute grid edges don't move horizontally.
        } else if (i < this.currentPoint_.xIndex) {
          // Points before the current point move proportionally.
          xFactor = 1.0 - ((this.currentPoint_.xIndex - i) / xPointsBefore);
        } else {
          // Points after the current point move proportionally.
          xFactor = 1.0 - ((i - this.currentPoint_.xIndex) / xPointsAfter);
        }

        for (var j = 0; j < this.yPointCount_; j++) {
          var point = this.points_[i][j];
          if (point == this.currentPoint_) {
            continue;
          } // Don't move the current point again.

          var yFactor;
          if (j == this.currentPoint_.yIndex) {
            yFactor = 1; // The current point itself moves fully.
          } else if (j == 0 || j == this.yPointCount_ - 1) {
            yFactor = 0; // Points on the absolute grid edges don't move vertically.
          } else if (j < this.currentPoint_.yIndex) {
            // Points before the current point move proportionally.
            yFactor = 1.0 - ((this.currentPoint_.yIndex - j) / yPointsBefore);
          } else {
            // Points after the current point move proportionally.
            yFactor = 1.0 - ((j - this.currentPoint_.yIndex) / yPointsAfter);
          }

          // If both factors are 0, the point is on an edge and shouldn't move.
          if (xFactor == 0 && yFactor == 0) {
            continue;
          }

          // Move the point by the scaled delta and mark its tiles as dirty.
          point.moveBy(deltaX * xFactor, deltaY * yFactor);
          markPointAsDirty(point);
        }
      }
    }

    // Repaint the grid lines on the canvas after all points have potentially moved.
    this.repaintGrid_();

    // Recompute matrices only for the tiles that were affected by point movements.
    for (var id in dirtyTilesById) {
      dirtyTilesById[id].recomputeMatrix();
    }

    // Update the last event coordinates for the next move event.
    this.lastEventCoordinates_ = currentEventCoordinates;
  },

  /**
   * Handles the 'mouseup' or 'touchend' event.
   * Clears the reference to the currently dragged point.
   *
   * @param {Event} event The DOM event object.
   * @private
   */
  handleMouseUp_: function(event) {
    this.currentPoint_ = null; // No point is being dragged anymore.
  },

  /**
   * Repaints the grid lines on the canvas.
   * It dynamically adjusts the canvas size and position to encompass all points.
   * @private
   */
  repaintGrid_: function() {
    // Determine the bounding box of all points to adjust canvas size dynamically.
    var minX = Number.MAX_VALUE;
    var maxX = -Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    var maxY = -Number.MAX_VALUE;

    // Iterate through all points to find the min/max coordinates.
    for (var i = 0; i < this.xPointCount_; i++) {
      for (var j = 0; j < this.yPointCount_; j++) {
        var point = this.points_[i][j];
        if (point.x < minX) {
          minX = point.x;
        }
        if (point.x > maxX) {
          maxX = point.x;
        }
        if (point.y < minY) {
          minY = point.y;
        }
        if (point.y > maxY) {
          maxY = point.y;
        }
      }
    }

    // Expand the bounding box by 1 pixel on all sides.
    // This provides a buffer for the 2-pixel wide stroke, preventing clipping at edges.
    minX = Math.floor(minX - 1);
    maxX = Math.ceil(maxX + 1);
    minY = Math.floor(minY - 1);
    maxY = Math.ceil(maxY + 1);

    var canvasWidth = maxX - minX;
    var canvasHeight = maxY - minY;

    // If the required canvas dimensions exceed the current canvas,
    // create a new, larger canvas and replace the old one.
    // The new canvas dimensions are slightly oversized (1.25 factor) to reduce frequent re-creations.
    if (canvasWidth > this.gridCanvas_.width ||
      canvasHeight > this.gridCanvas_.height) {
      var gridCanvas = document.createElement('canvas');
      gridCanvas.id = 'grid-canvas';
      gridCanvas.width = Math.round(canvasWidth * 1.25);
      gridCanvas.height = Math.round(canvasHeight * 1.25);

      this.gridCanvas_.parentNode.replaceChild(
        gridCanvas, this.gridCanvas_);
      this.gridCanvas_ = gridCanvas;
    }

    // Position the canvas based on the calculated minX and minY.
    this.gridCanvas_.style.left = minX + 'px';
    this.gridCanvas_.style.top = minY + 'px';

    // Get the 2D rendering context of the canvas.
    var context = this.gridCanvas_.getContext('2d');
    context.lineWidth = 2; // Set line width for grid lines.
    context.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Set stroke color (semi-transparent red).

    // Clear the entire canvas before redrawing.
    context.clearRect(0, 0, this.gridCanvas_.width, this.gridCanvas_.height);

    // Draw the grid lines.
    // Each point draws lines connecting to its point above and its point to the left.
    for (var i = 0; i < this.xPointCount_; i++) {
      for (var j = 0; j < this.yPointCount_; j++) {
        var point = this.points_[i][j];

        // Get the point above the current one. If at the top edge, use the current point itself.
        var pointAbove = (j > 0) ? this.points_[i][j - 1] : point;
        // Get the point to the left of the current one. If at the left edge, use the current point itself.
        var pointLeft = (i > 0) ? this.points_[i - 1][j] : point;

        context.beginPath();
        // Move to the point above, adjusted by minX/minY for canvas origin.
        context.moveTo(pointAbove.x - minX, pointAbove.y - minY);
        // Draw a line to the current point.
        context.lineTo(point.x - minX, point.y - minY);
        // Draw a line from the current point to the point to its left.
        context.lineTo(pointLeft.x - minX, pointLeft.y - minY);
        context.stroke(); // Render the path.
      }
    }
  }
};