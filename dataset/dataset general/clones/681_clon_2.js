/*
  pixel_art_sketchpad.js

  Version: 2.0
  Author:  A. Developer (adeveloper@example.com)
  License: MIT
*/
var _drawingAreaElement, _hueSelectorElement, colorToHexadecimal, recordOperation, adjustSurfaceDimensions, surfaceDimension, dimensionLimits, eraseSurface, _renderContext, activeStrokeSegments, renderUnit, produceMarkup, fetchUnitColor, extractRgbValues, isPointerDepressed, handlePointerDown, handlePointerMove, handlePointerUp, initialBackgroundTone, unit_dimension, renderedUnits, actionHistory, revertLastAction, historyCapacity;

_drawingAreaElement = null;
_renderContext = null;
_hueSelectorElement = null;

unit_dimension = 6;
renderedUnits = [];
actionHistory = [];
historyCapacity = 15;

surfaceDimension = unit_dimension * 20;

dimensionLimits = {
  min: 50,
  max: 200
};

initialBackgroundTone = 'transparent';

isPointerDepressed = false;

activeStrokeSegments = [];

// Initialize the application once the DOM is ready
$(function() {
  _drawingAreaElement = $('#drawingCanvas');
  _hueSelectorElement = $('input.palette-picker');
  _renderContext = $('#drawingCanvas').get(0).getContext('2d');

  // Store data for size modification buttons
  $.data($('#shrinkButton')[0], 'amount', -1);
  $.data($('#growButton')[0], 'amount', 1);

  // Set up clipboard functionality for HTML code
  $('a#grabHtml').zclip({
    path: 'assets/js/ZeroClipboard.swf',
    copy: function() {
      return $('#htmlOutput').text();
    }
  });

  // Set up clipboard functionality for CSS code
  $('a#grabCss').zclip({
    path: 'assets/js/ZeroClipboard.swf',
    copy: function() {
      return $('#cssOutput').text();
    }
  });

  // Attach event listeners to UI elements
  _drawingAreaElement.bind('mousedown', handlePointerDown);
  $('#createCodeButton').bind('click', produceMarkup);
  $('#revertButton').bind('click', revertLastAction);
  $('#resetButton').bind('click', eraseSurface);

  // Bind click events for size adjustment buttons
  return $('#shrinkButton, #growButton').bind('click', adjustSurfaceDimensions);
});

// Function to modify the drawing surface's dimensions
adjustSurfaceDimensions = function(evt) {
  var newSizeValue;
  newSizeValue = surfaceDimension + $.data(evt.currentTarget, 'amount') * unit_dimension;

  // Prevent resizing beyond defined limits
  if (newSizeValue < dimensionLimits.min || newSizeValue > dimensionLimits.max) return;

  surfaceDimension = newSizeValue;
  _drawingAreaElement.attr('width', surfaceDimension);
  _drawingAreaElement.attr('height', surfaceDimension);

  // Clear the canvas after resizing
  return eraseSurface();
};

// Function to undo the last drawing action
revertLastAction = function() {
  var shouldClear, removedUnit, previousAction, graphicElement, idx, _len;

  previousAction = actionHistory.pop();
  if (!previousAction) return; // No actions to undo

  shouldClear = false;

  if (previousAction.new_color === 'clear') {
    // Re-add the cleared pixel with its old color
    renderedUnits.push({
      x: previousAction.x,
      y: previousAction.y,
      color: previousAction.old_color
    });
  } else {
    // Find and remove the pixel that was changed
    for (idx = 0, _len = renderedUnits.length; idx < _len; idx++) {
      graphicElement = renderedUnits[idx];
      if (graphicElement.x === previousAction.x && graphicElement.y === previousAction.y) {
        removedUnit = renderedUnits.splice(idx, 1)[0];
        break;
      }
    }

    // If the old state was 'clear', mark for clearing
    if (previousAction.old_color === 'clear') {
      shouldClear = true;
    } else {
      // Restore the pixel's old color and re-add it
      removedUnit.color = previousAction.old_color;
      renderedUnits.push(removedUnit);
    }
  }

  // Redraw the pixel with its previous state
  return renderUnit(previousAction.x, previousAction.y, previousAction.old_color, shouldClear);
};

// Clears all drawn elements from the surface
eraseSurface = function() {
  _renderContext.clearRect(0, 0, _drawingAreaElement.attr('width'), _drawingAreaElement.attr('width'));
  renderedUnits = []; // Reset stored pixel data
  actionHistory = []; // Clear the undo history
  return $('#cssOutput').html(''); // Clear generated CSS output
};

// Handles the event when the mouse button is pressed down
handlePointerDown = function(evt) {
  var chosenShade, coordX, coordY, graphicElement, currentUnitShade, colorComponents, idx, _len, _len2;

  // Calculate canvas coordinates based on event position
  coordX = evt.clientX - _drawingAreaElement.offset().left + document.body.scrollLeft;
  coordY = evt.clientY - _drawingAreaElement.offset().top + document.body.scrollTop;

  // Snap coordinates to the grid based on unit dimension
  coordX = ~~(coordX / unit_dimension) * unit_dimension;
  coordY = ~~(coordY / unit_dimension) * unit_dimension;

  chosenShade = $("input.palette-picker").css('background-color');
  currentUnitShade = fetchUnitColor(coordX, coordY);

  /*
    Logic for various pointer actions:
    - If SHIFT is pressed, sample the pixel's color.
    - If CTRL/META is pressed, erase the pixel.
    - Otherwise, simply draw the pixel with the current selected color.
  */
  if (evt.shiftKey) {
    colorComponents = extractRgbValues(currentUnitShade);
    if (colorComponents) {
      _hueSelectorElement.get(0).color.fromRGB(colorComponents[0] / 255, colorComponents[1] / 255, colorComponents[2] / 255);
    }
  } else if (evt.ctrlKey || evt.metaKey) {
    if (currentUnitShade === 'clear') return; // Already clear, nothing to do

    renderUnit(coordX, coordY, null, true); // Clear the unit
    recordOperation(coordX, coordY, currentUnitShade, 'clear'); // Record the clear action

    // Remove the cleared unit from the stored list
    for (idx = 0, _len = renderedUnits.length; idx < _len; idx++) {
      graphicElement = renderedUnits[idx];
      if (graphicElement.x === coordX && graphicElement.y === coordY) {
        renderedUnits.splice(idx, 1);
        break;
      }
    }
  } else {
    renderUnit(coordX, coordY, chosenShade); // Draw the unit
    recordOperation(coordX, coordY, currentUnitShade, chosenShade); // Record the draw action

    // Remove any existing pixel at this location before adding the new one
    for (idx = 0, _len2 = renderedUnits.length; idx < _len2; idx++) {
      graphicElement = renderedUnits[idx];
      if (graphicElement.x === coordX && graphicElement.y === coordY) {
        renderedUnits.splice(idx, 1);
        break;
      }
    }

    // Add the newly drawn pixel to the list
    return renderedUnits.push({
      x: coordX,
      y: coordY,
      color: chosenShade
    });
  }
};

// Handles mouse movement (currently does nothing significant in this implementation)
handlePointerMove = function(evt) {
  var chosenShade, coordX, coordY, currentUnitShade;
  coordX = evt.clientX - _drawingAreaElement.offset().left + document.body.scrollLeft;
  coordY = evt.clientY - _drawingAreaElement.offset().top + document.body.scrollTop;
  coordX = ~~(coordX / unit_dimension) * unit_dimension;
  coordY = ~~(coordY / unit_dimension) * unit_dimension;
  chosenShade = $("input.palette-picker").css('background-color');
  return currentUnitShade = fetchUnitColor(coordX, coordY);
};

// Handles the event when the mouse button is released
handlePointerUp = function(evt) {
  return isPointerDepressed = false;
};

/*
  Function to draw or clear a single unit on the canvas.
  @param  x_coord     X coordinate for rendering
  @param  y_coord     Y coordinate for rendering
  @param  unit_color  Color to fill the unit with
  @param  to_clear    Boolean, true if the unit should be cleared
*/
renderUnit = function(x_coord, y_coord, unit_color, to_clear) {
  if (unit_color == null) unit_color = '#000000'; // Default to black
  if (to_clear == null) to_clear = false; // Default to not clearing

  if (to_clear) {
    _renderContext.clearRect(x_coord, y_coord, unit_dimension, unit_dimension);
    // If clearing the top-left pixel, reset the origin background color
    if (x_coord === 0 && y_coord === 0) return initialBackgroundTone = 'transparent';
  } else {
    _renderContext.fillStyle = unit_color;
    _renderContext.fillRect(x_coord, y_coord, unit_dimension, unit_dimension);
    // If drawing the top-left pixel, set the origin background color
    if (x_coord === 0 && y_coord === 0) return initialBackgroundTone = unit_color;
  }
};

// Generates the CSS code for the drawn pixel art
produceMarkup = function() {
  var generatedOutput, styleDeclaration, stylePreamble, stylePostamble, hexColorValue, graphicElement, iter, len;

  stylePreamble = "#artwork {\n\twidth: " + surfaceDimension + "px;\n\theight: " + surfaceDimension + "px;\n}\n\n#artwork div{\n\twidth: " + unit_dimension + "px;\n\theight: " + unit_dimension + "px;\n\tbackground: " + initialBackgroundTone + ";\n\tbox-shadow: ";
  stylePostamble = "\n}";
  styleDeclaration = '';

  for (iter = 0, len = renderedUnits.length; iter < len; iter++) {
    graphicElement = renderedUnits[iter];
    hexColorValue = colorToHexadecimal(graphicElement.color);

    // Exclude the origin pixel if it's already handled by 'background'
    if (!(graphicElement.x === 0 && graphicElement.y === 0)) {
      styleDeclaration = styleDeclaration.concat("" + graphicElement.x + "px " + graphicElement.y + "px " + hexColorValue + ",");
    }
  }

  // Remove trailing comma and append semicolon
  styleDeclaration = styleDeclaration.replace(/,$/, '').concat(';');
  generatedOutput = stylePreamble.concat(styleDeclaration).concat(stylePostamble);

  return $('#cssOutput').html(generatedOutput);
};

// Records an action for undo functionality
recordOperation = function(x_coord, y_coord, old_shade, new_shade) {
  actionHistory.push({
    x: x_coord,
    y: y_coord,
    old_color: old_shade,
    new_color: new_shade
  });

  // Maintain the history capacity
  if (actionHistory.length > historyCapacity) return actionHistory.splice(0, 1);
};

// Retrieves the color of a unit at specified coordinates
fetchUnitColor = function(x_coord, y_coord) {
  var unitDataArray;
  unitDataArray = _renderContext.getImageData(x_coord, y_coord, 1, 1).data;

  if (unitDataArray[3] === 0) return 'clear'; // Alpha channel is 0, so it's transparent/clear

  return "rgba(" + unitDataArray[0] + ", " + unitDataArray[1] + ", " + unitDataArray[2] + ", " + unitDataArray[3] + ")";
};

// Extracts RGB components from a color string (hex, rgb, or rgba)
extractRgbValues = function(color_string) {
  var matchResult;
  if (!color_string) return;

  color_string = color_string.replace(/\s*/g, ''); // Remove all whitespace

  if (color_string.startsWith('#')) {
    // Parse hex color
    let hex = color_string.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  } else if (color_string.startsWith('rgb')) {
    // Parse rgb/rgba color
    matchResult = color_string.match(/rgba?\((\d+),(\d+),(\d+),?\d*\)/);
    return matchResult != null ? matchResult.slice(1).map(function(val) {
      return parseInt(val);
    }) : undefined;
  }
  return undefined; // For other invalid formats
};

// Converts an RGB array (or color string that can be parsed to RGB) to a hexadecimal color string
colorToHexadecimal = function(rgb_input) {
  var colorComponents = extractRgbValues(rgb_input); // Ensure we get RGB array

  if (!colorComponents) {
    // If extractRgbValues failed, check if rgb_input itself is a valid hex string
    if (typeof rgb_input === 'string' && rgb_input.startsWith('#') && (rgb_input.length === 4 || rgb_input.length === 7)) {
      return rgb_input; // Assume it's already a valid hex string
    }
    return '#000000'; // Default to black if unable to parse
  }

  // Packs R, G, B into a 24-bit integer and converts to 6-digit hex
  return '#' + (colorComponents[2] | (colorComponents[1] << 8) | (colorComponents[0] << 16) | (1 << 24)).toString(16).slice(1);
};