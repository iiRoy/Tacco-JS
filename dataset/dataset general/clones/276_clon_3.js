/**
 * Represents a visual layer capable of image manipulation on a HTML canvas.
 * @class
 * @param {HTMLCanvasElement|string} targetElement - The canvas element itself or its ID.
 * @throws {Error} If the provided target element is not a valid canvas or cannot be found.
 */
let VisualLayer = function( targetElement ) {
  /**
   * The underlying HTML canvas element this layer operates on.
   * @private
   * @type {HTMLCanvasElement}
   */
  let targetCanvas;

  if (typeof targetElement === 'string') {
    targetCanvas = document.getElementById(targetElement);
    if (!targetCanvas || !(targetCanvas instanceof HTMLCanvasElement)) {
      throw new Error(`VisualLayer: Canvas element with ID '${targetElement}' not found or is not a canvas.`);
    }
  } else if (targetElement instanceof HTMLCanvasElement) {
    targetCanvas = targetElement;
  } else {
    throw new Error('VisualLayer: Invalid target element provided. Must be a Canvas element or its ID.');
  }

  this._renderSurface = targetCanvas;
  /**
   * The 2D rendering context for the canvas.
   * @private
   * @type {CanvasRenderingContext2D}
   */
  this._drawingContext = this._renderSurface.getContext("2d");

  // Initialize canvas dimensions to avoid issues on first draw
  this.adjustDimensions();
};

Object.assign( VisualLayer.prototype, {

  /**
   * Resizes the internal canvas element to match its parent container's dimensions.
   * This ensures the canvas always fills its designated space.
   * @method
   * @returns {void}
   */
  adjustDimensions: function() {
    const activeCanvas = this._renderSurface;
    const containingElement = activeCanvas.parentElement;

    // Guard: Ensure there's a parent element to get dimensions from
    if (!containingElement) {
      console.warn("VisualLayer: Canvas has no parent element, cannot adjust dimensions.");
      return;
    }

    // Update canvas width and height to match the parent's client dimensions
    // Using Math.floor for pixel perfect rendering
    activeCanvas.width = Math.floor(containingElement.clientWidth);
    activeCanvas.height = Math.floor(containingElement.clientHeight);

    // Optional: Clear the canvas after resizing to prevent rendering artifacts
    this._drawingContext.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
  },

  /**
   * Converts the current canvas content to grayscale.
   * This operation directly modifies the pixel data on the canvas.
   * @method
   * @private
   * @returns {void}
   */
  _applyGrayscaleFilter: function() {
    const currentContext = this._drawingContext;
    const drawingCanvas = this._renderSurface;

    // Guard: Check if context is available
    if (!currentContext) {
      console.error("VisualLayer: 2D context not available for grayscale conversion.");
      return;
    }

    // Get all pixel data from the canvas
    const imageDataBuffer = currentContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    const pixelData = imageDataBuffer.data;
    const totalPixels = pixelData.length;

    // Iterate through each pixel (RGBA, 4 bytes per pixel)
    for (let index = 0; index < totalPixels; index += 4) {
      const redComponent = pixelData[index];
      const greenComponent = pixelData[index + 1];
      const blueComponent = pixelData[index + 2];

      // Calculate perceived brightness using a slightly different weighted average
      // Using Math.round to ensure integer pixel values
      const luminance = Math.round(0.299 * redComponent + 0.587 * greenComponent + 0.114 * blueComponent);

      // Apply the calculated brightness to all color channels
      pixelData[index] = luminance;
      pixelData[index + 1] = luminance;
      pixelData[index + 2] = luminance;
      // Alpha channel (pixelData[index + 3]) remains unchanged
    }

    // Put the modified pixel data back onto the canvas
    currentContext.putImageData(imageDataBuffer, 0, 0);
  },

  /**
   * Draws a specific block (sub-section) of an image onto the canvas.
   * This method handles scaling and positioning to ensure the block is drawn correctly.
   * @method
   * @param {HTMLImageElement} sourceImage - The image object to draw from.
   * @param {number} sourceX - The X coordinate in the source image to start drawing from.
   * @param {number} sourceY - The Y coordinate in the source image to start drawing from.
   * @param {number} sourceWidth - The width of the rectangle in the source image to draw.
   * @param {number} sourceHeight - The height of the rectangle in the source image to draw.
   * @param {number} destinationX - The X coordinate on the canvas to place the image block.
   * @param {number} destinationY - The Y coordinate on the canvas to place the image block.
   * @param {number} destinationWidth - The width to draw the image block on the canvas.
   * @param {number} destinationHeight - The height to draw the image block on the canvas.
   * @returns {void}
   */
  _renderImageBlock: function( sourceImage, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight ) {
    const currentContext = this._drawingContext;

    // Guard: Ensure image and context are valid
    if (!sourceImage || !(sourceImage instanceof HTMLImageElement) || !currentContext) {
      console.warn("VisualLayer: Cannot render image block. Invalid source image or context.");
      return;
    }

    // All parameters are expected to be numbers, ensuring they are integers for drawing accuracy
    const sx = Math.round(sourceX);
    const sy = Math.round(sourceY);
    const sW = Math.round(sourceWidth);
    const sH = Math.round(sourceHeight);
    const dx = Math.round(destinationX);
    const dy = Math.round(destinationY);
    const dW = Math.round(destinationWidth);
    const dH = Math.round(destinationHeight);

    // Perform the actual drawing operation
    currentContext.drawImage( sourceImage, sx, sy, sW, sH, dx, dy, dW, dH );
  },

  /**
   * Main rendering function to display an image and highlight a selected region.
   * The background image is displayed in grayscale, while the selected region is in full color.
   * @method
   * @param {HTMLImageElement} inputImage - The image object to be displayed.
   * @param {object} regionSelection - Object defining the selected area: { left, top, width, height }.
   * @param {object} originalImageDimensions - Object defining the original image's dimensions: { width, height }.
   * @returns {void}
   */
  displayContent: function( inputImage, regionSelection, originalImageDimensions ) {
    const currentContext = this._drawingContext;
    const canvasElement = this._renderSurface;

    // Guard: Validate essential parameters
    if (!inputImage || !(inputImage instanceof HTMLImageElement) || !regionSelection || !originalImageDimensions) {
      console.error("VisualLayer: Missing or invalid parameters for displayContent.");
      return;
    }
    if (!currentContext) {
        console.error("VisualLayer: Canvas context not available.");
        return;
    }

    // Clear the entire canvas before drawing
    currentContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the full image initially to cover the entire canvas
    currentContext.drawImage( inputImage, 0, 0, canvasElement.width, canvasElement.height );

    // Apply the grayscale filter to the entire canvas
    this._applyGrayscaleFilter();

    // Calculate scaling factors for the selected region based on original image size and canvas size
    const horizontalScaleFactor = originalImageDimensions.width / canvasElement.width;
    const verticalScaleFactor = originalImageDimensions.height / canvasElement.height;

    // Determine the source region within the original image that corresponds to the selected canvas area
    const sourceRegionLeft = regionSelection.left * horizontalScaleFactor;
    const sourceRegionTop = regionSelection.top * verticalScaleFactor;
    const sourceRegionWidth = regionSelection.width * horizontalScaleFactor;
    const sourceRegionHeight = regionSelection.height * verticalScaleFactor;

    // Draw the selected region from the original image, in full color, over the grayscale background
    this._renderImageBlock(
      inputImage,
      sourceRegionLeft,
      sourceRegionTop,
      sourceRegionWidth,
      sourceRegionHeight,
      regionSelection.left,
      regionSelection.top,
      regionSelection.width,
      regionSelection.height
    );
  },

  /**
   * First adjusts the canvas dimensions, then renders the image content.
   * This is a convenience method for a common sequence of operations.
   * @method
   * @param {HTMLImageElement} mainImage - The image object to be displayed.
   * @param {object} activeSelection - Object defining the selected area: { left, top, width, height }.
   * @param {object} initialImageDims - Object defining the original image's dimensions: { width, height }.
   * @returns {void}
   */
  updateAndDisplay: function( mainImage, activeSelection, initialImageDims ) {
    // Ensure all parameters are valid before proceeding
    if (!mainImage || !activeSelection || !initialImageDims) {
      console.warn("VisualLayer: Cannot update and display. Missing input parameters.");
      return;
    }
    this.adjustDimensions();
    this.displayContent( mainImage, activeSelection, initialImageDims );
  },

  /**
   * Exports the currently selected region of the canvas as a data URL.
   * This creates a temporary canvas to extract only the specified area.
   * @method
   * @param {string} mimeType - The MIME type of the image format (e.g., 'image/png', 'image/jpeg').
   * @param {object} currentSelection - Object defining the selected area: { left, top, width, height }.
   * @param {number} [quality=0.92] - For 'image/jpeg' or 'image/webp', a number between 0 and 1 indicating image quality.
   * @returns {string|null} A data URL representing the selected image, or null if an error occurs.
   */
  exportSelectionAsDataURL: function( mimeType, currentSelection, quality = 0.92 ) {
    // Guard: Validate selection and mimeType
    if (!currentSelection || currentSelection.width <= 0 || currentSelection.height <= 0) {
      console.warn("VisualLayer: Invalid selection for export. Width and height must be positive.");
      return null;
    }
    if (!mimeType || typeof mimeType !== 'string') {
      console.warn("VisualLayer: Invalid MIME type provided for export.");
      return null;
    }

    const sourceCanvas = this._renderSurface;
    const temporaryCanvas = document.createElement('canvas');
    const tempContext = temporaryCanvas.getContext('2d');

    // Set temporary canvas dimensions to match the selected region
    temporaryCanvas.width = currentSelection.width;
    temporaryCanvas.height = currentSelection.height;

    // Draw only the selected portion from the main canvas onto the temporary canvas
    tempContext.drawImage(
      sourceCanvas,
      Math.round(currentSelection.left),
      Math.round(currentSelection.top),
      Math.round(currentSelection.width),
      Math.round(currentSelection.height),
      0, 0,
      Math.round(currentSelection.width),
      Math.round(currentSelection.height)
    );

    // Return the data URL, applying quality for JPEG/WebP if specified
    if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
      return temporaryCanvas.toDataURL(mimeType, Math.max(0, Math.min(1, quality)));
    } else {
      return temporaryCanvas.toDataURL(mimeType);
    }
  }

});