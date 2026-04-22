Raphael.fn.renderPixelArt = async function(pixelOptions) {
  pixelOptions = pixelOptions || {};
  const sourceImageUri = pixelOptions.sourceImageUri;
  const cellDimension = pixelOptions.cellDimension || 10;
  const pointShape = pixelOptions.pointShape || "circle";
  const visualAttributes = pixelOptions.visualAttributes || { outlineColor: "none" };
  const dynamicEffect = pixelOptions.dynamicEffect;
  const customRenderer = pixelOptions.customRenderer;

  const drawingSurface = this;

  const halfCell = cellDimension / 2;
  const dotRadius = halfCell - 1;

  const acquireImageBitmap = (uri) => {
    return new Promise((resolve, reject) => {
      const pictureElement = new Image();
      pictureElement.crossOrigin = '';
      pictureElement.onload = () => resolve(pictureElement);
      pictureElement.onerror = (e) => reject(new Error(`Failed to load image: ${uri}`));
      pictureElement.src = uri;
    });
  };

  const hiddenImageProcessor = document.createElement('canvas');
  const graphicsContext = hiddenImageProcessor.getContext('2d');
  let colorMapData;

  try {
    const loadedPicture = await acquireImageBitmap(sourceImageUri);

    hiddenImageProcessor.width = loadedPicture.width;
    hiddenImageProcessor.height = loadedPicture.height;
    graphicsContext.drawImage(loadedPicture, 0, 0, loadedPicture.width, loadedPicture.height);
    colorMapData = graphicsContext.getImageData(0, 0, loadedPicture.width, loadedPicture.height).data;

  } catch (errorDetails) {
    console.error("Image processing failed:", errorDetails);
    return;
  }

  const fetchRgbString = (xCoord, yCoord) => {
    const pixelIndex = ((hiddenImageProcessor.width * yCoord) + xCoord) * 4;
    return `rgb(${colorMapData[pixelIndex]}, ${colorMapData[pixelIndex + 1]}, ${colorMapData[pixelIndex + 2]})`;
  };

  const makeBlock = (xPos, yPos, cellColor) => {
    return drawingSurface.rect(xPos, yPos, cellDimension, cellDimension)
      .attr({ fill: cellColor })
      .attr(visualAttributes);
  };

  const makeDot = (xPos, yPos, cellColor) => {
    return drawingSurface.circle(xPos + halfCell, yPos + halfCell, dotRadius)
      .attr({ fill: cellColor })
      .attr(visualAttributes);
  };

  const shapeRenderers = {
    "rectangle": makeBlock,
    "circle": makeDot
  };

  const gridPoints = [];
  for (let currentX = 0; currentX < hiddenImageProcessor.width; currentX += cellDimension) {
    for (let currentY = 0; currentY < hiddenImageProcessor.height; currentY += cellDimension) {
      gridPoints.push({ x: currentX, y: currentY });
    }
  }

  gridPoints.forEach(point => {
    const sampledColor = fetchRgbString(point.x + halfCell, point.y + halfCell);
    let renderedComponent;

    if (customRenderer) {
      renderedComponent = customRenderer(drawingSurface, point.x, point.y, sampledColor, cellDimension, visualAttributes);
    } else {
      const specificShapeRenderer = shapeRenderers[pointShape];
      if (specificShapeRenderer) {
        renderedComponent = specificShapeRenderer(point.x, point.y, sampledColor);
      } else {
        renderedComponent = makeDot(point.x, point.y, sampledColor);
      }
    }

    if (dynamicEffect && renderedComponent) {
      dynamicEffect(renderedComponent, point.x, point.y, cellDimension);
    }
  });
};