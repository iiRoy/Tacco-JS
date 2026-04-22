const RANDOM_32BIT_MAX_EXCLUSIVE = 0x100000000; // Represents 2^32, the upper bound for Math.random() scaling.
const FULLY_OPAQUE_ALPHA = 255;              // Standard value for a fully opaque alpha channel (0-255).
const RGBA_CHANNEL_COUNT = 4;                // Denotes the number of color channels (Red, Green, Blue, Alpha).

/**
 * Normalizes an input color definition into a 4-element RGBA array.
 * If the input is a single number, it's expanded to [value, value, value, alphaFallback].
 * If it's an array, it's padded or truncated to exactly 4 elements.
 * Padding for the alpha channel uses alphaFallback; other channels repeat the last value.
 *
 * @param {number|Array<number>} inputColorDefinition - The color value or array to process.
 * @param {number} alphaFallback - The default alpha value to use if the alpha channel is missing.
 * @returns {Array<number>} A 4-element array representing RGBA values, each from 0-255.
 */
function standardizeColorComponents(inputColorDefinition, alphaFallback) {
  let channelValues;

  // Determine if the input is an array or a single numeric value.
  if (!Array.isArray(inputColorDefinition)) {
    // If it's a single value, apply it to R, G, B channels and use the fallback for Alpha.
    channelValues = [inputColorDefinition, inputColorDefinition, inputColorDefinition, alphaFallback];
  } else {
    // If it's already an array, create a shallow copy to avoid side effects on the original.
    channelValues = [...inputColorDefinition];

    // Pad the array with additional elements until it reaches the RGBA_CHANNEL_COUNT.
    while (channelValues.length < RGBA_CHANNEL_COUNT) {
      // If the current element being added is for the alpha channel (index 3), use the fallback.
      // Otherwise, duplicate the last existing channel value.
      if (channelValues.length === (RGBA_CHANNEL_COUNT - 1)) {
        channelValues.push(alphaFallback);
      } else {
        channelValues.push(channelValues[channelValues.length - 1]);
      }
    }

    // If the input array had more than 4 elements, truncate it to the standard RGBA_CHANNEL_COUNT.
    if (channelValues.length > RGBA_CHANNEL_COUNT) {
      channelValues.splice(RGBA_CHANNEL_COUNT);
    }
  }
  return channelValues;
}

/**
 * Generates a Data URL representing a random image, based on specified dimensions and color ranges.
 * Each pixel's RGBA components are derived from a base color and a random offset within a given range.
 *
 * @param {number} desiredWidth - The target width for the generated image. Must be a positive number.
 * @param {number} desiredHeight - The target height for the generated image. Must be a positive number.
 * @param {number|Array<number>} baseColorComponents - The base (minimum) RGBA values for pixels.
 *                                                     Can be a single number (applied to R,G,B) or an array [R,G,B,A].
 * @param {number|Array<number>} colorFluctuationRange - The maximum delta (range) to add to the base color components.
 *                                                       Can be a single number or an array [R,G,B,A].
 * @returns {string} A Data URL (image/png) of the procedurally generated image.
 */
module.exports = function generateRandomPixelCanvas(desiredWidth, desiredHeight, baseColorComponents, colorFluctuationRange) {
  // Input validation and sanitization for dimensions. Ensure positive integer values.
  const validatedWidth = Math.max(1, Math.floor(Number(desiredWidth) || 1));
  const validatedHeight = Math.max(1, Math.floor(Number(desiredHeight) || 1));

  // Create an in-memory HTML canvas element and acquire its 2D rendering context.
  const offscreenCanvas = document.createElement('canvas');
  const drawingContext = offscreenCanvas.getContext('2d');

  // Assign the validated dimensions to the canvas.
  offscreenCanvas.width = validatedWidth;
  offscreenCanvas.height = validatedHeight;

  // Normalize the base and fluctuation color inputs into consistent 4-element RGBA arrays.
  const normalizedBase = standardizeColorComponents(baseColorComponents, FULLY_OPAQUE_ALPHA);
  const normalizedFluctuation = standardizeColorComponents(colorFluctuationRange, FULLY_OPAQUE_ALPHA);

  // Create an ImageData object, which provides a pixel buffer (Uint8ClampedArray)
  // to directly manipulate the image's raw pixel data.
  const pixelDataBuffer = drawingContext.createImageData(offscreenCanvas.width, offscreenCanvas.height);
  const pixelValueArray = pixelDataBuffer.data; // Direct reference to the Uint8ClampedArray

  // Calculate the total number of pixels in the image.
  const totalImagePixels = offscreenCanvas.width * offscreenCanvas.height;

  // Iterate through each individual pixel position within the image.
  for (let currentPixelIdx = 0; currentPixelIdx < totalImagePixels; ++currentPixelIdx) {
    // Determine the starting index for the current pixel's RGBA data within the flat pixelValueArray.
    const arrayOffset = currentPixelIdx * RGBA_CHANNEL_COUNT;

    // Generate a single 32-bit pseudo-random integer. This value will be used
    // to derive distinct random components for R, G, B, and A channels of the current pixel.
    const thirtyTwoBitRandom = Math.floor(Math.random() * RANDOM_32BIT_MAX_EXCLUSIVE);

    // Iterate through each of the four RGBA color channels (0=R, 1=G, 2=B, 3=A).
    for (let currentChannel = 0; currentChannel < RGBA_CHANNEL_COUNT; ++currentChannel) {
      // Calculate the bit shift required to isolate the 8-bit value for the current channel
      // from the 32-bit random integer (e.g., 0 for R, 8 for G, 16 for B, 24 for A).
      const shiftAmount = currentChannel * 8;

      // Extract the 8-bit (0-255) random value specific to this channel.
      const extractedRandomByte = (thirtyTwoBitRandom >> shiftAmount) & 0xFF;

      // Convert the extracted byte into a normalized floating-point value between 0.0 and 1.0.
      const normalizedRandomFactor = extractedRandomByte / FULLY_OPAQUE_ALPHA; // Divide by 255.0

      // Initialize the final color component with its base value.
      let finalChannelColorValue = normalizedBase[currentChannel];

      // If a fluctuation range is defined for this specific channel (i.e., it's not zero),
      // apply the random variation.
      if (normalizedFluctuation[currentChannel] !== 0) {
        // Add a random amount (scaled by the fluctuation range) to the base color.
        // Math.floor ensures the result is an integer pixel value.
        finalChannelColorValue += Math.floor(normalizedRandomFactor * normalizedFluctuation[currentChannel]);
      }

      // Clamp the final color component value to ensure it remains within the valid byte range (0-255).
      // This prevents visual artifacts from out-of-bounds values.
      pixelValueArray[arrayOffset + currentChannel] = Math.max(0, Math.min(FULLY_OPAQUE_ALPHA, finalChannelColorValue));
    }
  }

  // Transfer the meticulously generated pixel data from the buffer onto the canvas.
  drawingContext.putImageData(pixelDataBuffer, 0, 0);

  // Convert the canvas content into a PNG Data URL string and return it.
  // This string can be used as the source for an <img> tag.
  return offscreenCanvas.toDataURL('image/png');
};