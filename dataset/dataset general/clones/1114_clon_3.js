// A sophisticated utility for rendering images with a stylized, pointillist effect using Raphael.js.
// This implementation adapts the core logic of Seurat.js, incorporating modern JavaScript
// patterns, enhanced configuration, and robust error handling.
//
// Original project: http://seuratjs.com/
// Tested with Raphael JavaScript Library v2.1: http://raphaeljs.com/
//
// Copyright 2012, 2013 Greg Smith
// http://gregoryryansmith.com/
// License: Dual licensed under the MIT or GPL Version 2 licenses.
//
// This version introduces Type III code clone modifications including extensive identifier renaming,
// structural refactoring, guard clauses, new configuration options, and additional helper functions.

Raphael.fn.applyPointillistEffect = function(userConfiguration) {
  // --- Input Validation and Configuration Setup ---

  // Ensure the method is invoked on a valid Raphael paper instance.
  if (!(this instanceof Raphael.fn.init)) {
    console.error("Error: The 'applyPointillistEffect' method must be called on an active Raphael paper object.");
    return; // Exit if not a valid Raphael instance.
  }

  // Define a comprehensive set of default parameters for the rendering process.
  const standardRenderSettings = {
    sourceImageURL: null, // Mandatory: URL of the image to process.
    gridCellDimension: 10, // Size of each square grid cell (e.g., 10x10 pixels).
    outputShapeType: "circle", // "circle" or "rectangle" for the rendered elements.
    baseShapeAttributes: {
      stroke: "none"
    }, // Default Raphael attributes for all generated shapes.
    customAnimationFunction: null, // Optional: A function to animate each rendered shape.
    customElementFactory: null, // Optional: A function to completely override shape creation.
    enableCrossOriginLoading: true // Whether to set img.crossOrigin for external images.
  };

  // Merge the user-provided options with the standard defaults.
  const activeConfiguration = { ...standardRenderSettings,
    ...userConfiguration
  };

  // Perform essential checks on the active configuration parameters.
  if (!activeConfiguration.sourceImageURL) {
    console.error("Configuration Error: 'sourceImageURL' is a mandatory parameter for rendering the effect.");
    return;
  }
  if (typeof activeConfiguration.gridCellDimension !== 'number' || activeConfiguration.gridCellDimension <= 0) {
    console.warn(`Configuration Warning: Invalid 'gridCellDimension' value (${activeConfiguration.gridCellDimension}). Defaulting to ${standardRenderSettings.gridCellDimension}.`);
    activeConfiguration.gridCellDimension = standardRenderSettings.gridCellDimension;
  }
  if (!["circle", "rectangle"].includes(activeConfiguration.outputShapeType)) {
    console.warn(`Configuration Warning: Unsupported 'outputShapeType' specified ("${activeConfiguration.outputShapeType}"). Defaulting to "${standardRenderSettings.outputShapeType}".`);
    activeConfiguration.outputShapeType = standardRenderSettings.outputShapeType;
  }

  // --- Core Variables and Canvas Setup ---

  // Reference to the Raphael drawing surface.
  const raphaelDrawingSurface = this;
  const currentGridSize = activeConfiguration.gridCellDimension;
  const halfGridSize = currentGridSize / 2;
  const effectiveShapeRadius = halfGridSize - 1; // Ensure a small gap between shapes for clarity.

  // Create an off-screen canvas to load and extract pixel data from the image.
  const temporaryCanvasElement = document.createElement('canvas');
  // Request a 2D rendering context, hinting that pixel data will be read frequently.
  const canvas2DContext = temporaryCanvasElement.getContext('2d', {
    willReadFrequently: true
  });
  let imageDataBuffer; // This will hold the raw RGBA pixel array.

  // --- Helper Functions ---

  /**
   * Retrieves the RGB color string for a specific pixel coordinate from the image data buffer.
   * Includes boundary checks for robustness.
   * @param {number} xPixel The X-coordinate of the pixel.
   * @param {number} yPixel The Y-coordinate of the pixel.
   * @returns {string} An RGB color string (e.g., "rgb(255,0,128)"). Returns "rgb(0,0,0)" if out of bounds.
   */
  const fetchPixelColorString = (xPixel, yPixel) => {
    // Validate coordinates against the temporary canvas dimensions.
    if (!imageDataBuffer || xPixel < 0 || yPixel < 0 || xPixel >= temporaryCanvasElement.width || yPixel >= temporaryCanvasElement.height) {
      return "rgb(0,0,0)"; // Return black for coordinates outside image bounds.
    }

    // Calculate the starting index for the RGBA values of the pixel.
    const pixelStartIndex = ((temporaryCanvasElement.width * yPixel) + xPixel) * 4;

    // Ensure the calculated index is within the bounds of the pixel data array.
    if (pixelStartIndex + 2 >= imageDataBuffer.length || pixelStartIndex < 0) {
      return "rgb(0,0,0)"; // Return black if the index is invalid.
    }

    // Construct and return the RGB color string.
    return `rgb(${imageDataBuffer[pixelStartIndex]}, ${imageDataBuffer[pixelStartIndex + 1]}, ${imageDataBuffer[pixelStartIndex + 2]})`;
  };

  /**
   * Applies the fill color and base attributes to a given Raphael element.
   * @param {RaphaelElement} targetElement The Raphael element to modify.
   * @param {string} desiredFillColor The fill color string (e.g., "rgb(100,50,200)").
   * @returns {RaphaelElement} The modified Raphael element.
   */
  const applyCommonShapeStyling = (targetElement, desiredFillColor) => {
    return targetElement.attr({
      fill: desiredFillColor
    }).attr(activeConfiguration.baseShapeAttributes);
  };

  /**
   * Creates a default Raphael shape (circle or rectangle) based on configuration.
   * @param {number} xGridPos The X-coordinate of the top-left corner of the grid cell.
   * @param {number} yGridPos The Y-coordinate of the top-left corner of the grid cell.
   * @param {string} shapeColor The color to fill the shape with.
   * @returns {RaphaelElement} A new Raphael circle or rectangle element.
   */
  const generateStandardVisualElement = (xGridPos, yGridPos, shapeColor) => {
    let createdElement;
    if (activeConfiguration.outputShapeType === "rectangle") {
      createdElement = raphaelDrawingSurface.rect(xGridPos, yGridPos, currentGridSize, currentGridSize);
    } else { // Default to "circle"
      createdElement = raphaelDrawingSurface.circle(xGridPos + halfGridSize, yGridPos + halfGridSize, effectiveShapeRadius);
    }
    return applyCommonShapeStyling(createdElement, shapeColor);
  };

  // --- Image Loading and Processing Logic ---

  const sourceImageLoader = new Image();

  // Set crossOrigin property if enabled, necessary for security when reading pixel data from external images.
  if (activeConfiguration.enableCrossOrigin) {
    sourceImageLoader.crossOrigin = 'Anonymous';
  }

  // Define the callback function to execute once the image has successfully loaded.
  sourceImageLoader.onload = () => {
    // Set the dimensions of the temporary canvas to match the loaded image.
    temporaryCanvasElement.width = sourceImageLoader.width;
    temporaryCanvasElement.height = sourceImageLoader.height;

    // Draw the entire image onto the temporary canvas.
    canvas2DContext.drawImage(sourceImageLoader, 0, 0, sourceImageLoader.width, sourceImageLoader.height);

    // Extract all pixel data (RGBA values) from the canvas into the buffer.
    imageDataBuffer = canvas2DContext.getImageData(0, 0, sourceImageLoader.width, sourceImageLoader.height).data;

    // Iterate through the image, processing it in steps defined by currentGridSize.
    for (let currentXPosition = 0; currentXPosition < temporaryCanvasElement.width; currentXPosition += currentGridSize) {
      for (let currentYPosition = 0; currentYPosition < temporaryCanvasElement.height; currentYPosition += currentGridSize) {

        // Determine the precise pixel coordinates for color sampling (center of the grid cell).
        const sampleX = currentXPosition + Math.floor(halfGridSize);
        const sampleY = currentYPosition + Math.floor(halfGridSize);
        const cellColor = fetchPixelColorString(sampleX, sampleY);

        let outputRaphaelShape;
        // Use a custom element factory if provided, offering maximum flexibility.
        if (activeConfiguration.customElementFactory && typeof activeConfiguration.customElementFactory === 'function') {
          outputRaphaelShape = activeConfiguration.customElementFactory(
            raphaelDrawingSurface,
            currentXPosition,
            currentYPosition,
            cellColor,
            currentGridSize,
            activeConfiguration.baseShapeAttributes
          );
        } else {
          // Otherwise, fall back to generating a standard circle or rectangle.
          outputRaphaelShape = generateStandardVisualElement(currentXPosition, currentYPosition, cellColor);
        }

        // If a custom animation function is provided, apply it to the newly created shape.
        if (activeConfiguration.customAnimationFunction && typeof activeConfiguration.customAnimationFunction === 'function') {
          activeConfiguration.customAnimationFunction(outputRaphaelShape, currentXPosition, currentYPosition, currentGridSize);
        }
      }
    }
    // Optimization: Clear the temporary canvas context to release resources after processing.
    // This is optional but good practice for long-running applications.
    canvas2DContext.clearRect(0, 0, temporaryCanvasElement.width, temporaryCanvasElement.height);
  };

  // Define the callback function for when the image loading fails.
  sourceImageLoader.onerror = (errorEvent) => {
    console.error(`Image Loading Error: Failed to load image from URL: "${activeConfiguration.sourceImageURL}".`, errorEvent);
    // Further error handling could include drawing a placeholder, displaying an error message, etc.
  };

  // Initiate the image loading process by setting its source.
  sourceImageLoader.src = activeConfiguration.sourceImageURL;
};