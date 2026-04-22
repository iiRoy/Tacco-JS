const CELL_MARGIN_PX = 1; // This constant defines the pixel overlap between adjacent grid cells after a perspective transformation, to prevent visual gaps.

/**
 * Represents a single manipulable vertex within the interactive mesh.
 * @param {number} gridX - The column index of this vertex in the grid.
 * @param {number} gridY - The row index of this vertex in the grid.
 * @param {number} currentX - The current X coordinate of the vertex in client space.
 * @param {number} currentY - The current Y coordinate of the vertex in client space.
 * @param {HTMLElement} parentContainer - The DOM element where this vertex's visual representation will be appended.
 */
function Vertex(gridX, gridY, currentX, currentY, parentContainer) {
  // Internal coordinates and indices
  this.gridX_ = gridX;
  this.gridY_ = gridY;
  this.posX_ = currentX;
  this.posY_ = currentY;

  // Collection of grid cells that share this vertex.
  this.linkedCells_ = [];

  // Create and configure the DOM element for this vertex.
  this.domElement_ = document.createElement('div');
  this.domElement_.className = 'mesh-vertex'; // Renamed class for styling
  this.refreshVisualPosition_(); // Update display immediately
  this.domElement_.vertexRef_ = this; // Store a reference to this object on the DOM element for event handling
  parentContainer.appendChild(this.domElement_); // Add to the DOM
}

Vertex.prototype = {
  // Public getters for vertex properties
  get columnIndex() {
    return this.gridX_;
  },

  get rowIndex() {
    return this.gridY_;
  },

  get clientX() {
    return this.posX_;
  },

  get clientY() {
    return this.posY_;
  },

  get connectedCells() {
    return this.linkedCells_;
  },

  /**
   * Attempts to move the vertex by a given displacement.
   * Prevents movement if it would cause any connected cell to become concave.
   * @param {number} dx - The change in X position.
   * @param {number} dy - The change in Y position.
   * @returns {boolean} True if the vertex was successfully moved, false otherwise.
   */
  displaceBy: function(dx, dy) {
    // Early exit if no displacement
    if (dx === 0 && dy === 0) {
      return true;
    }

    const proposedX = this.posX_ + dx;
    const proposedY = this.posY_ + dy;

    // Check for concavity before committing the move
    for (let i = 0; i < this.linkedCells_.length; i++) {
      const cell = this.linkedCells_[i];
      if (cell.checkConcavityWithVertexMove(this, proposedX, proposedY)) {
        // If moving this vertex would make any linked cell concave, disallow the move.
        return false;
      }
    }

    // If no concavity, commit the move
    this.posX_ = proposedX;
    this.posY_ = proposedY;
    this.refreshVisualPosition_(); // Update the DOM element's position

    return true;
  },

  /**
   * Updates the visual position of the vertex's DOM element based on its current coordinates.
   */
  refreshVisualPosition_: function() {
    // Using Math.floor for pixel positioning for consistency, instead of Math.round
    this.domElement_.style.top = Math.floor(this.posY_) + 'px';
    this.domElement_.style.left = Math.floor(this.posX_) + 'px';
  }
};

/**
 * Represents a single quadrangular grid cell, formed by four vertices.
 * Handles its own perspective transformation and concavity checks.
 * @param {Array<Vertex>} vertexArray - An array of exactly 4 Vertex objects that define the corners of the cell.
 * @param {HTMLElement} parentContainer - The DOM element where this cell's visual representation will be appended.
 */
function GridCell(vertexArray, parentContainer) {
  // Validate input: A grid cell must be defined by exactly 4 vertices.
  if (!Array.isArray(vertexArray) || vertexArray.length !== 4) {
    console.error("GridCell: Constructor requires an array of exactly 4 Vertex objects.");
    throw new Error("Invalid vertex array for GridCell construction.");
  }

  // Link this cell to its constituent vertices.
  vertexArray.forEach(function(vtx) {
    vtx.connectedCells.push(this);
  }, this);

  this.vertices_ = vertexArray;

  // Store initial coordinates for perspective transformation reference.
  // This is a snapshot of the vertices' positions at creation.
  this.initialCoords_ = [
    { x: vertexArray[0].clientX, y: vertexArray[0].clientY },
    { x: vertexArray[1].clientX, y: vertexArray[1].clientY },
    { x: vertexArray[2].clientX, y: vertexArray[2].clientY },
    { x: vertexArray[3].clientX, y: vertexArray[3].clientY }
  ];

  // Unique identifier for the cell, based on its top-left vertex's grid indices.
  this.cellId = `cell-${vertexArray[0].columnIndex}-${vertexArray[0].rowIndex}`;

  // Create and configure the DOM element for this cell.
  this.domElement_ = document.createElement('div');
  this.domElement_.className = 'mesh-cell'; // Renamed class for styling
  // Set initial dimensions and position based on the first vertex and calculated width/height.
  this.domElement_.style.left = this.originX + 'px';
  this.domElement_.style.top = this.originY + 'px';
  this.domElement_.style.width = this.baseWidth + 'px';
  this.domElement_.style.height = this.baseHeight + 'px';
  parentContainer.appendChild(this.domElement_); // Add to the DOM
}

GridCell.prototype = {
  /**
   * Recalculates and applies the CSS perspective transform to the cell's DOM element.
   * This uses a 2D homography calculation, adapted from a JavaScript port of OpenCV.
   */
  updatePerspectiveTransform: function() {
    // Source points are the initial, untransformed coordinates of the cell's vertices.
    const srcPoints = this.initialCoords_;
    // Destination points are the current, potentially transformed coordinates of the vertices.
    const dstPoints = this.vertices_;

    // Offset all coordinates to simplify matrix calculations (relative to top-left corner).
    const offsetX = srcPoints[0].x;
    const offsetY = srcPoints[0].y;

    // Initialize matrices for the linear system Ax = B.
    // 'A' is an 8x8 matrix, 'B' is an 8x1 vector.
    // These are used to solve for the 8 homography parameters.
    let matrixA = Array(8).fill(0).map(() => Array(8).fill(0));
    let vectorB = Array(8).fill(0);

    for (let k = 0; k < 4; k++) {
      const sX = srcPoints[k].x - offsetX;
      const sY = srcPoints[k].y - offsetY;
      const dX = dstPoints[k].clientX - offsetX;
      const dY = dstPoints[k].clientY - offsetY;

      // Populate matrixA and vectorB based on the homography equations.
      matrixA[k][0] = sX;
      matrixA[k][1] = sY;
      matrixA[k][2] = 1;
      matrixA[k][6] = -sX * dX;
      matrixA[k][7] = -sY * dX;
      vectorB[k] = dX;

      const kPlus4 = k + 4; // Index for the second set of equations
      matrixA[kPlus4][3] = sX;
      matrixA[kPlus4][4] = sY;
      matrixA[kPlus4][5] = 1;
      matrixA[kPlus4][6] = -sX * dY;
      matrixA[kPlus4][7] = -sY * dY;
      vectorB[kPlus4] = dY;
    }

    // Convert vector B into a column matrix for the solver.
    const vectorBMatrix = vectorB.map(val => [val]);

    // Use a matrix library (assuming 'Matrix' is globally available, as in original code)
    const A_Mat = Matrix.create(matrixA);
    const B_Mat = Matrix.create(vectorBMatrix);
    const X_Mat = Matrix.solve(A_Mat, B_Mat); // X will contain the 8 homography parameters

    // Construct the WebKitCSSMatrix (or equivalent DOMMatrix) from the solved parameters.
    // The homography matrix is 3x3, but CSSMatrix is 4x4 for 3D transforms.
    // We map the 8 parameters (a, b, c, d, e, f, g, h) to the 4x4 matrix.
    // [ a b 0 g ]
    // [ d e 0 h ]
    // [ 0 0 1 0 ]
    // [ c f 0 1 ]
    let transformMatrix;
    // Check for WebKitCSSMatrix or fall back to a generic DOMMatrix if available
    if (window.WebKitCSSMatrix) {
        transformMatrix = new WebKitCSSMatrix();
    } else if (window.DOMMatrix) {
        transformMatrix = new DOMMatrix();
    } else {
        console.warn("Neither WebKitCSSMatrix nor DOMMatrix found. Cannot apply perspective transform.");
        return;
    }

    // Map the solved homography parameters to the CSSMatrix properties.
    // X.mat[idx][0] gives the value of the parameter.
    transformMatrix.m11 = X_Mat.mat[0][0]; // a
    transformMatrix.m12 = X_Mat.mat[3][0]; // d
    transformMatrix.m13 = 0;              // (Not used in 2D perspective, always 0)
    transformMatrix.m14 = X_Mat.mat[6][0]; // g (perspective factor for X)

    transformMatrix.m21 = X_Mat.mat[1][0]; // b
    transformMatrix.m22 = X_Mat.mat[4][0]; // e
    transformMatrix.m23 = 0;              // (Not used in 2D perspective, always 0)
    transformMatrix.m24 = X_Mat.mat[7][0]; // h (perspective factor for Y)

    transformMatrix.m31 = 0;
    transformMatrix.m32 = 0;
    transformMatrix.m33 = 1;              // Z-axis scaling, typically 1 for 2D
    transformMatrix.m34 = 0;

    transformMatrix.m41 = X_Mat.mat[2][0]; // c (translation X)
    transformMatrix.m42 = X_Mat.mat[5][0]; // f (translation Y)
    transformMatrix.m43 = 0;
    transformMatrix.m44 = 1;              // Homogeneous coordinate W, typically 1

    // Apply the computed transform to the cell's DOM element.
    this.domElement_.style.webkitTransform = transformMatrix;
    this.domElement_.style.transform = transformMatrix; // For broader browser compatibility
  },

  /**
   * Checks if the cell is currently concave. A concave quadrilateral is one where
   * at least one internal angle is greater than 180 degrees.
   * This is determined by checking the "turn" direction of consecutive edges.
   * @returns {boolean} True if the cell is concave, false otherwise.
   */
  hasConcaveShape: function() {
    // Iterate through each vertex and its neighbors to check for "right turns".
    // A concave shape will have at least one "left turn" if traversing clockwise,
    // or one "right turn" if traversing counter-clockwise.
    for (let k = 0; k < 4; k++) {
      const v1 = this.vertices_[(k - 1 + 4) % 4]; // Previous vertex (wraps around)
      const v2 = this.vertices_[k];             // Current vertex
      const v3 = this.vertices_[(k + 1) % 4];   // Next vertex (wraps around)

      // Calculate the 2D cross product of vectors (v2-v1) and (v3-v1).
      // The sign of this cross product indicates the turn direction.
      const crossProduct = (v2.clientX - v1.clientX) * (v3.clientY - v1.clientY) -
                           (v2.clientY - v1.clientY) * (v3.clientX - v1.clientX);

      // If the cross product is less than or equal to zero, it indicates a "right turn"
      // (or collinear points). For a convex polygon traversed clockwise, all cross products
      // should be positive. If any are negative or zero, it's concave or degenerate.
      if (crossProduct <= 0) {
        return true; // Found a concave angle
      }
    }
    return false; // All angles are convex
  },

  /**
   * Checks if moving a specific vertex to a proposed new position would make the cell concave.
   * This is a speculative check without actually moving the vertex.
   * @param {Vertex} vertexToMove - The vertex being considered for movement.
   * @param {number} newX - The proposed new X coordinate for the vertex.
   * @param {number} newY - The proposed new Y coordinate for the vertex.
   * @returns {boolean} True if the move would result in a concave cell, false otherwise.
   */
  checkConcavityWithVertexMove: function(vertexToMove, newX, newY) {
    // Create a temporary array of vertices with the proposed new position.
    const tempVertices = this.vertices_.map(vtx => {
      if (vtx === vertexToMove) {
        return { clientX: newX, clientY: newY };
      }
      return { clientX: vtx.clientX, clientY: vtx.clientY };
    });

    // Perform the concavity check on the temporary vertices.
    for (let k = 0; k < 4; k++) {
      const v1 = tempVertices[(k - 1 + 4) % 4];
      const v2 = tempVertices[k];
      const v3 = tempVertices[(k + 1) % 4];

      const crossProduct = (v2.clientX - v1.clientX) * (v3.clientY - v1.clientY) -
                           (v2.clientY - v1.clientY) * (v3.clientX - v1.clientX);

      if (crossProduct <= 0) {
        return true;
      }
    }
    return false;
  },

  // Public getters for cell properties
  get cellNode() {
    return this.domElement_;
  },

  get originX() {
    return this.initialCoords_[0].x;
  },

  get originY() {
    return this.initialCoords_[0].y;
  },

  get baseWidth() {
    // Calculated from initial coordinates of the top-right and top-left vertices.
    // Add CELL_MARGIN_PX for overlap.
    return (this.initialCoords_[1].x - this.initialCoords_[0].x) + CELL_MARGIN_PX;
  },

  get baseHeight() {
    // Calculated from initial coordinates of the bottom-left and top-left vertices.
    // Add CELL_MARGIN_PX for overlap.
    return (this.initialCoords_[3].y - this.initialCoords_[0].y) + CELL_MARGIN_PX;
  },

  get colIndex() {
    return this.vertices_[0].columnIndex;
  },

  get rowIndex() {
    return this.vertices_[0].rowIndex;
  },

  /**
   * Returns the approximate center coordinates of the grid cell.
   * This is a simple average of the corner vertices' current positions.
   */
  get centerCoords() {
      let sumX = 0;
      let sumY = 0;
      this.vertices_.forEach(v => {
          sumX += v.clientX;
          sumY += v.clientY;
      });
      return { x: sumX / 4, y: sumY / 4 };
  }
};

/**
 * Manages an interactive grid mesh of vertices and cells, handling user interactions
 * to deform the mesh and updating its visual representation.
 * @param {HTMLElement} hostElement - The DOM element to host the interactive mesh.
 * @param {number} cellDimension - The desired side length of each grid cell in pixels.
 * @param {object} dataProvider - An object providing data for the mesh, e.g., images for cells.
 *                                Must have `width`, `height` properties, and `start()`, `fillTile()` methods.
 */
function InteractiveMesh(hostElement, cellDimension, dataProvider) {
  // Input validation
  if (!hostElement || !(hostElement instanceof HTMLElement)) {
    console.error("InteractiveMesh: A valid host DOM element is required.");
    throw new Error("Invalid host element provided.");
  }
  if (typeof cellDimension !== 'number' || cellDimension <= 0) {
    console.error("InteractiveMesh: 'cellDimension' must be a positive number.");
    throw new Error("Invalid cell dimension.");
  }
  if (!dataProvider || typeof dataProvider.start !== 'function' || typeof dataProvider.fillTile !== 'function' || typeof dataProvider.width === 'undefined' || typeof dataProvider.height === 'undefined') {
    console.error("InteractiveMesh: A valid 'dataProvider' object with 'width', 'height', 'start()', and 'fillTile()' methods is required.");
    throw new Error("Invalid data provider.");
  }

  this.dataProvider_ = dataProvider;
  this.dataProvider_.start(); // Initialize data source

  // Clear existing content and set container styles
  hostElement.innerHTML = '';
  hostElement.style.width = this.dataProvider_.width + 'px';
  hostElement.style.height = this.dataProvider_.height + 'px';
  // Center the container using negative margins
  hostElement.style.marginLeft = (-this.dataProvider_.width / 2) + 'px';
  hostElement.style.marginTop = (-this.dataProvider_.height / 2) + 'px';

  // Create and configure the drawing canvas for grid lines
  this.drawingCanvas_ = document.createElement('canvas');
  this.drawingCanvas_.id = 'mesh-grid-canvas';
  this.drawingCanvas_.width = this.dataProvider_.width;
  this.drawingCanvas_.height = this.dataProvider_.height;
  hostElement.appendChild(this.drawingCanvas_);

  // Calculate number of columns and rows based on mesh dimensions and cell size
  this.numCols_ = Math.floor(this.dataProvider_.width / cellDimension) + 1;
  this.numRows_ = Math.floor(this.dataProvider_.height / cellDimension) + 1;

  this.vertices_ = []; // Store all Vertex objects in a 2D array
  // Populate the vertices grid
  for (let c = 0; c < this.numCols_; c++) {
    this.vertices_.push([]);
    for (let r = 0; r < this.numRows_; r++) {
      let currentX = c * cellDimension;
      let currentY = r * cellDimension;

      // Ensure vertices don't go beyond the mesh boundaries if gridSize doesn't divide perfectly
      if (currentX > this.dataProvider_.width) currentX = this.dataProvider_.width;
      if (currentY > this.dataProvider_.height) currentY = this.dataProvider_.height;

      this.vertices_[c][r] = new Vertex(c, r, currentX, currentY, hostElement);
    }
  }

  // Create GridCell objects from the vertices
  // Note: GridCell instances are not stored directly in a class property here,
  // but they are implicitly accessible via `vertex.connectedCells`.
  for (let c = 0; c < this.numCols_ - 1; c++) {
    for (let r = 0; r < this.numRows_ - 1; r++) {
      const cellVertices = [
        this.vertices_[c][r],
        this.vertices_[c + 1][r],
        this.vertices_[c + 1][r + 1],
        this.vertices_[c][r + 1]
      ];
      const newCell = new GridCell(cellVertices, hostElement);
      this.dataProvider_.fillTile(newCell); // Allow data provider to customize cell (e.g., add background image)
      newCell.updatePerspectiveTransform(); // Apply initial transform
    }
  }

  // Bind event handlers to 'this' context
  this.onPointerDown_ = this.handlePointerDown_.bind(this);
  this.onPointerMove_ = this.handlePointerMove_.bind(this);
  this.onPointerUp_ = this.handlePointerUp_.bind(this);

  // Register event listeners for both mouse and touch input
  if ('ontouchstart' in document.documentElement) { // Check for touch device capability
    document.addEventListener('touchstart', this.onPointerDown_, { passive: false }); // passive:false to allow preventDefault
    document.addEventListener('touchmove', this.onPointerMove_, { passive: false });
    document.addEventListener('touchend', this.onPointerUp_, { passive: false });
  } else {
    document.addEventListener('mousedown', this.onPointerDown_, false);
    document.addEventListener('mousemove', this.onPointerMove_, false);
    document.addEventListener('mouseup', this.onPointerUp_, false);
  }

  this.redrawMeshGrid_(); // Initial drawing of the grid lines
}

InteractiveMesh.prototype = {
  /**
   * Cleans up event listeners and stops the data provider when the mesh is no longer needed.
   */
  dispose: function() {
    // Unregister event listeners
    if ('ontouchstart' in document.documentElement) {
      document.removeEventListener('touchstart', this.onPointerDown_, { passive: false });
      document.removeEventListener('touchmove', this.onPointerMove_, { passive: false });
      document.removeEventListener('touchend', this.onPointerUp_, { passive: false });
    } else {
      document.removeEventListener('mousedown', this.onPointerDown_, false);
      document.removeEventListener('mousemove', this.onPointerMove_, false);
      document.removeEventListener('mouseup', this.onPointerUp_, false);
    }

    this.dataProvider_.stop(); // Signal data provider to stop operations
    console.log("InteractiveMesh disposed: Event listeners removed and data provider stopped."); // Added for debugging/tracking
  },

  /**
   * Extracts X and Y coordinates from a given event object, supporting both mouse and touch events.
   * @param {Event} evt - The DOM event (MouseEvent or TouchEvent).
   * @returns {{x: number, y: number}} An object containing the X and Y coordinates.
   */
  extractEventCoords_: function(evt) {
    if (evt.touches && evt.touches.length > 0) {
      return { x: evt.touches[0].pageX, y: evt.touches[0].pageY };
    } else if (evt.changedTouches && evt.changedTouches.length > 0) { // For touchend
      return { x: evt.changedTouches[0].pageX, y: evt.changedTouches[0].pageY };
    } else {
      return { x: evt.screenX, y: evt.screenY }; // Fallback for mouse events
    }
  },

  /**
   * Handles the initial pointer down event (mouse or touch).
   * Identifies the active vertex and sets up flags for movement behavior.
   * @param {Event} evt - The DOM event.
   */
  handlePointerDown_: function(evt) {
    // Ensure we only react to direct clicks on a vertex element
    const targetVertex = evt.target.vertexRef_;
    if (!targetVertex) {
      // If we clicked on something else, clear any active vertex
      this.activeVertex_ = null;
      return;
    }

    this.activeVertex_ = targetVertex;
    this.propagateDisplacement_ = evt.altKey; // Alt key for decaying movement
    this.scaleDisplacement_ = evt.shiftKey;   // Shift key for scaled movement
    this.prevEventCoords_ = this.extractEventCoords_(evt); // Store initial event coordinates
  },

  /**
   * Handles pointer movement events (mouse or touch).
   * Deforms the mesh based on the active vertex and modifier keys.
   * @param {Event} evt - The DOM event.
   */
  handlePointerMove_: function(evt) {
    // Prevent default scrolling/zooming behavior, especially for touch events.
    evt.preventDefault();

    if (!this.activeVertex_) {
      return; // No vertex is being dragged
    }

    // Capture the current event coordinates and calculate displacement.
    const currentEventCoords = this.extractEventCoords_(evt);
    const deltaX = currentEventCoords.x - this.prevEventCoords_.x;
    const deltaY = currentEventCoords.y - this.prevEventCoords_.y;

    // If there's no movement, no need to update anything.
    if (deltaX === 0 && deltaY === 0) {
        return;
    }

    // Keep track of which cells need their transform recomputed.
    const cellsToUpdate = new Map(); // Using a Map to store unique cells by ID

    const markVertexCellsForUpdate = (vtx) => {
      vtx.connectedCells.forEach(cell => cellsToUpdate.set(cell.cellId, cell));
    };

    // Attempt to move the active vertex. If it fails due to concavity, stop.
    if (!this.activeVertex_.displaceBy(deltaX, deltaY)) {
      // Revert previous event coordinates to prevent "jumping" if the user tries to move again.
      this.prevEventCoords_ = currentEventCoords;
      return;
    }
    markVertexCellsForUpdate(this.activeVertex_);

    // Apply additional movement based on modifier keys
    if (this.propagateDisplacement_) {
      // Move neighboring vertices with a decay factor based on distance from active vertex.
      for (let c = 0; c < this.numCols_; c++) {
        for (let r = 0; r < this.numRows_; r++) {
          const currentVtx = this.vertices_[c][r];
          if (currentVtx === this.activeVertex_) continue; // Skip the active vertex

          const distCol = Math.abs(currentVtx.columnIndex - this.activeVertex_.columnIndex);
          const distRow = Math.abs(currentVtx.rowIndex - this.activeVertex_.rowIndex);
          const totalDistance = distCol + distRow;

          // Decay factor: starts at 1 and decreases exponentially with distance.
          // Subtract a small epsilon (0.05) to ensure decay becomes zero for distant points.
          const decayFactor = 1.0 / Math.pow(1.3, totalDistance) - 0.05;

          if (decayFactor > 0) {
            currentVtx.displaceBy(deltaX * decayFactor, deltaY * decayFactor);
            markVertexCellsForUpdate(currentVtx);
          }
        }
      }
    } else if (this.scaleDisplacement_) {
      // Scale movement across the mesh, maintaining relative proportions.
      // Edges (row 0, last row, col 0, last col) are fixed unless they contain the active vertex.
      const activeCol = this.activeVertex_.columnIndex;
      const activeRow = this.activeVertex_.rowIndex;

      const colsBefore = activeCol;
      const colsAfter = this.numCols_ - activeCol - 1;
      const rowsBefore = activeRow;
      const rowsAfter = this.numRows_ - activeRow - 1;

      for (let c = 0; c < this.numCols_; c++) {
        let colFactor = 0;
        if (c === activeCol) {
          colFactor = 1;
        } else if (c === 0 || c === this.numCols_ - 1) {
          colFactor = 0; // Edge columns are fixed
        } else if (c < activeCol) {
          colFactor = colsBefore > 0 ? (1.0 - (activeCol - c) / colsBefore) : 0;
        } else { // c > activeCol
          colFactor = colsAfter > 0 ? (1.0 - (c - activeCol) / colsAfter) : 0;
        }

        for (let r = 0; r < this.numRows_; r++) {
          const currentVtx = this.vertices_[c][r];
          if (currentVtx === this.activeVertex_) continue; // Skip the active vertex

          let rowFactor = 0;
          if (r === activeRow) {
            rowFactor = 1;
          } else if (r === 0 || r === this.numRows_ - 1) {
            rowFactor = 0; // Edge rows are fixed
          } else if (r < activeRow) {
            rowFactor = rowsBefore > 0 ? (1.0 - (activeRow - r) / rowsBefore) : 0;
          } else { // r > activeRow
            rowFactor = rowsAfter > 0 ? (1.0 - (r - activeRow) / rowsAfter) : 0;
          }

          // Apply displacement if either factor is non-zero
          if (colFactor !== 0 || rowFactor !== 0) {
              currentVtx.displaceBy(deltaX * colFactor, deltaY * rowFactor);
              markVertexCellsForUpdate(currentVtx);
          }
        }
      }
    }

    // Update the grid lines on the canvas
    this.redrawMeshGrid_();

    // Recompute perspective transforms for all affected cells
    cellsToUpdate.forEach(cell => cell.updatePerspectiveTransform());

    // Store current event coordinates for the next move calculation.
    this.prevEventCoords_ = currentEventCoords;
  },

  /**
   * Handles pointer up events (mouse or touch).
   * Clears the active vertex, ending the drag operation.
   * @param {Event} evt - The DOM event.
   */
  handlePointerUp_: function(evt) {
    this.activeVertex_ = null; // Release the active vertex
  },

  /**
   * Redraws the grid lines on the canvas based on the current vertex positions.
   * Also dynamically resizes the canvas if the mesh extends beyond its current bounds.
   */
  redrawMeshGrid_: function() {
    let minGlobalX = Number.MAX_SAFE_INTEGER;
    let maxGlobalX = Number.MIN_SAFE_INTEGER;
    let minGlobalY = Number.MAX_SAFE_INTEGER;
    let maxGlobalY = Number.MIN_SAFE_INTEGER;

    // Find the bounding box of all vertices
    for (let c = 0; c < this.numCols_; c++) {
      for (let r = 0; r < this.numRows_; r++) {
        const vtx = this.vertices_[c][r];
        minGlobalX = Math.min(minGlobalX, vtx.clientX);
        maxGlobalX = Math.max(maxGlobalX, vtx.clientX);
        minGlobalY = Math.min(minGlobalY, vtx.clientY);
        maxGlobalY = Math.max(maxGlobalY, vtx.clientY);
      }
    }

    // Add a small buffer around the bounding box for stroke visibility
    const buffer = 2; // Extra pixels for stroke, adjusted from original 1
    minGlobalX = Math.floor(minGlobalX - buffer);
    maxGlobalX = Math.ceil(maxGlobalX + buffer);
    minGlobalY = Math.floor(minGlobalY - buffer);
    maxGlobalY = Math.ceil(maxGlobalY + buffer);

    let requiredWidth = maxGlobalX - minGlobalX;
    let requiredHeight = maxGlobalY - minGlobalY;

    // Dynamic canvas resizing: if the required area exceeds current canvas, resize it.
    // Scale up by a factor (e.g., 1.5) to reduce frequent re-creations.
    const resizeFactor = 1.5;
    if (requiredWidth > this.drawingCanvas_.width || requiredHeight > this.drawingCanvas_.height) {
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'mesh-grid-canvas';
      newCanvas.width = Math.round(requiredWidth * resizeFactor);
      newCanvas.height = Math.round(requiredHeight * resizeFactor);

      // Replace the old canvas with the new, larger one.
      if (this.drawingCanvas_.parentNode) {
        this.drawingCanvas_.parentNode.replaceChild(newCanvas, this.drawingCanvas_);
      }
      this.drawingCanvas_ = newCanvas;
    }

    // Position the canvas to cover the current bounding box of the mesh.
    this.drawingCanvas_.style.left = minGlobalX + 'px';
    this.drawingCanvas_.style.top = minGlobalY + 'px';

    const ctx = this.drawingCanvas_.getContext('2d');
    if (!ctx) {
        console.warn("Could not get 2D rendering context for canvas. Grid lines will not be drawn.");
        return;
    }

    // Clear the entire canvas before redrawing.
    ctx.clearRect(0, 0, this.drawingCanvas_.width, this.drawingCanvas_.height);

    // Set drawing styles for the grid lines.
    ctx.lineWidth = 1.5; // Slightly thinner line
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.6)'; // Changed color to blue, slightly more opaque

    // Draw horizontal grid lines
    for (let r = 0; r < this.numRows_; r++) {
      ctx.beginPath();
      for (let c = 0; c < this.numCols_; c++) {
        const vtx = this.vertices_[c][r];
        const xCoord = vtx.clientX - minGlobalX;
        const yCoord = vtx.clientY - minGlobalY;
        if (c === 0) {
          ctx.moveTo(xCoord, yCoord);
        } else {
          ctx.lineTo(xCoord, yCoord);
        }
      }
      ctx.stroke();
    }

    // Draw vertical grid lines
    for (let c = 0; c < this.numCols_; c++) {
      ctx.beginPath();
      for (let r = 0; r < this.numRows_; r++) {
        const vtx = this.vertices_[c][r];
        const xCoord = vtx.clientX - minGlobalX;
        const yCoord = vtx.clientY - minGlobalY;
        if (r === 0) {
          ctx.moveTo(xCoord, yCoord);
        } else {
          ctx.lineTo(xCoord, yCoord);
        }
      }
      ctx.stroke();
    }
  },

  /**
   * Resets all vertices to their initial grid positions and recomputes all cell transforms.
   * This is a new public method for Type III change.
   */
  resetMesh: function() {
      // Re-initialize vertices to their original grid positions
      for (let c = 0; c < this.numCols_; c++) {
          for (let r = 0; r < this.numRows_; r++) {
              const vtx = this.vertices_[c][r];
              // Calculate initial position based on grid dimensions and cell count
              const initialX = c * (this.dataProvider_.width / (this.numCols_ - 1));
              const initialY = r * (this.dataProvider_.height / (this.numRows_ - 1));

              vtx.posX_ = initialX;
              vtx.posY_ = initialY;
              vtx.refreshVisualPosition_();
          }
      }

      // Recompute transforms for all cells.
      // We gather all unique cells by iterating through all vertices' connected cells.
      const allCells = new Map();
      for (let c = 0; c < this.numCols_; c++) {
          for (let r = 0; r < this.numRows_; r++) {
              this.vertices_[c][r].connectedCells.forEach(cell => {
                  allCells.set(cell.cellId, cell);
              });
          }
      }
      allCells.forEach(cell => cell.updatePerspectiveTransform());

      this.redrawMeshGrid_();
      console.log("Mesh reset to initial state.");
  }
};