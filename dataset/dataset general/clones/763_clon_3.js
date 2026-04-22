/**
 * Transforms an input HTMLImageElement to fit within specified maximum dimensions,
 * preserving its aspect ratio. If the image already fits, a new copy is returned.
 * Otherwise, it's scaled down using an off-screen canvas.
 *
 * @param {HTMLImageElement} sourcePictureElement The original image element to be scaled.
 * @param {number} boundaryWidth The maximum allowed width for the output image.
 * @param {number} boundaryHeight The maximum allowed height for the output image.
 * @returns {HTMLImageElement|null} A new HTMLImageElement containing the scaled image data,
 *                                  or null if input validation fails.
 */
function scaleImageForDisplay(sourcePictureElement, boundaryWidth, boundaryHeight) {
  // --- Validation of Input Parameters ---
  // Ensure the primary input is indeed an image object.
  if (!(sourcePictureElement instanceof HTMLImageElement)) {
    console.error("Parameter 'sourcePictureElement' must be a valid HTMLImageElement instance.");
    return null; // Indicate failure due to invalid input.
  }

  // Verify that the dimension limits are sensible positive numbers.
  if (typeof boundaryWidth !== 'number' || boundaryWidth <= 0 ||
      typeof boundaryHeight !== 'number' || boundaryHeight <= 0) {
    console.error("Boundary dimensions ('boundaryWidth', 'boundaryHeight') must be positive numeric values.");
    return null; // Indicate failure.
  }

  // Extract the original, intrinsic dimensions of the source image.
  // Using naturalWidth/Height is more reliable for images that might have CSS-applied dimensions.
  let originalImageWidth = sourcePictureElement.naturalWidth || sourcePictureElement.width;
  let originalImageHeight = sourcePictureElement.naturalHeight || sourcePictureElement.height;

  // --- Optimization: Early Exit if No Scaling is Required ---
  // If the image's current dimensions already fit within the specified boundaries,
  // there's no need for canvas processing. A direct clone is more efficient.
  if (originalImageWidth <= boundaryWidth && originalImageHeight <= boundaryHeight) {
    const directCopyImage = document.createElement('img');
    directCopyImage.src = sourcePictureElement.src;
    directCopyImage.width = originalImageWidth;
    directCopyImage.height = originalImageHeight;
    // Returning a new image element ensures consistent return type.
    return directCopyImage;
  }

  // --- Core Dimension Calculation Logic ---
  // These variables will hold the dimensions as they are progressively adjusted.
  let adjustedWidth = originalImageWidth;
  let adjustedHeight = originalImageHeight;

  // A helper variable to store the calculated scaling factor.
  let proportionalReductionFactor = 1.0;

  // First pass: Determine if scaling is needed based on the dominant dimension (width for landscape/square, height for portrait).
  if (adjustedWidth >= adjustedHeight) { // Image is wider than or as wide as it is tall (landscape or square).
    if (adjustedWidth > boundaryWidth) {
      proportionalReductionFactor = boundaryWidth / adjustedWidth; // Calculate factor to fit width.
      adjustedHeight *= proportionalReductionFactor;               // Apply factor to height.
      adjustedWidth = boundaryWidth;                               // Set width to its limit.
    }
  } else { // Image is taller than it is wide (portrait).
    if (adjustedHeight > boundaryHeight) {
      proportionalReductionFactor = boundaryHeight / adjustedHeight; // Calculate factor to fit height.
      adjustedWidth *= proportionalReductionFactor;                  // Apply factor to width.
      adjustedHeight = boundaryHeight;                               // Set height to its limit.
    }
  }

  // Second pass (additional robustness): After the first adjustment,
  // one dimension might still exceed its boundary if the aspect ratio was extreme.
  // This ensures both dimensions are checked against their limits.
  // This is an added fragment of logic for improved accuracy compared to the original, simpler check.
  if (adjustedWidth > boundaryWidth) {
      proportionalReductionFactor = boundaryWidth / adjustedWidth;
      adjustedHeight *= proportionalReductionFactor;
      adjustedWidth = boundaryWidth;
  }
  if (adjustedHeight > boundaryHeight) {
      proportionalReductionFactor = boundaryHeight / adjustedHeight;
      adjustedWidth *= proportionalReductionFactor;
      adjustedHeight = boundaryHeight;
  }

  // Convert the calculated floating-point dimensions to whole numbers for canvas rendering.
  // Math.floor is used to ensure dimensions do not exceed the boundary by rounding up.
  const finalCanvasWidth = Math.floor(adjustedWidth);
  const finalCanvasHeight = Math.floor(adjustedHeight);

  // --- Canvas Preparation and Image Drawing ---
  // Dynamically create an in-memory canvas element.
  const tempDrawingCanvas = document.createElement('canvas');
  // Acquire the 2D rendering context for drawing operations.
  const canvasContext = tempDrawingCanvas.getContext('2d');

  // Assign the final calculated dimensions to the canvas.
  tempDrawingCanvas.width = finalCanvasWidth;
  tempDrawingCanvas.height = finalCanvasHeight;

  // Draw the original image onto the canvas, scaling it to the new dimensions.
  // The image will be rendered starting from the top-left corner (0,0) of the canvas.
  canvasContext.drawImage(sourcePictureElement, 0, 0, finalCanvasWidth, finalCanvasHeight);

  // --- Output Image Element Creation ---
  // Instantiate a new HTMLImageElement to contain the processed image data.
  const scaledOutputImage = document.createElement('img');

  // Convert the canvas content into a Data URL string.
  // Using 'image/webp' for modern browsers due to its efficiency, with a quality setting.
  scaledOutputImage.src = tempDrawingCanvas.toDataURL("image/webp", 0.8);
  scaledOutputImage.width = finalCanvasWidth;
  scaledOutputImage.height = finalCanvasHeight;

  // Return the newly created image element with the scaled content.
  return scaledOutputImage;
}