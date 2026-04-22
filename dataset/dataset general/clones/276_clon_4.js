class VisualPresenter {
  #_displaySurface;
  #_renderContext;

  constructor(surfaceElement) {
    this.#_displaySurface = surfaceElement;
    this.#_renderContext = surfaceElement.getContext("2d");
  }

  adjustSurfaceDimensions() {
    const currentSurface = this.#_displaySurface;
    const enclosingElement = currentSurface.parentNode;

    currentSurface.width = enclosingElement.clientWidth;
    currentSurface.height = enclosingElement.clientHeight;
  }

  processToMonochrome() {
    const currentContext = this.#_renderContext;
    const currentSurface = this.#_displaySurface;
    const visualData = currentContext.getImageData(0, 0, currentSurface.width, currentSurface.height);
    const pixelArray = visualData.data;
    const totalPixels = pixelArray.length;

    let currentPixelIndex = 0;
    while (currentPixelIndex < totalPixels) {
      const redComponent = pixelArray[currentPixelIndex];
      const greenComponent = pixelArray[currentPixelIndex + 1];
      const blueComponent = pixelArray[currentPixelIndex + 2];

      const calculatedBrightness = Math.floor(0.34 * redComponent + 0.5 * greenComponent + 0.16 * blueComponent);

      pixelArray[currentPixelIndex] = calculatedBrightness;
      pixelArray[currentPixelIndex + 1] = calculatedBrightness;
      pixelArray[currentPixelIndex + 2] = calculatedBrightness;

      currentPixelIndex += 4;
    }
    currentContext.putImageData(visualData, 0, 0);
  }

  projectSubsegment(targetSurface, targetCtx, sourceImage, xOffset, yOffset, fullImgWidth, fullImgHeight, segmentWidth, segmentHeight) {
    const scaleFactorX = segmentWidth / targetSurface.width;
    const scaleFactorY = segmentHeight / targetSurface.height;

    const sourceX = (xOffset / targetSurface.width) * fullImgWidth;
    const sourceY = (yOffset / targetSurface.height) * fullImgHeight;

    const sourceSliceWidth = fullImgWidth * scaleFactorX;
    const sourceSliceHeight = fullImgHeight * scaleFactorY;

    targetCtx.drawImage(
      sourceImage,
      sourceX,
      sourceY,
      sourceSliceWidth,
      sourceSliceHeight,
      xOffset,
      yOffset,
      segmentWidth,
      segmentHeight
    );
  }

  composeImage(sourcePic, regionDetails, sizeInfo) {
    const currentContext = this.#_renderContext;
    const currentSurface = this.#_displaySurface;

    const surfaceWidth = currentSurface.width;
    const surfaceHeight = currentSurface.height;

    currentContext.drawImage(sourcePic, 0, 0, surfaceWidth, surfaceHeight);

    this.processToMonochrome();

    this.projectSubsegment(
      currentSurface,
      currentContext,
      sourcePic,
      regionDetails.left,
      regionDetails.top,
      sizeInfo.width,
      sizeInfo.height,
      regionDetails.width,
      regionDetails.height
    );
  }

  updateAndDisplay(inputImage, focusArea, dimensionalData) {
    this.adjustSurfaceDimensions();
    this.composeImage(inputImage, focusArea, dimensionalData);
  }

  extractRegionAsDataUrl(outputFormat, targetRegion) {
    const mainSurface = this.#_displaySurface;
    const tempSurface = document.createElement('canvas');
    const tempContext = tempSurface.getContext('2d');

    tempSurface.width = targetRegion.width;
    tempSurface.height = targetRegion.height;

    tempContext.drawImage(
      mainSurface,
      targetRegion.left,
      targetRegion.top,
      targetRegion.width,
      targetRegion.height,
      0,
      0,
      targetRegion.width,
      targetRegion.height
    );

    return tempSurface.toDataURL(outputFormat);
  }
}