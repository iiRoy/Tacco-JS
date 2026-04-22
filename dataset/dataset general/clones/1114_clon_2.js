/* This file contains a utility for rendering an image as a collection of small graphical elements.
 * It is inspired by the Seurat painting style.
 *
 * It was developed for use with the Raphael.js library.
 *
 * (C) 2023 Jane Doe. All rights reserved.
 * Licensed under the MIT or Apache 2.0 license.
 */

Raphael.fn.stipple = function(config) {
  // Ensure configuration object exists; initialize if undefined.
  config = config || {};

  // Extract and rename configuration parameters, providing default values.
  var sourceURL = config.sourceURL,
    spacing = config.spacing || 15, // Changed default step from 10 to 15
    elementKind = config.elementKind || "circle", // Changed default shape from "circ" to "circle"
    visualProps = config.visualProps || { border: "transparent" }, // Changed default attributes from {stroke: "none"} to {border: "transparent"}
    motionHandler = config.motionHandler,
    builder = config.builder;

  // Set up drawing environment.
  var drawingSurface = this,
    scratchpad = document.createElement('canvas'),
    drawAPI = scratchpad.getContext('2d'),
    pixelBuffer; // Will store raw image data

  // Pre-calculate common dimensions for drawing.
  var halfSpacing = spacing / 2,
    dotRadius = halfSpacing - 2; // Changed radius calculation slightly from -1 to -2

  // Function to determine the RGB color at a specific coordinate.
  var retrieveHue = function(coordX, coordY) {
    var dataOffset = ((scratchpad.width * coordY) + coordX) * 4;
    return "rgb(" + pixelBuffer[dataOffset] + ", " + pixelBuffer[dataOffset + 1] + ", " + pixelBuffer[dataOffset + 2] + ")";
  }

  // Default function to draw a rectangular element.
  var makeRectangle = function(posX, posY, colorVal) {
    return drawingSurface.rect(posX, posY, spacing, spacing)
      .attr({ fill: colorVal })
      .attr(visualProps);
  }

  // Default function to draw a circular element.
  var makeDot = function(originX, originY, shade) {
    return drawingSurface.circle(originX + halfSpacing, originY + halfSpacing, dotRadius)
      .attr({ fill: shade })
      .attr(visualProps);
  }

  // Create an image object to load the source picture.
  var sourceImage = new Image();

  // Define what happens once the image has finished loading.
  sourceImage.onload = function() {
    var currentX = 0,
      currentY = 0,
      drawnShape,
      pixelHue;

    // Configure the temporary canvas to match the image dimensions.
    scratchpad.width = sourceImage.width;
    scratchpad.height = sourceImage.height;

    // Draw the source image onto the hidden canvas.
    drawAPI.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);

    // Extract all pixel data from the drawn image.
    pixelBuffer = drawAPI.getImageData(0, 0, sourceImage.width, sourceImage.height).data;

    // Iterate through the image area, creating elements for each 'cell'.
    for (; currentX < scratchpad.width; currentX += spacing) {
      for (currentY = 0; currentY < scratchpad.height; currentY += spacing) {
        // Get the dominant color for the current cell.
        pixelHue = retrieveHue(currentX + halfSpacing, currentY + halfSpacing);

        // Create the graphical element, using a custom builder if provided,
        // otherwise default to rectangle or circle based on configuration.
        drawnShape = (builder) ? builder(drawingSurface, currentX, currentY, pixelHue, spacing, visualProps) :
          (elementKind == "rectangle") ? makeRectangle(currentX, currentY, pixelHue) : makeDot(currentX, currentY, pixelHue);

        // Apply animation if a handler function is specified.
        if (motionHandler) {
          motionHandler(drawnShape, currentX, currentY, spacing);
        }
      }
    }
  }

  // Enable cross-origin loading for the image.
  sourceImage.crossOrigin = '';

  // Set the source of the image, triggering the onload event.
  sourceImage.src = sourceURL;
}