/*
 *  Module for blending visual layers.
 *  This script facilitates the combination of various visual assets
 *  based on underlying elevation data.
 *
 *  @author Andrew J. Baker (original author, acknowledging foundational work)
 */

/* @namespace TerrainEngine */
var TerrainEngine = (function (TerrainEngineModule) {
  /*
   *  @class LayerBlender
   *  Manages the creation and manipulation of layered terrain visuals.
   */
  TerrainEngineModule.LayerBlender = function (unspecified) {
    var
      _elevationData = [], // Stores the primary altitude information as a numeric array.
      _peripheralElevationData = [], // Holds supplemental data for areas outside the main view.
      _visualLayerRegistry = []; // An indexed collection of image data for different altitudes.

    return {
      /*
       *  Incorporates a visual layer into the internal registry, associating it with an elevation.
       *
       *  @param {number} elevationLevel The numerical value representing the altitude at which this layer applies (0-255).
       *  @param {HTMLImageElement} visualGraphic The source image element to be processed and used as a visual layer.
       *  @returns {TerrainEngineModule.LayerBlender} The current instance for method chaining.
       *  @throws {Error} If the visualGraphic is not an HTMLImageElement, elevationLevel is out of range, or dimensions are incorrect.
       */
      registerVisualLayer: function (elevationLevel, visualGraphic) {
        if (!(visualGraphic instanceof HTMLImageElement)) {
          throw ('Invalid visualGraphic: Expected an instance of HTMLImageElement.');
        }

        if (elevationLevel < 0 || elevationLevel > 255) {
          throw ('Elevation level must be within the 0 to 255 range.');
        }

        if (visualGraphic.width !== 256 ||
          visualGraphic.height !== 256) {
          throw ('Visual asset dimensions are incorrect; required 256x256 pixels.');
        }

        let
          layerCanvas = document.createElement('canvas'); // A temporary off-screen canvas for image processing.
        layerCanvas.width = visualGraphic.width;
        layerCanvas.height = visualGraphic.height;

        let layerContext = layerCanvas.getContext('2d'); // The 2D rendering context for the temporary canvas.

        layerContext.drawImage(visualGraphic, 0, 0,
          layerCanvas.width, layerCanvas.height);

        _visualLayerRegistry[elevationLevel] = {
          pixelInfo: layerContext.getImageData(0, 0,
            layerCanvas.width,
            layerCanvas.height).data, // Raw pixel data for the layer.
          height: layerCanvas.height,
          width: layerCanvas.width
        }; // Store the processed image data at the specified elevation.

        return this;
      },

      /*
       *  Generates a combined visual map onto a target canvas, blending layers according to elevation data.
       *
       *  @param {HTMLCanvasElement} outputCanvas The destination canvas where the final blended terrain will be rendered.
       *  @throws {Error} If outputCanvas is not an HTMLCanvasElement or if no layer is registered at elevation 255.
       */
      renderOutput: function (outputCanvas) {
        if (!(outputCanvas instanceof HTMLCanvasElement)) {
          throw ('Invalid outputCanvas: Expected an instance of HTMLCanvasElement.');
        }

        let outputContext = outputCanvas.getContext('2d'); // The 2D rendering context for the final output canvas.

        let tempLayerCanvas = document.createElement('canvas'); // A scratchpad canvas, though not strictly used in this method's current logic.
        tempLayerCanvas.width = 256;
        tempLayerCanvas.height = 256;

        let tempLayerContext = tempLayerCanvas.getContext('2d'); // Context for the scratchpad canvas.

        if (_visualLayerRegistry[255] === unspecified) {
          throw ('No visual layer defined at elevation 255; blending cannot proceed without a top-most layer.');
        }

        // Propagate higher-level layers downwards to fill in any missing intermediate layers.
        for (var idx = 254; idx >= 0; --idx) {
          if (_visualLayerRegistry[idx] === unspecified) {
            _visualLayerRegistry[idx] = _visualLayerRegistry[idx + 1];
          }
        }

        // Iterate through each pixel position on the output canvas.
        for (var row = 0; row < 1024; ++row) {
          for (var col = 0; col < 1024; ++col) {
            var currentElevation = _elevationData[(row << 10) + col]; // Retrieve the elevation value for the current pixel.

            var pixelIndex = ((row & 255) << 10) + ((col & 255) << 2); // Calculate the byte offset within the source layer's pixel data.

            // Set the drawing color based on the RGB values from the corresponding visual layer's pixel.
            outputContext.fillStyle = 'rgb(' +
              _visualLayerRegistry[currentElevation].pixelInfo[pixelIndex] + ',' +
              _visualLayerRegistry[currentElevation].pixelInfo[pixelIndex + 1] + ',' +
              _visualLayerRegistry[currentElevation].pixelInfo[pixelIndex + 2] + ')';

            outputContext.fillRect(col, row, 1, 1); // Draw a single 1x1 pixel rectangle at the current position.
          }
        }
      },

      /*
       *  Retrieves the main elevation data array.
       *
       *  @returns {Array<number>} An array containing numerical elevation values.
       */
      retrieveElevationData: function () {
        return _elevationData;
      },

      /*
       *  Retrieves the supplemental out-of-bounds elevation data array.
       *
       *  @returns {Array<number>} An array containing numerical elevation values for peripheral regions.
       */
      retrievePeripheralElevationData: function () {
        return _peripheralElevationData;
      },

      /*
       *  Applies a greyscale image as a heightmap overlay onto the primary elevation data.
       *
       *  @param {HTMLImageElement} overlayGraphic The greyscale image element representing the overlay's altitude data.
       *  @param {number} offsetX The horizontal starting coordinate for applying the overlay.
       *  @param {number} offsetY The vertical starting coordinate for applying the overlay.
       *  @param {number} amplificationFactor A multiplier to adjust the intensity of the overlay's height values.
       *  @returns {TerrainEngineModule.LayerBlender} The current instance for method chaining.
       */
      applyOverlay: function (overlayGraphic, offsetX, offsetY, amplificationFactor) {
        let overlayCanvas = document.createElement('canvas'); // A temporary canvas for processing the overlay graphic.
        overlayCanvas.width = overlayGraphic.width;
        overlayCanvas.height = overlayGraphic.height;

        let overlayContext = overlayCanvas.getContext('2d'); // The 2D rendering context for the overlay canvas.

        overlayContext.drawImage(overlayGraphic, 0, 0); // Draw the overlay image onto its temporary canvas.

        let overlayPixelData = overlayContext.getImageData(0, 0, overlayCanvas.width,
          overlayCanvas.height).data; // Extract the raw pixel data from the overlay.

        for (let rowIter = 0; rowIter < overlayCanvas.height; ++rowIter) {
          for (let colIter = 0; colIter < overlayCanvas.width; ++colIter) {
            let dataPosition = rowIter * overlayCanvas.width + colIter; // Calculate the linear index for the overlay's pixel data.

            // Only apply the overlay if the pixel is not fully transparent (alpha channel is non-zero).
            if (overlayPixelData[dataPosition * 4 + 3]) {
              let arrayPosition = ((rowIter + offsetY) << 10) + (colIter + offsetX); // Determine the target index in the main elevation data array.

              _elevationData[arrayPosition] = 192 +
                overlayPixelData[(rowIter * overlayCanvas.width + colIter) * 4] *
                amplificationFactor; // Update the elevation value, adding a base and applying amplification.
            }
          }
        }

        return this;
      },

      /*
       *  Initializes the primary and peripheral elevation maps from a given source canvas.
       *
       *  @param {HTMLCanvasElement} elevationMapSource The canvas containing a greyscale image that defines the initial elevation map.
       *  @returns {TerrainEngineModule.LayerBlender} The current instance for method chaining.
       */
      initializeElevationMap: function (elevationMapSource) {
        let sourcePixelData = elevationMapSource.getContext('2d')
          .getImageData(0, 0, 1024, 1024).data; // Retrieve the pixel data from the source elevation map.

        for (var row = 0; row < 1024; ++row) {
          for (var col = 0; col < 1024; ++col) {
            var arrayPosition = (row << 10) + col; // Calculate the array index for the current pixel.

            _elevationData[arrayPosition] = sourcePixelData[arrayPosition << 2]; // Set the primary elevation value (red channel of greyscale).
            _peripheralElevationData[arrayPosition] = _elevationData[arrayPosition]; // Duplicate the value for the peripheral data.
          }
        }

        return this;
      }
    };
  };

  return TerrainEngineModule;
}(TerrainEngine || {}));