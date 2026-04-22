/*
  pixel_art_tool.js
  Version 2.1
  Author: [New Author Name]
  License: MIT
  A simple web-based pixel art editor.
*/

// Core DOM elements and rendering context
let drawingSurface = null;
let renderContext = null;
let colorSelector = null;

// Grid and pixel properties
const gridCellSize = 6;
let drawnCells = [];
let currentGridDimension = gridCellSize * 20;
const gridDimensionLimits = {
  min: 50,
  max: 200
};

// Undo history management
let actionHistory = [];
const maxHistoryLength = 15;

// Default colors and flags
let topCornerColor = 'transparent'; // Stores the color of the (0,0) cell for CSS generation.
// is_mouse_down and current_path were unused in the original functions, so they are removed.

// --- Helper Functions ---

/**
 * Parses an RGB or RGBA color string into an array of [R, G, B] integer values.
 * @param {string} colorStr - The CSS color string (e.g., "rgb(255, 0, 0)", "rgba(100, 50, 20, 0.5)").
 * @returns {number[]|null} An array of [R, G, B] or null if parsing fails.
 */
const parseRgbString = (colorStr) => {
  if (!colorStr) return null;
  const cleanedColor = colorStr.replace(/\s*/g, '');
  const match = cleanedColor.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*\d*\.?\d+)?\)/);
  if (match) {
    return match.slice(1, 4).map(Number);
  }
  return null;
};

/**
 * Converts an RGB color string to its hexadecimal representation.
 * @param {string} rgbColor - The RGB or RGBA color string.
 * @returns {string} The hexadecimal color string (e.g., "#FF0000").
 */
const convertRgbToHex = (rgbColor) => {
  if (rgbColor.startsWith('#')) return rgbColor; // Already a hex code
  const rgbArray = parseRgbString(rgbColor);
  if (!rgbArray || rgbArray.length < 3) {
    return '#000000'; // Default to black if cannot parse
  }
  const toHex = (c) => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(rgbArray[0])}${toHex(rgbArray[1])}${toHex(rgbArray[2])}`;
};

/**
 * Retrieves the color of a specific pixel on the canvas.
 * @param {number} xCoord - The x-coordinate of the pixel.
 * @param {number} yCoord - The y-coordinate of the pixel.
 * @returns {string} The color string (e.g., "rgba(R, G, B, A)") or 'clear' if transparent.
 */
const retrieveCellColor = (xCoord, yCoord) => {
  if (!renderContext) return 'clear';
  const imageData = renderContext.getImageData(xCoord, yCoord, 1, 1).data;
  if (imageData[3] === 0) return 'clear'; // Alpha channel is 0, so it's transparent
  return `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${imageData[3] / 255})`;
};

/**
 * Records an action for undo functionality.
 * @param {number} xPos - X-coordinate of the affected cell.
 * @param {number} yPos - Y-coordinate of the affected cell.
 * @param {string} previousColor - The color of the cell before the action.
 * @param {string} appliedColor - The color applied to the cell by the action.
 */
const recordAction = (xPos, yPos, previousColor, appliedColor) => {
  actionHistory.push({
    x: xPos,
    y: yPos,
    previousColor: previousColor,
    appliedColor: appliedColor
  });
  if (actionHistory.length > maxHistoryLength) {
    actionHistory.shift(); // Remove the oldest action to maintain history size
  }
};

/**
 * Renders a single cell (pixel) on the canvas.
 * @param {number} xCoord - The x-coordinate to draw at.
 * @param {number} yCoord - The y-coordinate to draw at.
 * @param {string} [cellColor='#000000'] - The color of the cell.
 * @param {boolean} [shouldClear=false] - If true, clears the cell instead of drawing.
 */
const renderCell = (xCoord, yCoord, cellColor = '#000000', shouldClear = false) => {
  if (!renderContext) return;

  if (shouldClear) {
    renderContext.clearRect(xCoord, yCoord, gridCellSize, gridCellSize);
  } else {
    renderContext.fillStyle = cellColor;
    renderContext.fillRect(xCoord, yCoord, gridCellSize, gridCellSize);
  }

  // Update the top corner color if this cell is (0,0)
  if (xCoord === 0 && yCoord === 0) {
    topCornerColor = shouldClear ? 'transparent' : cellColor;
  }
};

// --- Main Event Handlers and Logic ---

/**
 * Clears the entire drawing area and resets all related data.
 */
const resetDrawingArea = () => {
  if (!drawingSurface || !renderContext) return;
  renderContext.clearRect(0, 0, drawingSurface.attr('width'), drawingSurface.attr('height'));
  drawnCells = [];
  actionHistory = [];
  $('#css-output-area').html('');
  console.log("Drawing area cleared and history reset.");
};

/**
 * Reverts the last recorded drawing action.
 */
const revertLastAction = () => {
  const lastAction = actionHistory.pop();
  if (!lastAction) {
    console.log("No actions to undo.");
    return;
  }

  const {
    x,
    y,
    previousColor,
    appliedColor
  } = lastAction;

  const cellIndex = drawnCells.findIndex(cell => cell.x === x && cell.y === y);

  if (appliedColor === 'clear') {
    // If the last action was clearing, restore the previous color
    if (previousColor !== 'clear') {
      drawnCells.push({
        x: x,
        y: y,
        color: previousColor
      });
      renderCell(x, y, previousColor, false);
    }
  } else {
    // If the last action was drawing, revert to the previous state
    if (cellIndex !== -1) {
      drawnCells.splice(cellIndex, 1); // Remove the pixel that was drawn
    }
    if (previousColor === 'clear') {
      renderCell(x, y, null, true); // Clear the cell
    } else {
      drawnCells.push({
        x: x,
        y: y,
        color: previousColor
      });
      renderCell(x, y, previousColor, false);
    }
  }
  console.log(`Undid action at (${x}, ${y}).`);
};

/**
 * Adjusts the size of the drawing grid based on user input.
 * @param {Event} event - The click event from the size adjustment buttons.
 */
const adjustGridSize = (event) => {
  const changeAmount = $.data(event.currentTarget, 'amount') * gridCellSize;
  let newSize = currentGridDimension + changeAmount;

  if (newSize < gridDimensionLimits.min || newSize > gridDimensionLimits.max) {
    console.warn(`Attempted to resize grid outside limits: ${newSize}px.`);
    return;
  }

  currentGridDimension = newSize;
  drawingSurface.attr('width', currentGridDimension);
  drawingSurface.attr('height', currentGridDimension);
  resetDrawingArea(); // Clear and reset after resize
  console.log(`Grid resized to ${currentGridDimension}x${currentGridDimension}.`);
};

/**
 * Handles pointer down events (mouse click) on the canvas.
 * @param {Event} event - The mouse down event.
 */
const handlePointerDown = (event) => {
  event.preventDefault(); // Prevent default browser behavior

  const clientX = event.clientX - drawingSurface.offset().left + document.body.scrollLeft;
  const clientY = event.clientY - drawingSurface.offset().top + document.body.scrollTop;

  const targetX = Math.floor(clientX / gridCellSize) * gridCellSize;
  const targetY = Math.floor(clientY / gridCellSize) * gridCellSize;

  const currentColor = $("input[type='color'].picker").css('background-color');
  const existingCellColor = retrieveCellColor(targetX, targetY);

  if (event.shiftKey) { // Shift-click to pick color
    const rgbValues = parseRgbString(existingCellColor);
    if (rgbValues && colorSelector && colorSelector.get(0).color) {
      colorSelector.get(0).color.fromRGB(rgbValues[0] / 255, rgbValues[1] / 255, rgbValues[2] / 255);
      console.log(`Picked color: ${existingCellColor}`);
    }
  } else if (event.ctrlKey || event.metaKey) { // Ctrl/Meta-click to erase
    if (existingCellColor === 'clear') return;
    renderCell(targetX, targetY, null, true);
    recordAction(targetX, targetY, existingCellColor, 'clear');

    const cellIndex = drawnCells.findIndex(cell => cell.x === targetX && cell.y === targetY);
    if (cellIndex !== -1) {
      drawnCells.splice(cellIndex, 1);
    }
    console.log(`Erased cell at (${targetX}, ${targetY}).`);
  } else { // Regular click to draw
    renderCell(targetX, targetY, currentColor, false);
    recordAction(targetX, targetY, existingCellColor, currentColor);

    const cellIndex = drawnCells.findIndex(cell => cell.x === targetX && cell.y === targetY);
    if (cellIndex !== -1) {
      drawnCells[cellIndex].color = currentColor; // Update existing cell's color
    } else {
      drawnCells.push({
        x: targetX,
        y: targetY,
        color: currentColor
      }); // Add new cell
    }
    console.log(`Drew cell at (${targetX}, ${targetY}) with color ${currentColor}.`);
  }
};

/**
 * Handles pointer move events on the canvas.
 * (Currently a stub, as continuous drawing was not implemented in the original code snippet.)
 * @param {Event} event - The mouse move event.
 */
const handlePointerMove = (event) => {
  // If continuous drawing functionality were desired, logic would be placed here.
  // The original function performed calculations but had no side effects.
};

/**
 * Generates CSS code for the drawn pixel art.
 */
const produceCssOutput = () => {
  if (!drawnCells.length && topCornerColor === 'transparent') {
    $('#css-output-area').html('/* No pixels drawn to generate code */');
    return;
  }

  let cssPrefix = `#pixel-art-container {
  width: ${currentGridDimension}px;
  height: ${currentGridDimension}px;
  border: 1px solid #ccc; /* Added for better visibility of the container */
  display: inline-block;
  position: relative; /* Added for shadow positioning */
}

#pixel-art-container .pixel-layer {
  width: ${gridCellSize}px;
  height: ${gridCellSize}px;
  background: ${topCornerColor};
  box-shadow: `;

  const shadowParts = [];
  for (const cell of drawnCells) {
    // Skip the top-left cell if its color is already set as the background
    if (cell.x === 0 && cell.y === 0 && cell.color === topCornerColor) {
      continue;
    }
    const hexColor = convertRgbToHex(cell.color);
    shadowParts.push(`${cell.x}px ${cell.y}px ${hexColor}`);
  }

  const cssOutput = `${cssPrefix}${shadowParts.join(',\n              ') || 'none'};\n}`;
  $('#css-output-area').html(cssOutput);
  console.log("CSS output generated.");
};

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
  drawingSurface = $('#pixel-canvas');
  colorSelector = $('input[type="color"].picker');
  renderContext = drawingSurface.get(0).getContext('2d');

  // Set initial canvas dimensions
  drawingSurface.attr('width', currentGridDimension);
  drawingSurface.attr('height', currentGridDimension);

  // ZClip setup for copy functionality (assuming ZeroClipboard.swf is available)
  $('#copy-html-btn').zclip({
    path: 'js/ZeroClipboard.swf',
    copy: function() {
      return $('#html-output-area').text(); // Placeholder for potential HTML output
    }
  });
  $('#copy-css-btn').zclip({
    path: 'js/ZeroClipboard.swf',
    copy: function() {
      return $('#css-output-area').text();
    }
  });

  // Event bindings for user interaction
  drawingSurface.on('mousedown', handlePointerDown);
  drawingSurface.on('mousemove', handlePointerMove); // Function body is a stub.

  $('#generate-code-btn').on('click', produceCssOutput);
  $('#undo-action-btn').on('click', revertLastAction);
  $('#clear-drawing-btn').on('click', resetDrawingArea);

  // Size adjustment button setup
  const sizeDownBtn = $('#grid-size-down-btn');
  const sizeUpBtn = $('#grid-size-up-btn');

  sizeDownBtn.data('amount', -1);
  sizeUpBtn.data('amount', 1);

  sizeDownBtn.add(sizeUpBtn).on('click', adjustGridSize);
});