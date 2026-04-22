/*******************************************************************************
 * picssel.js
 *
 * Version: 1.0.1
 * Author:  Kushagra Gour (chinchang457@gmail.com)
 * License: The MIT License (MIT)
 *
 * This file contains the core logic for the pixel art editor.
 * It handles canvas manipulation, user input, and code generation.
 ******************************************************************************/

// Global variable declarations for the application components and state.
// These variables are used across various functions.
var $canvas,
    $color_input,
    RGBToHash,
    addState,
    canvasResize,
    canvas_size,
    canvas_size_range,
    clearCanvas,
    ctx,
    current_path,
    drawPixel,
    generateCode,
    getPixelColor,
    getRGB,
    is_mouse_down,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    origin_color,
    pixel_size,
    pixels,
    states,
    undo,
    undo_size;

// Initialize core DOM elements and drawing context.
$canvas        = null;
ctx            = null;
$color_input   = null;

// Configuration for pixel size and canvas dimensions.
pixel_size     = 6;
pixels         = []; // Array to store pixel data (x, y, color).
states         = []; // Array to store undo states.
undo_size      = 15; // Maximum number of undo steps.

canvas_size    = pixel_size * 20; // Default canvas size.

// Define the allowable range for canvas dimensions.
canvas_size_range = {
  min: 50,
  max: 200
};

// Default color for the origin pixel (0,0) if not explicitly set.
origin_color   = 'transparent';

// Mouse state flag.
is_mouse_down  = false;

// Path for continuous drawing (not fully implemented in original).
current_path   = [];

// jQuery document ready function.
// This block runs once the DOM is fully loaded.
$( function () {

  // Assign jQuery objects to global variables.
  $canvas      = $('#c');
  $color_input = $('input.color');

  // Get the 2D rendering context for the canvas element.
  ctx          = $('#c').get(0).getContext('2d');

  // Attach data attributes to size adjustment buttons.
  $.data($('#sizedown-button')[0], 'amount', -1);
  $.data($('#sizeup-button')[0], 'amount', 1);

  // Initialize ZeroClipboard for copying generated HTML code.
  $('a#copy-html').zclip({
    path: 'js/ZeroClipboard.swf',
    copy: function () {

      return $('#html-code').text();
    }
  });

  // Initialize ZeroClipboard for copying generated CSS code.
  $('a#copy-css').zclip({
    path: 'js/ZeroClipboard.swf',
    copy: function () {

      return $('#css-code').text();
    }
  });

  // Bind mouse event handlers to the canvas.
  $canvas.bind('mousedown', onMouseDown);
  // $canvas.bind('mousemove', onMouseMove); // Mouse move for drawing, uncomment if needed.
  // $canvas.bind('mouseup', onMouseUp);     // Mouse up event.

  // Bind click event handlers to control buttons.
  $('#generate-button').bind('click', generateCode);
  $('#undo-button').bind('click', undo);
  $('#clear-button').bind('click', clearCanvas);

  // Bind canvas resize functionality to both size buttons.
  return $('#sizedown-button, #sizeup-button').bind('click', canvasResize);

}); // End of jQuery document ready.


// Function to adjust the canvas size.
// @param {Event} e - The event object from the click.
canvasResize = function (e) {
  var size; // Declare a local variable for the new canvas size.

  // Calculate the new size based on current size and button's 'amount' data.
  size = canvas_size + $.data(e.currentTarget, 'amount') * pixel_size;

  // Prevent resizing beyond the defined min/max range.
  if (size < canvas_size_range.min || size > canvas_size_range.max) {
    return; // Exit if new size is out of bounds.
  }

  // Update the global canvas_size variable.
  canvas_size = size;

  // Set the new width and height attributes for the canvas element.
  $canvas.attr('width', canvas_size);
  $canvas.attr('height', canvas_size);

  // Clear the canvas and redraw everything (or simply clear if no pixels).
  return clearCanvas();
};


// Function to perform an undo operation.
undo = function () {

  var clear, last_point, last_state, p, pos, _len;

  // Retrieve the last state from the undo stack.
  last_state = states.pop();

  // If there's no state to undo, simply return.
  if (!last_state) {
    return;
  }

  clear = false; // Flag to indicate if the pixel should be cleared.

  // Check if the last action was 'clear'.
  if (last_state.new_color === 'clear') {
    // If a pixel was cleared, restore it by pushing its old state back.
    pixels.push({
      x: last_state.x,
      y: last_state.y,
      color: last_state.old_color
    });
  } else {
    // If a pixel was drawn or recolored, find and remove its current state.
    for (pos = 0, _len = pixels.length; pos < _len; pos++) {
      p = pixels[pos];
      if (p.x === last_state.x && p.y === last_state.y) {
        last_point = pixels.splice(pos, 1)[0]; // Remove the pixel from the array.
        break;
      }
    }

    // Determine if the pixel should be cleared or restored with its old color.
    if (last_state.old_color === 'clear') {
      clear = true; // Mark for clearing if the old color was 'clear'.
    } else {
      last_point.color = last_state.old_color; // Restore the old color.
      pixels.push(last_point); // Add the pixel back with its old color.
    }
  }

  // Finally, redraw the affected pixel on the canvas.
  return drawPixel(last_state.x, last_state.y, last_state.old_color, clear);
};


// Function to clear the entire canvas.
clearCanvas = function () {

  // Clear the drawing context area.
  ctx.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('width'));

  // Reset the pixels array and undo states.
  pixels = [];
  states = [];

  // Also clear the generated CSS code display.
  return $('#css-code').html('');
};


// Event handler for mouse down events on the canvas.
// This is where pixels are drawn, picked, or erased.
onMouseDown = function (e) {

  var color, cx, cy, p, pixel_current_color, pos, rgb, _len, _len2;

  // Calculate canvas coordinates (cx, cy) from client coordinates (e.clientX, e.clientY).
  cx = e.clientX - $canvas.offset().left + document.body.scrollLeft;
  cy = e.clientY - $canvas.offset().top + document.body.scrollTop;

  // Snap coordinates to the nearest pixel_size grid.
  cx = ~~(cx / pixel_size) * pixel_size;
  cy = ~~(cy / pixel_size) * pixel_size;

  // Get the currently selected color from the color input.
  color = $("input.color").css('background-color');

  // Get the current color of the pixel at (cx, cy).
  pixel_current_color = getPixelColor(cx, cy);

  /*
  	Conditional logic based on modifier keys:
  	- If SHIFT key is pressed, pick the pixel's color.
  	- If CTRL or META key is pressed, clear the pixel.
  	- Otherwise, just draw the pixel with the selected color.
  */
  if (e.shiftKey) {

    // If SHIFT is pressed, pick the color from the canvas pixel.
    rgb = getRGB(pixel_current_color);

    if (rgb) {
      // Update the color picker with the sampled color.
      $color_input.get(0).color.fromRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
    }
  } else if (e.ctrlKey || e.metaKey) {

    // If CTRL or META (Command on Mac) is pressed, erase the pixel.
    if (pixel_current_color === 'clear') {
      return; // If already clear, do nothing.
    }

    drawPixel(cx, cy, null, true); // Draw a 'clear' pixel.
    addState(cx, cy, pixel_current_color, 'clear'); // Add to undo stack.

    // Remove the cleared pixel from the 'pixels' array.
    for (pos = 0, _len = pixels.length; pos < _len; pos++) {
      p = pixels[pos];
      if (p.x === cx && p.y === cy) {
        pixels.splice(pos, 1);
        break;
      }
    }
  } else {

    // Default action: draw a pixel with the current color.
    drawPixel(cx, cy, color); // Draw the pixel on canvas.
    addState(cx, cy, pixel_current_color, color); // Add to undo stack.

    // If the pixel already exists, remove its old entry before adding the new one.
    for (pos = 0, _len2 = pixels.length; pos < _len2; pos++) {
      p = pixels[pos];
      if (p.x === cx && p.y === cy) {
        pixels.splice(pos, 1);
        break;
      }
    }

    // Add the newly drawn pixel to the 'pixels' array.
    return pixels.push({
      x: cx,
      y: cy,
      color: color
    });
  }

}; // End of onMouseDown function.


// Event handler for mouse move events on the canvas.
// This function is currently not used for active drawing, but could be.
onMouseMove = function (e) {
  var color, cx, cy, pixel_current_color;

  // Calculate canvas coordinates.
  cx = e.clientX - $canvas.offset().left + document.body.scrollLeft;
  cy = e.clientY - $canvas.offset().top + document.body.scrollTop;

  // Snap to grid.
  cx = ~~(cx / pixel_size) * pixel_size;
  cy = ~~(cy / pixel_size) * pixel_size;

  // Get current color.
  color = $("input.color").css('background-color');

  // Get pixel color at current position.
  return pixel_current_color = getPixelColor(cx, cy);
};


// Event handler for mouse up events.
onMouseUp = function (e) {
  // Reset mouse down flag.
  return is_mouse_down = false;
};


/**
 * Function: drawPixel
 * Draws a single pixel on the canvas or clears it.
 *
 * @param {number} x      - X-coordinate to draw at (grid-aligned).
 * @param {number} y      - Y-coordinate to draw at (grid-aligned).
 * @param {string} color  - The color to fill the pixel with (e.g., '#RRGGBB' or 'rgb(r,g,b)').
 * @param {boolean} clear - If true, the pixel area will be cleared instead of filled.
 * @returns {string} The origin_color if (0,0) pixel is affected.
 */
drawPixel = function (x, y, color, clear) {

  // Default color to black if not provided.
  if (color == null) {
    color = '#000';
  }

  // Default clear flag to false if not provided.
  if (clear == null) {
    clear = false;
  }

  if (clear) {
    // Clear the specified pixel area.
    ctx.clearRect(x, y, pixel_size, pixel_size);

    // If the origin pixel (0,0) is cleared, update origin_color.
    if (x === 0 && y === 0) {
      return origin_color = 'transparent';
    }
  } else {
    // Set the fill style and draw a rectangle.
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixel_size, pixel_size);

    // If the origin pixel (0,0) is drawn, update origin_color.
    if (x === 0 && y === 0) {
      return origin_color = color;
    }
  }
};


// Function to generate CSS code based on the drawn pixels.
generateCode = function () {

  var code, code_art, code_prefix, code_suffix, color_hash, p, _i, _len;

  // CSS prefix for the art container and default pixel style.
  code_prefix = "#art {\n\twidth: " + canvas_size + "px;\n\theight: " + canvas_size + "px;\n}\n\n#art div{\n\twidth: " + pixel_size + "px;\n\theight: " + pixel_size + "px;\n\tbackground: " + origin_color + ";\n\tbox-shadow: ";

  // CSS suffix for closing the box-shadow and #art div rule.
  code_suffix = "\n}";

  code_art = ''; // Initialize string for box-shadow values.

  // Iterate through all stored pixels to generate box-shadow entries.
  for (_i = 0, _len = pixels.length; _i < _len; _i++) {
    p = pixels[_i];

    // Convert pixel color to hex format.
    color_hash = RGBToHash(p.color);

    // Exclude the origin pixel (0,0) from box-shadow if it has the origin_color.
    // The origin_color is handled by the 'background' property.
    if (!(p.x === 0 && p.y === 0)) {
      code_art = code_art.concat("" + p.x + "px " + p.y + "px " + color_hash + ",");
    }
  }

  // Remove the trailing comma from the box-shadow string and add a semicolon.
  code_art = code_art.replace(/,$/, '').concat(';');

  // Combine all parts to form the complete CSS code.
  code = code_prefix.concat(code_art).concat(code_suffix);

  // Display the generated CSS code in the designated HTML element.
  return $('#css-code').html(code);
};


// Function to add a state to the undo history.
// @param {number} x         - X-coordinate of the pixel.
// @param {number} y         - Y-coordinate of the pixel.
// @param {string} old_color - The color of the pixel before the change.
// @param {string} new_color - The color of the pixel after the change.
addState = function (x, y, old_color, new_color) {

  // Push the new state onto the 'states' array.
  states.push({
    x: x,
    y: y,
    old_color: old_color,
    new_color: new_color
  });

  // If the undo history exceeds the defined size, remove the oldest state.
  if (states.length > undo_size) {
    return states.splice(0, 1);
  }
};


// Function to get the color of a pixel at specified coordinates from the canvas.
// @param {number} x - X-coordinate.
// @param {number} y - Y-coordinate.
// @returns {string} - 'clear' if transparent, otherwise rgba() string.
getPixelColor = function (x, y) {
  var pixel_array;

  // Get the pixel data (RGBA values) from the canvas context.
  pixel_array = ctx.getImageData(x, y, 1, 1).data;

  // If the alpha channel (pixel_array[3]) is 0, the pixel is transparent/clear.
  if (pixel_array[3] === 0) {
    return 'clear';
  }

  // Return the color as an rgba string.
  return "rgba(" + pixel_array[0] + ", " + pixel_array[1] + ", " + pixel_array[2] + ", " + pixel_array[3] + ")";
};


// Function to parse an RGB/RGBA color string into an array of [R, G, B] integers.
// @param {string} color - The color string (e.g., 'rgb(255,0,0)' or 'rgba(0,0,0,0.5)').
// @returns {Array<number>} - An array containing [R, G, B] values, or undefined if parsing fails.
getRGB = function (color) {
  var _ref;

  // Return early if no color is provided.
  if (!color) {
    return;
  }

  // Remove all whitespace from the color string.
  color = color.replace(/\s*/g, '');

  // Check if the color string does NOT contain a '#' (i.e., it's not a hex color).
  // NOTE: Original code has a potential bug here: `indexOf('#' === -1)` should be `indexOf('#') === -1`.
  //       However, per Type I definition, expressions must remain unchanged.
  if (color.indexOf('#' === -1)) {
    // Use a regular expression to extract RGB values from rgba?() format.
    return (_ref = color.match(/rgba?\((\d*),(\d*),(\d*),?\d*\)/)) != null ? _ref.slice(1).map(function (o) {
      return parseInt(o);
    }) : void 0;
  }
};


// Function to convert an RGB/RGBA color string to a hexadecimal color string.
// @param {string} rgb - The color string (e.g., 'rgb(255,0,0)').
// @returns {string} - The hexadecimal color string (e.g., '#FF0000').
RGBToHash = function (rgb) {

  // First, get the [R, G, B] array from the input string.
  rgb = getRGB(rgb);

  // Perform bitwise operations to combine RGB into a single integer,
  // then convert to hex and slice to get the correct 6-digit hex code.
  // The (1 << 24) is used to ensure the number is large enough for slice(1) to work correctly
  // by prepending a '1' which is then removed.
  return '#' + (rgb[2] | (rgb[1] << 8) | (rgb[0] << 16) | (1 << 24)).toString(16).slice(1);
};