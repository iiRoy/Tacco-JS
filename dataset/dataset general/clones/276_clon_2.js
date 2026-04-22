/* This module manages graphical presentation. */
var DisplayManager = function( drawingSurface ) {

  this.drawingSurface = drawingSurface;
  this.drawingContext = drawingSurface.getContext("2d");
};


angular.extend( DisplayManager.prototype, {

  /**
  * Resizes the primary drawing surface to match its parent.
  */
  adjustDisplayArea: function() {

    var currSurface = this.drawingSurface;
    var containerElement = currSurface.parentNode;

    currSurface.width = containerElement.clientWidth;
    currSurface.height = containerElement.clientHeight;

  },


  /**
  * Applies a grayscale filter to the current canvas content.
  */
  processToGrayscale: function() {

    var currentContext = this.drawingContext;
    var currentSurface = this.drawingSurface;
    var imageDataBuffer = currentContext.getImageData( 0, 0, currentSurface.width, currentSurface.height );
    var pixelDataArray = imageDataBuffer.data;
    var totalPixelBytes = pixelDataArray.length;

    for (var idx = 0; idx < totalPixelBytes; idx += 4) {

      var redComp = pixelDataArray[idx];
      var greenComp = pixelDataArray[idx + 1];
      var blueComp = pixelDataArray[idx + 2];
      var grayValue = (0.34 * redComp) + (0.5 * greenComp) + (0.16 * blueComp);

      pixelDataArray[idx] = grayValue;
      pixelDataArray[idx + 1] = grayValue;
      pixelDataArray[idx + 2] = grayValue;
    }

    currentContext.putImageData( imageDataBuffer, 0, 0 );
  },


  /**
  * Draws a specific portion of an image onto a target canvas.
  * @param {HTMLElement} targetSurface - The canvas to draw on.
  * @param {CanvasRenderingContext2D} renderingContext - The 2D context of the target surface.
  * @param {HTMLImageElement} sourceImage - The image to draw from.
  * @param {Number} srcX - X-coordinate of the top-left corner of the source rectangle.
  * @param {Number} srcY - Y-coordinate of the top-left corner of the source rectangle.
  * @param {Number} originalImageWidth - Width of the image.
  * @param {Number} originalImageHeight - Height of the image.
  * @param {Number} destWidth - Width of the destination rectangle.
  * @param {Number} destHeight - Height of the destination rectangle.
  */
  renderImageSlice: function( targetSurface, renderingContext, sourceImage, srcX, srcY, originalImageWidth, originalImageHeight, destWidth, destHeight ) {

    var scaleFactorX = destWidth / targetSurface.width;
    var scaleFactorY = destHeight / targetSurface.height;

    var sourceCropX = srcX / (targetSurface.width) * originalImageWidth;
    var sourceCropY = srcY / (targetSurface.height) * originalImageHeight;
    var croppedImageWidth = originalImageWidth * scaleFactorX;
    var croppedImageHeight = originalImageHeight * scaleFactorY;

    renderingContext.drawImage( sourceImage, sourceCropX, sourceCropY, croppedImageWidth, croppedImageHeight, srcX, srcY, destWidth, destHeight );

  },


  /**
  * Displays an image, applies a grayscale filter, and highlights a selected region.
  * @param {HTMLImageElement} inputImage - The image to display.
  * @param {Object} focusArea - Defines the selected region {left, top, width, height}.
  * @param {Object} fullImageSize - The original dimensions of the input image {width, height}.
  */
  displayImageContent: function( inputImage, focusArea, fullImageSize ) {

    var currentContext = this.drawingContext;
    var currentSurface = this.drawingSurface;
    var viewWidth = currentSurface.width;
    var viewHeight = currentSurface.height;
    var horizontalScale = fullImageSize.width / viewWidth;
    var verticalScale = fullImageSize.height / viewHeight;

    currentContext.drawImage( inputImage, 0, 0, viewWidth, viewHeight );

    this.processToGrayscale();

    this.renderImageSlice( currentSurface, currentContext, inputImage, focusArea.left, focusArea.top, fullImageSize.width, fullImageSize.height, focusArea.width, focusArea.height );

  },


  /**
  * Resizes the display area and then renders the image content.
  * @param {HTMLImageElement} inputImage - The image to display.
  * @param {Object} focusArea - Defines the selected region {left, top, width, height}.
  * @param {Object} fullImageSize - The original dimensions of the input image {width, height}.
  */
  updateAndDisplayContent: function( inputImage, focusArea, fullImageSize ) {

    this.adjustDisplayArea();
    this.displayImageContent( inputImage, focusArea, fullImageSize );
  },


  /**
  * Exports a specific region of the canvas as a data URI string.
  * @param {String} outputFormat - The MIME type for the output image (e.g., 'image/png').
  * @param {Object} exportRegion - Defines the region to export {left, top, width, height}.
  * @return {String} The data URI of the exported image.
  */
  exportSectionAsURI: function( outputFormat, exportRegion ) {

    var currentSurface = this.drawingSurface;
    var tempCanvasElement = document.createElement('canvas');
    var tempContext = tempCanvasElement.getContext('2d');

    tempCanvasElement.width = exportRegion.width;
    tempCanvasElement.height = exportRegion.height;

    tempContext.drawImage( currentSurface, exportRegion.left, exportRegion.top, exportRegion.width, exportRegion.height, 0, 0, exportRegion.width, exportRegion.height );

    return tempCanvasElement.toDataURL( outputFormat );

  }

});