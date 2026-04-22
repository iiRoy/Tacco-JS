var TerrainEngine = (function(TerrainEngine) {

    /**
     * @module TerrainEngine
     * @author Andrew J. Baker (modified by AI for Type III clone generation)
     * @description A utility for blending various visual layers and elevation data to construct
     *              a final composite terrain map.
     */

    /**
     * @class LayerBlender
     * @description Manages the composition of terrain layers, including elevation maps and surface materials.
     */
    TerrainEngine.LayerBlender = function(initialConfiguration = {}) {
        // Internal data stores for elevation and surface information.
        let landElevation = initialConfiguration.elevationData || [];
        let voidElevation = initialConfiguration.boundaryData || []; // For regions outside the primary map.
        let surfaceMaterials = initialConfiguration.materialLayers || new Array(256); // Array to hold textures indexed by height.

        /**
         * Private helper: Ensures that all material levels are populated by propagating
         * the next higher-defined material downwards. This prevents gaps in the material array.
         */
        const _fillMissingMaterialLevels = function() {
            // Start from the highest possible level and work downwards.
            if (surfaceMaterials[255] === undefined) {
                console.error("Critical: No surface material defined for the highest elevation (255). " +
                              "Cannot complete material propagation.");
                throw new Error('MissingTopMaterialError: Material at level 255 is required.');
            }

            for (let currentLevel = 254; currentLevel >= 0; --currentLevel) {
                if (surfaceMaterials[currentLevel] === undefined) {
                    // Propagate the material from the next higher level down to the current level.
                    surfaceMaterials[currentLevel] = surfaceMaterials[currentLevel + 1];
                }
            }
        };

        /**
         * Private helper: Validates image dimensions.
         * @param {HTMLImageElement} imgElement - The image to validate.
         * @param {number} expectedWidth - The required width.
         * @param {number} expectedHeight - The required height.
         * @param {string} typeName - A descriptive name for the image type (e.g., "texture", "mask").
         * @throws {Error} If dimensions do not match.
         */
        const _validateImageDimensions = function(imgElement, expectedWidth, expectedHeight, typeName) {
            if (imgElement.naturalWidth !== expectedWidth || imgElement.naturalHeight !== expectedHeight) {
                const errorMsg = `DimensionMismatchError: Invalid ${typeName} dimensions. Expected ${expectedWidth}x${expectedHeight}, ` +
                                 `but received ${imgElement.naturalWidth}x${imgElement.naturalHeight}.`;
                console.error(errorMsg, imgElement);
                throw new Error(errorMsg);
            }
        };

        /**
         * Private helper: Validates canvas element.
         * @param {HTMLCanvasElement} canvasElement - The canvas to validate.
         * @param {string} paramName - The name of the parameter.
         * @throws {TypeError} If not an HTMLCanvasElement.
         */
        const _validateCanvasElement = function(canvasElement, paramName) {
            if (!(canvasElement instanceof HTMLCanvasElement)) {
                const errorMsg = `TypeError: Parameter '${paramName}' must be an instance of HTMLCanvasElement.`;
                console.error(errorMsg, canvasElement);
                throw new TypeError(errorMsg);
            }
        };


        return {
            /**
             * Registers a new surface material (texture) for a specific elevation level.
             *
             * @param {number} materialLevel The 'height' (0-255) at which this material should be applied.
             * @param {Image} visualAsset The image to use as the surface material. Must be 256x256 pixels.
             * @returns {LayerBlender} This instance, for method chaining (fluent interface).
             * @throws {TypeError} If `visualAsset` is not an `HTMLImageElement`.
             * @throws {RangeError} If `materialLevel` is outside the 0-255 range.
             * @throws {Error} If `visualAsset` dimensions are not 256x256.
             */
            registerSurfaceMaterial: function(materialLevel, visualAsset) {
                if (!(visualAsset instanceof HTMLImageElement)) {
                    console.error('TypeError: Supplied visualAsset is not a valid HTMLImageElement.', visualAsset);
                    throw new TypeError('Invalid visualAsset: Expected an HTMLImageElement.');
                }

                if (!Number.isInteger(materialLevel) || materialLevel < 0 || materialLevel > 255) {
                    console.error(`RangeError: materialLevel (${materialLevel}) must be an integer within the range 0 to 255.`);
                    throw new RangeError('Invalid materialLevel: Must be in the range 0..255.');
                }

                _validateImageDimensions(visualAsset, 256, 256, 'surface material image');

                const tempTextureCanvas = document.createElement('canvas');
                tempTextureCanvas.width = visualAsset.naturalWidth;
                tempTextureCanvas.height = visualAsset.naturalHeight;

                const tempTextureCtx = tempTextureCanvas.getContext('2d');
                if (!tempTextureCtx) {
                    console.error("CanvasContextError: Could not get 2D context for temporary texture canvas.");
                    throw new Error("Failed to initialize 2D canvas context.");
                }

                tempTextureCtx.drawImage(visualAsset, 0, 0, tempTextureCanvas.width, tempTextureCanvas.height);

                const imageDataBuffer = tempTextureCtx.getImageData(0, 0, tempTextureCanvas.width, tempTextureCanvas.height).data;

                if (surfaceMaterials[materialLevel] !== undefined) {
                    console.warn(`Warning: Overwriting existing surface material at level ${materialLevel}.`);
                }
                surfaceMaterials[materialLevel] = {
                    pixelData: imageDataBuffer, // Store the raw pixel data directly.
                    sourceWidth: tempTextureCanvas.width,
                    sourceHeight: tempTextureCanvas.height
                };

                return this;
            },

            /**
             * Generates a composite texture map on the provided canvas by blending
             * the elevation data with the registered surface materials.
             *
             * @param {HTMLCanvasElement} outputCanvasElement The target canvas where the
             *                                                composite map will be rendered.
             *                                                Expected to be 1024x1024.
             * @throws {TypeError} If `outputCanvasElement` is not an `HTMLCanvasElement`.
             * @throws {Error} If no material is defined for the highest elevation level.
             * @throws {Error} If the elevation data is not initialized.
             */
            generateCombinedMap: function(outputCanvasElement) {
                _validateCanvasElement(outputCanvasElement, 'outputCanvasElement');

                if (!landElevation || landElevation.length === 0) {
                    console.error("ConfigurationError: Elevation data (landElevation) is not initialized or is empty. " +
                                  "Please call defineGroundHeights() first.");
                    throw new Error('ElevationDataNotInitialized: Cannot composite without elevation data.');
                }

                const outputContext = outputCanvasElement.getContext('2d');
                if (!outputContext) {
                    console.error("CanvasContextError: Could not get 2D context for output canvas.");
                    throw new Error("Failed to initialize 2D canvas context for output.");
                }

                // Ensure all surface material levels are filled before compositing.
                _fillMissingMaterialLevels();

                // Define map dimensions. Using constants for clarity.
                const MAP_WIDTH = 1024;
                const MAP_HEIGHT = 1024;
                const TEXTURE_DIM = 256; // Assumed texture dimensions.
                const BYTES_PER_PIXEL = 4; // RGBA

                // Optional: Pre-calculate the ImageData object for faster pixel manipulation.
                // However, for Type III cloning, sticking to fillRect for visible similarity.

                // Loop through each pixel of the final composite map.
                for (let rowIdx = 0; rowIdx < MAP_HEIGHT; ++rowIdx) {
                    for (let colIdx = 0; colIdx < MAP_WIDTH; ++colIdx) {
                        // Calculate the linear index for the elevation data array.
                        const elevationMapOffset = (rowIdx * MAP_WIDTH) + colIdx;
                        const currentElevationValue = landElevation[elevationMapOffset];

                        // Ensure elevation value is within bounds, though it should be handled by material propagation.
                        if (currentElevationValue === undefined || surfaceMaterials[currentElevationValue] === undefined) {
                            console.warn(`Warning: No material found for elevation ${currentElevationValue} at (${colIdx}, ${rowIdx}). Skipping pixel.`);
                            continue; // Skip this pixel if no material is resolved.
                        }

                        const currentMaterial = surfaceMaterials[currentElevationValue];
                        const materialPixelData = currentMaterial.pixelData;

                        // Calculate the pixel position within the 256x256 texture.
                        // (colIdx % 256) and (rowIdx % 256) effectively tile the texture.
                        const textureX = colIdx % TEXTURE_DIM;
                        const textureY = rowIdx % TEXTURE_DIM;

                        // Calculate the linear index for the pixel data in the 1D Uint8ClampedArray.
                        const materialDataIndex = (textureY * TEXTURE_DIM * BYTES_PER_PIXEL) + (textureX * BYTES_PER_PIXEL);

                        // Extract RGBA components.
                        const red = materialPixelData[materialDataIndex];
                        const green = materialPixelData[materialDataIndex + 1];
                        const blue = materialPixelData[materialDataIndex + 2];
                        // const alpha = materialPixelData[materialDataIndex + 3]; // Alpha typically ignored for fillStyle.

                        // Set the fill style for the current pixel.
                        outputContext.fillStyle = `rgb(${red}, ${green}, ${blue})`;

                        // Draw a 1x1 rectangle for the current pixel.
                        outputContext.fillRect(colIdx, rowIdx, 1, 1);
                    }
                }
            },

            /**
             * Retrieves the current land elevation data as an array.
             *
             * @returns {Array<number>} A copy of the land elevation array. Returns an empty array if not initialized.
             */
            retrieveElevationData: function() {
                if (!landElevation || landElevation.length === 0) {
                    console.warn("Elevation data (landElevation) is currently empty.");
                }
                return [...landElevation]; // Return a shallow copy to prevent external modification.
            },

            /**
             * Retrieves the out-of-bounds elevation data as an array.
             *
             * @returns {Array<number>} A copy of the out-of-bounds elevation array. Returns an empty array if not initialized.
             */
            fetchBoundaryElevation: function() {
                if (!voidElevation || voidElevation.length === 0) {
                    console.warn("Out-of-bounds elevation data (voidElevation) is currently empty.");
                }
                return [...voidElevation]; // Return a shallow copy.
            },

            /**
             * Applies a greyscale image mask (like a 2.5D sprite's heightmap) onto the
             * existing land elevation data.
             *
             * @param {HTMLImageElement} shapeMaskImage The 2.5D sprite's heightmap;
             *                                          should contain a greyscale image.
             * @param {number} offsetX The x-coordinate on the main map where the mask should be applied.
             * @param {number} offsetY The y-coordinate on the main map where the mask should be applied.
             * @param {number} amplificationFactor The factor to multiply each mask pixel value by,
             *                                     influencing its impact on elevation. Must be positive.
             * @returns {LayerBlender} This instance, for method chaining.
             * @throws {TypeError} If `shapeMaskImage` is not an `HTMLImageElement`.
             * @throws {RangeError} If `amplificationFactor` is not positive.
             */
            superimposeTerrainMask: function(shapeMaskImage, offsetX, offsetY, amplificationFactor) {
                if (!(shapeMaskImage instanceof HTMLImageElement)) {
                    console.error('TypeError: Supplied shapeMaskImage is not a valid HTMLImageElement.', shapeMaskImage);
                    throw new TypeError('Invalid shapeMaskImage: Expected an HTMLImageElement.');
                }
                if (amplificationFactor <= 0) {
                    console.error(`RangeError: amplificationFactor (${amplificationFactor}) must be a positive number.`);
                    throw new RangeError('Invalid amplificationFactor: Must be greater than 0.');
                }

                // Create a temporary canvas to extract pixel data from the mask image.
                const tempMaskCanvas = document.createElement('canvas');
                tempMaskCanvas.width = shapeMaskImage.naturalWidth;
                tempMaskCanvas.height = shapeMaskImage.naturalHeight;

                const tempMaskCtx = tempMaskCanvas.getContext('2d');
                if (!tempMaskCtx) {
                    console.error("CanvasContextError: Could not get 2D context for temporary mask canvas.");
                    throw new Error("Failed to initialize 2D canvas context for mask.");
                }

                tempMaskCtx.drawImage(shapeMaskImage, 0, 0);

                const maskPixelBuffer = tempMaskCtx.getImageData(0, 0, tempMaskCanvas.width, tempMaskCanvas.height).data;

                const BASE_ELEVATION_OFFSET = 192; // A constant offset added to mask values.

                // Iterate over each pixel of the mask image.
                for (let maskRow = 0; maskRow < tempMaskCanvas.height; ++maskRow) {
                    for (let maskCol = 0; maskCol < tempMaskCanvas.width; ++maskCol) {
                        // Calculate the linear index for the mask's pixel data (RGBA).
                        const maskDataIndex = (maskRow * tempMaskCanvas.width + maskCol) * 4;

                        // Check the alpha channel (transparency). Only apply if not fully transparent.
                        // A threshold of 1 is used to catch any non-zero alpha.
                        if (maskPixelBuffer[maskDataIndex + 3] > 0) {
                            // Calculate the target coordinates on the main elevation map.
                            const targetMapX = maskCol + offsetX;
                            const targetMapY = maskRow + offsetY;

                            // Ensure target coordinates are within the bounds of the 1024x1024 map.
                            if (targetMapX >= 0 && targetMapX < 1024 && targetMapY >= 0 && targetMapY < 1024) {
                                // Calculate the linear index for the main elevation data array.
                                const targetMapOffset = (targetMapY * 1024) + targetMapX;

                                // The red channel of the greyscale mask determines the height.
                                const maskHeightValue = maskPixelBuffer[maskDataIndex];

                                // Apply the mask's height, scaled and offset, to the land elevation data.
                                landElevation[targetMapOffset] = BASE_ELEVATION_OFFSET + (maskHeightValue * amplificationFactor);
                            } else {
                                // Optionally, handle pixels falling outside the main map if needed.
                                // For this clone, we'll just ignore them or log if debugging.
                                // console.log(`Mask pixel at (${maskCol},${maskRow}) falls outside map bounds.`);
                            }
                        }
                    }
                }

                return this;
            },

            /**
             * Initializes the primary land elevation data from a greyscale canvas.
             * This canvas is expected to be 1024x1024 pixels.
             *
             * @param {HTMLCanvasElement} inputElevationCanvas The source canvas containing
             *                                                 the greyscale elevation image.
             * @returns {LayerBlender} This instance, for method chaining.
             * @throws {TypeError} If `inputElevationCanvas` is not an `HTMLCanvasElement`.
             * @throws {Error} If `inputElevationCanvas` dimensions are not 1024x1024.
             */
            defineGroundHeights: function(inputElevationCanvas) {
                _validateCanvasElement(inputElevationCanvas, 'inputElevationCanvas');
                _validateImageDimensions(inputElevationCanvas, 1024, 1024, 'elevation canvas');

                const sourceContext = inputElevationCanvas.getContext('2d');
                if (!sourceContext) {
                    console.error("CanvasContextError: Could not get 2D context for input elevation canvas.");
                    throw new Error("Failed to initialize 2D canvas context for elevation input.");
                }

                // Extract raw pixel data from the input canvas.
                const rawElevationPixels = sourceContext.getImageData(0, 0, 1024, 1024).data;

                if (!rawElevationPixels || rawElevationPixels.length === 0) {
                    console.error("DataExtractionError: Failed to extract pixel data from input elevation canvas.");
                    throw new Error("Empty pixel data from elevation canvas.");
                }

                // Pre-allocate arrays for efficiency, assuming 1024x1024 map.
                landElevation = new Array(1024 * 1024);
                voidElevation = new Array(1024 * 1024);

                // Iterate through the 1024x1024 grid.
                for (let row = 0; row < 1024; ++row) {
                    for (let column = 0; column < 1024; ++column) {
                        // Calculate the linear index for the 1D elevation arrays.
                        const mapPosition = (row * 1024) + column;
                        // The red channel of a greyscale image typically holds the height value.
                        const pixelDataOffset = mapPosition * 4; // Each pixel is RGBA (4 bytes).

                        landElevation[mapPosition] = rawElevationPixels[pixelDataOffset];
                        voidElevation[mapPosition] = landElevation[mapPosition]; // Initialize out-of-bounds with same data.
                    }
                }

                return this;
            }
        };
    };

    return TerrainEngine;
}(TerrainEngine || {}));