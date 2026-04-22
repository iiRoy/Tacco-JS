/*global window, document, $ */

// This script manages a cellular automaton simulation, specifically a variation
// of Conway's Game of Life, displayed on an HTML5 canvas.
//
// Each cell's internal state is represented by a 24-bit number. The lower 24 bits
// are effectively 24 independent Game of Life simulations running in parallel,
// where each bit position corresponds to a different 'color channel' or 'sub-game'.
// These states are stored in 'currentCellStates'.
// The 'getGridCellIndex' function translates (row, col) coordinates to an
// index within this state vector.
//
// To prevent performance hiccups from garbage collection during animation,
// memory allocations are minimized once the simulation is active.
//
// The 'advanceSimulationStep' function calculates the new state for all cells
// in 'nextCellStates' and then swaps it with 'currentCellStates'.
// 'refreshGridDisplay' is responsible for rendering the current state onto the canvas element.


// --- Configuration Constants ---
const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;
const DEFAULT_SIM_INTERVAL_MS = 100; // Time in milliseconds between simulation steps
const COLOR_BITMASK = 0xFFFFFF; // Mask for 24-bit color values

// --- Global State Variables ---
let totalCellCount = GRID_WIDTH * GRID_HEIGHT;
let currentCellStates = new Array(totalCellCount).fill(0); // Holds the current state of each cell
let nextCellStates = new Array(totalCellCount).fill(0);   // Holds the computed next state

let displayCanvas;     // The <canvas> DOM element for rendering
let renderContext;     // The 2D rendering context of the canvas
let pixelBuffer;       // An ImageData object used for efficient pixel manipulation
let simulationTimerId = null; // Stores the ID of the setInterval timer
let isSimulationActive = false; // Flag indicating if the simulation is running

let isDrawingModeActive = false; // Is the interactive drawing tool enabled?
const drawingToolColor = { r: 0, g: 0, b: 0 }; // Current color for the drawing tool (RGB)
let isDrawingMouseDown = false;   // Is the mouse button currently pressed for drawing?
let lastDrawnPosition = { x: -1, y: -1 }; // Stores the last grid coordinate drawn to avoid duplicates


/**
 * Sets the 24-bit color state for a specific cell in a given state array.
 * The internal representation uses 0xFFFFFF for "alive" (white), and 0 for "dead" (black),
 * which is then inverted during display.
 * @param {number[]} targetGrid - The array (currentCellStates or nextCellStates) to update.
 * @param {number} cellPosition - The linear index of the cell in the array.
 * @param {number} redVal - Red component (0-255).
 * @param {number} greenVal - Green component (0-255).
 * @param {number} blueVal - Blue component (0-255).
 */
function assignCellVisualState(targetGrid, cellPosition, redVal, greenVal, blueVal) {
  // Basic validation for cell index
  if (cellPosition < 0 || cellPosition >= totalCellCount) {
    console.warn("Attempted to set color for invalid cell position:", cellPosition);
    return;
  }
  // Combine RGB components into a single 24-bit number
  const encodedColor = (redVal << 16) | (greenVal << 8) | blueVal;
  // Invert the color for internal representation: white (all bits set) = dead, black (all bits zero) = alive.
  // This simplifies the Game of Life logic where 0 means "dead".
  targetGrid[cellPosition] = (~encodedColor) & COLOR_BITMASK;
}

/**
 * Converts 2D grid coordinates (column, row) into a 1D array index.
 * @param {number} xCoord - The column index (0 to GRID_WIDTH-1).
 * @param {number} yCoord - The row index (0 to GRID_HEIGHT-1).
 * @returns {number} The 1D array index, or -1 if coordinates are out of bounds.
 */
function getGridCellIndex(xCoord, yCoord) {
  if (xCoord < 0 || xCoord >= GRID_WIDTH || yCoord < 0 || yCoord >= GRID_HEIGHT) {
    return -1; // Indicate invalid index
  }
  return yCoord * GRID_WIDTH + xCoord;
}

/**
 * Calculates the optimal pixel size for each grid cell to fit the window.
 * Ensures cells are at least 1 pixel in size.
 * @returns {number} The side length (in pixels) of a square cell.
 */
function calculateCellDisplaySize() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const widthBasedSize = Math.ceil(viewportWidth / GRID_WIDTH);
  const heightBasedSize = Math.ceil(viewportHeight / GRID_HEIGHT);
  // Take the maximum to ensure the grid fits in both dimensions
  // Ensure a minimum size of 1 pixel for visibility
  return Math.max(1, Math.max(widthBasedSize, heightBasedSize));
}

/**
 * Renders the current state of the grid to the canvas element.
 * This function handles canvas resizing and efficient pixel drawing using ImageData.
 */
function refreshGridDisplay() {
  if (!displayCanvas || !renderContext) {
    console.error("Canvas or context not initialized for display refresh.");
    return;
  }

  const currentViewportWidth = window.innerWidth;
  const currentViewportHeight = window.innerHeight;
  const cellSizePx = calculateCellDisplaySize(); // Size of one cell in pixels

  const effectiveGridRenderWidth = cellSizePx * GRID_WIDTH;
  const effectiveGridRenderHeight = cellSizePx * GRID_HEIGHT;

  // Recreate pixel buffer if its dimensions no longer match the calculated grid size.
  // This buffer holds the full rendered grid, potentially larger than the viewport.
  if (!pixelBuffer || pixelBuffer.width !== effectiveGridRenderWidth || pixelBuffer.height !== effectiveGridRenderHeight) {
    pixelBuffer = renderContext.createImageData(effectiveGridRenderWidth, effectiveGridRenderHeight);
  }

  // Resize the actual <canvas> DOM element to match the current viewport dimensions.
  // This causes the browser to clip the drawn image data if it's larger.
  if (displayCanvas.width !== currentViewportWidth || displayCanvas.height !== currentViewportHeight) {
    displayCanvas.width = currentViewportWidth;
    displayCanvas.height = currentViewportHeight;
  }

  const pixelBufferData = pixelBuffer.data;
  const bufferStride = effectiveGridRenderWidth * 4; // 4 bytes per pixel (RGBA)

  // Iterate through each logical grid cell
  for (let r = 0; r < GRID_HEIGHT; r++) {
    const rowStartPixelY = r * cellSizePx;
    // Optimization: Skip drawing rows that would be entirely off-screen
    if (rowStartPixelY >= currentViewportHeight) { continue; }

    for (let c = 0; c < GRID_WIDTH; c++) {
      const colStartPixelX = c * cellSizePx;
      // Optimization: Skip drawing columns that would be entirely off-screen
      if (colStartPixelX >= currentViewportWidth) { continue; }

      const cellIndex = getGridCellIndex(c, r);
      if (cellIndex === -1) { continue; } // Should not happen with valid r,c loops

      // Retrieve cell color, then invert for display (white=dead, black=alive)
      const internalColorValue = currentCellStates[cellIndex];
      const displayColorValue = (~internalColorValue) & COLOR_BITMASK;
      const redComponent = (displayColorValue >> 16) & 0xFF;
      const greenComponent = (displayColorValue >> 8) & 0xFF;
      const blueComponent = (displayColorValue >> 0) & 0xFF;

      // Fill the block of pixels corresponding to this grid cell
      for (let br = 0; br < cellSizePx; br++) {
        const currentPixelY = rowStartPixelY + br;
        // Optimization: Stop drawing pixels if they exceed the viewport height
        if (currentPixelY >= currentViewportHeight) { break; }

        for (let bc = 0; bc < cellSizePx; bc++) {
          const currentPixelX = colStartPixelX + bc;
          // Optimization: Stop drawing pixels if they exceed the viewport width
          if (currentPixelX >= currentViewportWidth) { break; }

          // Calculate the 1D index in the pixel buffer data array (RGBA format)
          const pixelBufferIdx = (currentPixelY * effectiveGridRenderWidth + currentPixelX) * 4;

          pixelBufferData[pixelBufferIdx] = redComponent;
          pixelBufferData[pixelBufferIdx + 1] = greenComponent;
          pixelBufferData[pixelBufferIdx + 2] = blueComponent;
          pixelBufferData[pixelBufferIdx + 3] = 0xFF; // Set alpha to fully opaque
        }
      }
    }
  }
  // Write the completed pixel buffer to the canvas at (0,0)
  renderContext.putImageData(pixelBuffer, 0, 0);
}

/**
 * Resets all cells on the grid to a "dead" (black) state.
 * Then updates the display.
 */
function resetGridToEmpty() {
  console.log("Clearing simulation grid to an empty state.");
  for (let i = 0; i < totalCellCount; i++) {
    currentCellStates[i] = 0; // 0 represents a dead cell internally
  }
  refreshGridDisplay();
}

/**
 * Fills the grid with cells of random colors.
 * Then updates the display.
 */
function initializeRandomColors() {
  if (!currentCellStates || currentCellStates.length === 0) {
    console.error("Cannot randomize colors, cell states array not initialized.");
    return;
  }
  console.log("Initializing grid with random colors.");
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Generate random RGB components (0-255)
      const redComponent = (Math.random() * 256) | 0;
      const greenComponent = (Math.random() * 256) | 0;
      const blueComponent = (Math.random() * 256) | 0;
      assignCellVisualState(currentCellStates, getGridCellIndex(x, y), redComponent, greenComponent, blueComponent);
    }
  }
  refreshGridDisplay();
}

/**
 * Executes one step of the Game of Life simulation.
 * It computes the next state for all cells and then swaps the state arrays.
 */
function advanceSimulationStep() {
  // Defensive check, though setInterval should be cleared if not active
  if (!isSimulationActive) { return; }

  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      const currentCellIdx = getGridCellIndex(c, r);
      if (currentCellIdx === -1) continue; // Should not happen with valid r,c loops

      // These variables will accumulate the neighbor count in binary, bitwise
      // for all 24 parallel Game of Life instances.
      let neighborSumBit0 = 0; // Least significant bit of neighbor count
      let neighborSumBit1 = 0;
      let neighborSumBit2 = 0; // Most significant bit of neighbor count

      // Iterate through the 8 neighbors (including diagonals)
      for (let nr = r - 1; nr <= r + 1; nr++) {
        for (let nc = c - 1; nc <= c + 1; nc++) {
          // Skip the current cell itself
          if (nr === r && nc === c) { continue; }

          // Apply toroidal (wrap-around) boundary conditions
          const wrappedCol = (nc + GRID_WIDTH) % GRID_WIDTH;
          const wrappedRow = (nr + GRID_HEIGHT) % GRID_HEIGHT;

          const neighborIdx = getGridCellIndex(wrappedCol, wrappedRow);
          if (neighborIdx === -1) continue;

          // 'neighborIsAlive' is the 24-bit state of the neighbor.
          // If any bit is set (non-zero), it's considered "alive" for that sub-game.
          const neighborIsAlive = currentCellStates[neighborIdx];

          // These three lines implement a 3-bit ripple-carry adder,
          // applied bitwise to all 24 parallel games.
          // It counts how many neighbors are "alive" for each of the 24 bit positions.
          const carryToBit1 = neighborSumBit0 & neighborIsAlive;
          const carryToBit2 = neighborSumBit1 & carryToBit1;

          neighborSumBit0 ^= neighborIsAlive; // Sum bit 0 (XOR with current neighbor)
          neighborSumBit1 ^= carryToBit1;     // Sum bit 1 (XOR with carry from bit 0)
          neighborSumBit2 ^= carryToBit2;     // Sum bit 2 (XOR with carry from bit 1)
        }
      }

      // Apply Game of Life rules based on the 24-bit neighbor count:
      // 1. A dead cell with exactly 3 live neighbors becomes a live cell.
      // 2. A live cell with 2 or 3 live neighbors remains a live cell.
      // 3. In all other cases, a cell dies or remains dead.

      const currentCellAliveState = currentCellStates[currentCellIdx];
      let cellNextStateValue = 0; // Default next state is dead

      // Condition for 2 or 3 neighbors:
      // (neighborSumBit1 is 1 AND neighborSumBit2 is 0)
      // This means the neighbor count is 2 (binary 010) or 3 (binary 011).
      const hasTwoOrThreeNeighbors = (neighborSumBit1 & (~neighborSumBit2));

      if (hasTwoOrThreeNeighbors) {
        // If neighborSumBit0 is 1, it implies 3 neighbors (binary 011).
        // A cell with 3 neighbors is born or survives.
        if (neighborSumBit0) {
          // Rule 1: Cell becomes alive. It gets a default "alive" color state (white internally).
          cellNextStateValue = COLOR_BITMASK;
        } else {
          // If neighborSumBit0 is 0, it implies 2 neighbors (binary 010).
          // Rule 2: A cell with 2 neighbors survives, retaining its current color.
          cellNextStateValue = currentCellAliveState;
        }
      }
      nextCellStates[currentCellIdx] = cellNextStateValue;
    }
  }

  // Efficiently swap the current and next state arrays.
  // This avoids copying large arrays and minimizes memory allocations.
  [currentCellStates, nextCellStates] = [nextCellStates, currentCellStates];
  refreshGridDisplay(); // Update the visual display after state change
}

/**
 * Loads a predefined pattern onto the grid.
 * @param {number} patternIdentifier - An ID indicating which pattern to load.
 */
function loadPattern(patternIdentifier) {
  const selectedPatternId = patternIdentifier ?? 0; // Use nullish coalescing for default to 0
  resetGridToEmpty(); // Always clear the board before loading a new pattern

  // Helper function to apply a specific color to a list of cell coordinates
  const applyPatternColor = (cellCoordsList, r, g, b) => {
    for (const coordPair of cellCoordsList) {
      const [x, y] = coordPair;
      assignCellVisualState(currentCellStates, getGridCellIndex(x, y), r, g, b);
    }
  };

  switch (selectedPatternId) {
    case 0: // Original Pattern 0: Multiple lines of different colors
      console.log("Loading pattern 0: Multi-colored lines.");
      applyPatternColor([[41,23], [42,23], [43,23], [44,23], [45,23], [46,23], [47,23], [48,23],
                         [41,26], [42,26], [43,26], [44,26], [45,26], [46,26], [47,26], [48,26]], 54, 99, 204);
      applyPatternColor([[41,22], [42,22], [43,22], [44,22], [45,22], [46,22], [47,22], [48,22],
                         [41,27], [42,27], [43,27], [44,27], [45,27], [46,27], [47,27], [48,27]], 40, 187, 130);
      applyPatternColor([[41,21], [42,21], [43,21], [44,21], [45,21], [46,21], [47,21], [48,21],
                         [41,28], [42,28], [43,28], [44,28], [45,28], [46,28], [47,28], [48,28]], 170, 37, 37);
      break;

    case 1: // Original Pattern 1: Longer, shifted lines
      console.log("Loading pattern 1: Extended lines.");
      const baseLongLineCoords = [
          [25,25], [26,25], [27,25], [28,25], [29,25], [30,25], [31,25], [32,25],
          [34,25], [35,25], [36,25], [37,25], [38,25], [42,25], [43,25], [44,25],
          [51,25], [52,25], [53,25], [54,25], [55,25], [56,25], [57,25], [59,25],
          [60,25], [61,25], [62,25], [63,25]
      ];
      applyPatternColor(baseLongLineCoords, 25, 57, 150);
      // Shift the lines down by one and two rows respectively
      applyPatternColor(baseLongLineCoords.map(c => [c[0], c[1] + 1]), 57, 150, 25);
      applyPatternColor(baseLongLineCoords.map(c => [c[0], c[1] + 2]), 150, 57, 25);
      break;

    case 2: // NEW pattern: Glider
      console.log("Loading pattern 2: Classic Glider.");
      applyPatternColor([[1,0],[2,1],[0,2],[1,2],[2,2]], 100, 100, 255); // A blue glider
      break;

    case 3: // Original Pattern 3: Small black square
      console.log("Loading pattern 3: Small square.");
      applyPatternColor([[0, 1],[1,2],[2,0],[2,1],[2,2]], 0,0,0); // Black cells
      break;

    default:
      console.warn(`Pattern with ID ${selectedPatternId} not found. Loading default pattern 0.`);
      loadPattern(0); // Recursively call with default
      return; // Exit to avoid double refreshGridDisplay
  }
  refreshGridDisplay(); // Update display after loading pattern
}

/**
 * Calculates the grid coordinates (column, row) from a mouse event's clientX/Y.
 * Clamps the coordinates to be within the grid boundaries.
 * @param {MouseEvent} mouseEvent - The mouse event object.
 * @returns {{x: number, y: number}} An object containing the grid column (x) and row (y).
 */
function getMouseGridCoordinates(mouseEvent) {
  if (!displayCanvas) {
    console.error("Display canvas not available for mouse coordinate calculation.");
    return { x: -1, y: -1 }; // Indicate error
  }
  const canvasRect = displayCanvas.getBoundingClientRect(); // Get canvas position and size
  const cellSize = calculateCellDisplaySize();

  // Calculate mouse position relative to the canvas
  const canvasX = mouseEvent.clientX - canvasRect.left;
  const canvasY = mouseEvent.clientY - canvasRect.top;

  // Convert pixel coordinates to grid coordinates
  let col = Math.floor(canvasX / cellSize);
  let row = Math.floor(canvasY / cellSize);

  // Clamp coordinates to grid boundaries
  col = Math.max(0, Math.min(GRID_WIDTH - 1, col));
  row = Math.max(0, Math.min(GRID_HEIGHT - 1, row));

  return { x: col, y: row };
}

/**
 * Event handler for when the mouse button is pressed down in drawing mode.
 * Marks drawing as active and draws the initial cell.
 * @param {MouseEvent} event - The mouse event.
 */
function handleDrawingStart(event) {
  isDrawingMouseDown = true;
  const gridPos = getMouseGridCoordinates(event);
  if (gridPos.x === -1 || gridPos.y === -1) return; // Invalid position

  assignCellVisualState(currentCellStates, getGridCellIndex(gridPos.x, gridPos.y),
                        drawingToolColor.r, drawingToolColor.g, drawingToolColor.b);
  lastDrawnPosition = { x: gridPos.x, y: gridPos.y }; // Store for debouncing
  if (!isSimulationActive) { refreshGridDisplay(); } // Update display if not simulating
}

/**
 * Event handler for when the mouse button is released in drawing mode.
 * Resets drawing state.
 */
function handleDrawingEnd() {
  isDrawingMouseDown = false;
  lastDrawnPosition = { x: -1, y: -1 }; // Reset last drawn position
}

/**
 * Event handler for mouse movement in drawing mode.
 * Draws cells continuously as the mouse moves, but only if the cell position changes.
 * @param {MouseEvent} event - The mouse event.
 */
function handleDrawingMotion(event) {
  if (!isDrawingMouseDown || !isDrawingModeActive) {
    return; // Only draw if mouse is down and drawing mode is active
  }

  const currentGridPos = getMouseGridCoordinates(event);
  if (currentGridPos.x === -1 || currentGridPos.y === -1) return;

  // Only update if the mouse has moved to a different grid cell
  if (currentGridPos.x !== lastDrawnPosition.x || currentGridPos.y !== lastDrawnPosition.y) {
    assignCellVisualState(currentCellStates, getGridCellIndex(currentGridPos.x, currentGridPos.y),
                          drawingToolColor.r, drawingToolColor.g, drawingToolColor.b);
    lastDrawnPosition = { x: currentGridPos.x, y: currentGridPos.y };
    if (!isSimulationActive) { refreshGridDisplay(); } // Update display if not simulating
  }
}

/**
 * Toggles the interactive drawing mode on and off.
 * Attaches/detaches mouse event listeners and updates UI.
 */
function toggleDrawingMode() {
  isDrawingModeActive = !isDrawingModeActive;
  const $canvasElement = $('#game-canvas');
  const $drawBtn = $('#drawing-tool-btn');

  if (isDrawingModeActive) {
    console.log("Drawing mode activated.");
    $canvasElement.on('mousedown.drawing', handleDrawingStart);
    $canvasElement.on('mousemove.drawing', handleDrawingMotion);
    // Bind mouseup to document to catch releases outside canvas
    $(document).on('mouseup.drawing', handleDrawingEnd);
    $canvasElement.addClass('drawing-cursor'); // Apply a custom cursor
    $drawBtn.addClass('tool-active'); // Highlight the button
  } else {
    console.log("Drawing mode deactivated.");
    $canvasElement.off('mousedown.drawing');
    $canvasElement.off('mousemove.drawing');
    $(document).off('mouseup.drawing');
    $canvasElement.removeClass('drawing-cursor');
    $drawBtn.removeClass('tool-active');
    handleDrawingEnd(); // Ensure drawing state is fully reset
  }
}

/**
 * Starts the Game of Life simulation.
 * Sets up a recurring timer to call advanceSimulationStep.
 */
function startSimulation() {
  if (isSimulationActive) {
    console.warn("Simulation is already running.");
    return;
  }
  isSimulationActive = true;
  simulationTimerId = setInterval(advanceSimulationStep, DEFAULT_SIM_INTERVAL_MS);
  $('#start-btn').hide();
  $('#pause-btn').show();
  console.log("Simulation started.");
}

/**
 * Stops the Game of Life simulation.
 * Clears the recurring timer.
 */
function stopSimulation() {
  if (!isSimulationActive) {
    console.warn("Simulation is not active, cannot stop.");
    return;
  }
  isSimulationActive = false;
  clearInterval(simulationTimerId);
  simulationTimerId = null; // Clear the timer ID
  $('#start-btn').show();
  $('#pause-btn').hide();
  console.log("Simulation paused.");
  refreshGridDisplay(); // Ensure display is updated to the latest static state
}

/**
 * Initializes the application once the DOM is ready.
 * Sets up canvas, event listeners, and initial grid state.
 */
$(document).ready(function() {
  console.log("Application initialization sequence started.");
  displayCanvas = document.getElementById('game-canvas'); // Get canvas by new ID
  if (!displayCanvas) {
    console.error("Canvas element with ID 'game-canvas' not found. Exiting initialization.");
    return;
  }
  renderContext = displayCanvas.getContext('2d');
  if (!renderContext) {
    console.error("Failed to get 2D rendering context from canvas.");
    return;
  }

  // --- UI Event Listeners and Setup ---

  // Drawing tool button and color picker
  $('#drawing-tool-btn').on('click', toggleDrawingMode);
  $('#drawing-tool-btn').ColorPicker({ // Assuming ColorPicker is an external jQuery plugin
    onShow: function() {
      return isDrawingModeActive; // Only show picker if drawing mode is enabled
    },
    onChange: function(hsb, hex, rgb) {
      drawingToolColor.r = rgb.r;
      drawingToolColor.g = rgb.g;
      drawingToolColor.b = rgb.b;
      $('#color-swatch').css('background-color', '#' + hex); // Update visual swatch
    }
  });

  // Simulation control buttons
  $('#start-btn').on('click', startSimulation);
  $('#pause-btn').on('click', stopSimulation);

  // Grid manipulation buttons
  $('#clear-grid-btn').on('click', function() {
    stopSimulation(); // Stop simulation before clearing
    resetGridToEmpty();
  });
  $('#randomize-colors-btn').on('click', function() {
    stopSimulation(); // Stop simulation before randomizing
    initializeRandomColors();
  });

  // Pattern loading buttons
  $('#load-pattern-0-btn').on('click', () => { stopSimulation(); loadPattern(0); });
  $('#load-pattern-1-btn').on('click', () => { stopSimulation(); loadPattern(1); });
  $('#load-pattern-2-btn').on('click', () => { stopSimulation(); loadPattern(2); }); // New pattern button
  $('#load-pattern-3-btn').on('click', () => { stopSimulation(); loadPattern(3); });

  // Handle window resizing to adjust canvas and redraw
  $(window).on('resize', function() {
    if (!isSimulationActive) {
      refreshGridDisplay(); // Only redraw immediately if not animating
    }
  });

  // --- Initial Application State ---
  resetGridToEmpty();       // Start with a clean grid
  initializeRandomColors(); // Fill with some initial random colors
  loadPattern(0);           // Load a default pattern
  startSimulation();        // Begin the simulation automatically

  console.log("Application initialization complete. Simulation is now running.");
});