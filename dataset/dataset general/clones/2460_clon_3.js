let createDisplaySurface = function (settingsBundle) {
  // Validate input configuration
  if (!settingsBundle || typeof settingsBundle !== 'object') {
    console.error("Configuration object is missing or invalid for canvas creation.");
    return null;
  }

  const outputElement = document.createElement("canvas");
  // Set dimensions based on provided configuration
  outputElement.width = settingsBundle.surfaceWidth || 800; // Use default if not provided
  outputElement.height = settingsBundle.surfaceHeight || 600; // Use default if not provided
  // Apply background styling
  outputElement.style.backgroundColor = settingsBundle.backgroundColor || "#FFFFFF";
  outputElement.style.border = "1px solid #ccc"; // Added a border for visibility

  // Append the newly created canvas to the document body
  document.body.appendChild(outputElement);
  return outputElement;
};

let renderSpot = function (drawingContext, coordX, coordY, dotColorHex = '#000000') {
  // Begin a new path for drawing the spot
  drawingContext.beginPath();
  // Set fill style using the provided color, defaulting to black
  drawingContext.fillStyle = dotColorHex;
  // Draw a small filled rectangle as the spot, centered around (coordX, coordY)
  const spotSize = 4;
  const halfSpot = spotSize / 2;
  drawingContext.fillRect(coordX - halfSpot, coordY - halfSpot, spotSize, spotSize);
  // No need to closePath or stroke for a filled rectangle
};

let renderSegment = function (drawingContext, startX, startY, endX, endY) {
  // Start a fresh path
  drawingContext.beginPath();
  // Move to the starting coordinates
  drawingContext.moveTo(startX, startY);
  // Draw a line to the ending coordinates
  drawingContext.lineTo(endX, endY);
  // Render the line on the canvas
  drawingContext.stroke();
};

let renderStartNode = function (drawingContext, posX, posY) {
  // Define color for the start node
  const startNodeColor = "rgb(255, 0, 0)";
  // Draw the actual point marker
  renderSpot(drawingContext, posX, posY, startNodeColor);

  // Set up text properties for the label
  drawingContext.font = "bold 15px Arial";
  drawingContext.fillStyle = "#333333"; // Dark gray for better contrast
  const labelOffsetX = 7;
  const labelOffsetY = 2; // Slightly adjust vertical position
  // Render the 'S' label next to the point
  drawingContext.fillText("S", posX + labelOffsetX, posY + labelOffsetY);
};

let renderIntermediateNode = function (drawingContext, posX, posY, indexValue) {
  // Define color for intermediate control nodes
  const controlNodeColor = "rgba(0, 0, 255, 0.9)"; // Slightly transparent blue
  // Draw the point marker
  renderSpot(drawingContext, posX, posY, controlNodeColor);

  // Set up text properties for the label
  drawingContext.font = "13px 'Verdana'";
  drawingContext.fillStyle = "#000000";
  const labelOffset = 6;
  // Render the index number as a label
  drawingContext.fillText(String(indexValue), posX + labelOffset, posY);
};

let renderCentralNode = function (drawingContext, posX, posY) {
  // Define color for the center node
  const centralNodeColor = "rgb(0, 0, 255)";
  // Draw the point marker
  renderSpot(drawingContext, posX, posY, centralNodeColor);

  // Set up text properties for the label
  drawingContext.font = "14px 'Times New Roman'";
  drawingContext.fillStyle = "#000000";
  const textOffset = 5;
  // Render the 'C' label
  drawingContext.fillText("C", posX + textOffset, posY);
};

let renderEndNode = function (drawingContext, posX, posY) {
  // Define color for the end node
  const endNodeColor = "rgb(0, 255, 0)";
  // Draw the point marker
  renderSpot(drawingContext, posX, posY, endNodeColor);

  // Set up text properties for the label
  drawingContext.font = "14px 'Courier New'";
  drawingContext.fillStyle = "#000000";
  const textOffset = 5;
  // Render the 'E' label
  drawingContext.fillText("E", posX + textOffset, posY);
};

let renderAuxiliaryLine = function (drawingContext, xA, yA, xB, yB, lineIndex) {
  // Define an array of semi-transparent colors for guide lines
  const guideColors = [
    "rgba(255, 0, 0, 0.3)", // Reddish
    "rgba(0, 0, 255, 0.3)", // Bluish
    "rgba(0, 255, 0, 0.3)", // Greenish
    "rgba(255, 255, 0, 0.3)" // Yellowish (added)
  ];

  // Ensure lineIndex is within bounds
  const effectiveIndex = Math.max(0, Math.min(lineIndex - 1, guideColors.length - 1));
  const chosenColor = guideColors[effectiveIndex];

  // Set line width and color
  drawingContext.lineWidth = 1.5; // Slightly thicker than original
  drawingContext.strokeStyle = chosenColor;
  // Draw the actual line segment
  renderSegment(drawingContext, xA, yA, xB, yB);
};

let renderBoundaryBox = function (pathData, calculationParams, drawingContext) {
  // Calculate the bounding rectangle for the given path
  const boundaryRect = pathData.calculateEnclosingBounds(calculationParams);

  // Set drawing style for the bounding box
  drawingContext.lineWidth = 1;
  drawingContext.strokeStyle = "rgb(255, 0, 0)"; // Always red for bounding boxes
  // Draw the rectangular outline
  drawingContext.strokeRect(boundaryRect.originX, boundaryRect.originY, boundaryRect.widthVal, boundaryRect.heightVal);
};

let generateRandomInteger = function (lowerBound, upperBound) {
  // Ensure bounds are integers
  const minVal = Math.ceil(lowerBound);
  const maxVal = Math.floor(upperBound);
  // Generate a random integer within the inclusive range [minVal, maxVal]
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
};

let generateRandomCoordinate = function (xMin, xMax, yMin, yMax) {
  // Returns an object with randomly generated x and y coordinates
  return {
    xCoord: generateRandomInteger(xMin, xMax),
    yCoord: generateRandomInteger(yMin, yMax)
  };
};

const multiSegmentPath = (function () {
  // Helper to add a random path segment to an existing path object
  function appendRandomSegment(currentPathObj, displayConfig) {
    // Determine which type of segment to add randomly
    const segmentType = generateRandomInteger(0, 3); // Now includes an extra case potentially
    const maxWidth = displayConfig.surfaceWidth;
    const maxHeight = displayConfig.surfaceHeight;

    switch (segmentType) {
      case 0: { // Quadratic Bezier
        const qbParams = quadraticBezierModule.generateRandom(displayConfig);
        currentPathObj.addQuadraticBezierSegment(qbParams.controlX, qbParams.controlY, qbParams.targetX, qbParams.targetY);
        break;
      }
      case 1: { // Cubic Bezier
        const cbParams = cubicBezierModule.generateRandom(displayConfig);
        currentPathObj.addCubicBezierSegment(cbParams.cp1x, cbParams.cp1y, cbParams.cp2x, cbParams.cp2y, cbParams.finalX, cbParams.finalY);
        break;
      }
      case 2: { // Straight Line
        const linePoint = generateRandomCoordinate(0, maxWidth, 0, maxHeight);
        currentPathObj.addLineSegment(linePoint.xCoord, linePoint.yCoord);
        break;
      }
      case 3: { // Arc (new addition, might not be fully supported by hypothetical `Fayde.Path.RawPath` equivalent)
        const arcParams = arcModule.generateRandom(displayConfig);
        currentPathObj.addArcSegment(arcParams.centerX, arcParams.centerY, arcParams.radius, arcParams.startAngleRad, arcParams.endAngleRad, arcParams.clockwise);
        break;
      }
      default:
        // Fallback or do nothing if segmentType is unexpected
        console.warn("Unknown segment type generated.");
        break;
    }
  }

  return {
    // Public method to generate a random multi-segment path
    createRandomPath: function (displayConfig) {
      // Assuming a generic path constructor here. Original used Fayde.Path.RawPath.
      // For cloning purposes, we'll use a placeholder `PathConstructor`
      const pathInstance = {
        segments: [],
        moveTo: function(x, y) { this.segments.push({ type: 'M', x, y }); },
        addQuadraticBezierSegment: function(cx, cy, x, y) { this.segments.push({ type: 'Q', cx, cy, x, y }); },
        addCubicBezierSegment: function(c1x, c1y, c2x, c2y, x, y) { this.segments.push({ type: 'C', c1x, c1y, c2x, c2y, x, y }); },
        addLineSegment: function(x, y) { this.segments.push({ type: 'L', x, y }); },
        addArcSegment: function(cx, cy, r, sa, ea, cc) { this.segments.push({ type: 'A', cx, cy, r, sa, ea, cc }); },
        calculateEnclosingBounds: function(params) { /* dummy implementation */ return { originX: 0, originY: 0, widthVal: displayConfig.surfaceWidth, heightVal: displayConfig.surfaceHeight }; }
      };

      // Define an initial starting point for the path
      const startPoint = generateRandomCoordinate(0, displayConfig.surfaceWidth, 0, displayConfig.surfaceHeight);
      pathInstance.moveTo(startPoint.xCoord, startPoint.yCoord);

      // Determine the number of segments for this path
      const segmentCount = generateRandomInteger(3, 8); // Slightly increased max segments

      // Append multiple random segments
      for (let i = 0; i < segmentCount; i++) {
        appendRandomSegment(pathInstance, displayConfig);
      }

      return pathInstance;
    }
  };
})();

const quadraticBezierModule = (function () {
  // Calculates the maxima (extrema) of a quadratic Bezier curve
  function computeQuadMaxima(x1, x2, x3, y1, y2, y3) {
    // Helper function for the quadratic Bezier x(t) or y(t)
    const evaluateCoord = (a, b, c, t) => (a * (1 - t) ** 2) + (2 * b * (1 - t) * t) + (c * t ** 2);

    const maximaPoints = [];

    // Maxima for X-component
    const tX = (x1 - x2) / (x1 - 2 * x2 + x3);
    if (!isNaN(tX) && tX >= 0 && tX <= 1) { // Ensure t is valid
      maximaPoints.push({
        paramT: tX,
        coordX: evaluateCoord(x1, x2, x3, tX),
        coordY: evaluateCoord(y1, y2, y3, tX)
      });
    }

    // Maxima for Y-component
    const tY = (y1 - y2) / (y1 - 2 * y2 + y3);
    if (!isNaN(tY) && tY >= 0 && tY <= 1) { // Ensure t is valid
      maximaPoints.push({
        paramT: tY,
        coordX: evaluateCoord(x1, x2, x3, tY),
        coordY: evaluateCoord(y1, y2, y3, tY)
      });
    }
    return maximaPoints;
  }

  return {
    // Public method to generate random parameters for a quadratic Bezier segment
    generateRandom: function (configParameters) {
      const controlPointX = generateRandomInteger(0, configParameters.surfaceWidth);
      const controlPointY = generateRandomInteger(0, configParameters.surfaceHeight);
      const endPointX = generateRandomInteger(0, configParameters.surfaceWidth);
      const endPointY = generateRandomInteger(0, configParameters.surfaceHeight);

      return {
        controlX: controlPointX,
        controlY: controlPointY,
        targetX: endPointX,
        targetY: endPointY
      };
    },
    // Expose the maxima calculation function
    getCurveMaxima: computeQuadMaxima
  };
})();

const cubicBezierModule = (function () {
  // Calculates the value of a cubic Bezier component (x or y) at parameter t
  const calculateCubicCoord = (p0, p1, p2, p3, t) => {
    const oneMinusT = 1 - t;
    return (p0 * oneMinusT ** 3) + (3 * p1 * t * oneMinusT ** 2) + (3 * p2 * oneMinusT * t ** 2) + (p3 * t ** 3);
  };

  // Finds the t values where the derivative of a cubic Bezier component is zero
  const findDerivativeRoots = (p0, p1, p2, p3) => {
    const a = -p0 + 3 * p1 - 3 * p2 + p3;
    const b = 3 * p0 - 6 * p1 + 3 * p2;
    const c = -3 * p0 + 3 * p1;

    // Quadratic formula for at^2 + bt + c = 0
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return []; // No real roots
    }
    if (discriminant === 0) {
      const t = -b / (2 * a);
      return [t];
    }
    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b + sqrtD) / (2 * a);
    const t2 = (-b - sqrtD) / (2 * a);
    return [t1, t2];
  };

  // Computes the maxima (extrema) points of a cubic Bezier curve
  function computeCubicMaxima(x0, x1, x2, x3, y0, y1, y2, y3) {
    const extremaPoints = [];

    // Helper to create a maxima point object
    const createMaximaEntry = (tVal) => ({
      paramT: tVal,
      coordX: calculateCubicCoord(x0, x1, x2, x3, tVal),
      coordY: calculateCubicCoord(y0, y1, y2, y3, tVal)
    });

    // Find t values for x-extrema
    const tValuesX = findDerivativeRoots(x0, x1, x2, x3);
    for (const t of tValuesX) {
      if (t >= 0 && t <= 1) {
        extremaPoints.push(createMaximaEntry(t));
      }
    }

    // Find t values for y-extrema
    const tValuesY = findDerivativeRoots(y0, y1, y2, y3);
    for (const t of tValuesY) {
      if (t >= 0 && t <= 1) {
        extremaPoints.push(createMaximaEntry(t));
      }
    }

    return extremaPoints;
  }

  return {
    // Public method to generate random parameters for a cubic Bezier segment
    generateRandom: function (drawingConfiguration) {
      const cpOneX = generateRandomInteger(0, drawingConfiguration.surfaceWidth);
      const cpOneY = generateRandomInteger(0, drawingConfiguration.surfaceHeight);
      const cpTwoX = generateRandomInteger(0, drawingConfiguration.surfaceWidth);
      const cpTwoY = generateRandomInteger(0, drawingConfiguration.surfaceHeight);
      const finalX = generateRandomInteger(0, drawingConfiguration.surfaceWidth);
      const finalY = generateRandomInteger(0, drawingConfiguration.surfaceHeight);

      return {
        cp1x: cpOneX,
        cp1y: cpOneY,
        cp2x: cpTwoX,
        cp2y: cpTwoY,
        finalX: finalX,
        finalY: finalY
      };
    },
    // Expose the maxima calculation function
    getCurveExtrema: computeCubicMaxima
  };
})();

const arcToModule = (function () {
  return {
    generateRandom: function (areaConfig) {
      const controlPointX = generateRandomInteger(0, areaConfig.surfaceWidth);
      const controlPointY = generateRandomInteger(0, areaConfig.surfaceHeight);
      const endPointX = generateRandomInteger(0, areaConfig.surfaceWidth);
      const endPointY = generateRandomInteger(0, areaConfig.surfaceHeight);

      // Radius for arcTo, ensuring it's at least a certain size
      const radiusValue = Math.max(15, generateRandomInteger(0, 75)); // Increased max radius

      return {
        cpx: controlPointX,
        cpy: controlPointY,
        ex: endPointX,
        ey: endPointY,
        radius: radiusValue
      };
    }
  };
})();

const arcModule = (function () {
  return {
    generateRandom: function (areaConfig) {
      const centerX = generateRandomInteger(0, areaConfig.surfaceWidth);
      const centerY = generateRandomInteger(0, areaConfig.surfaceHeight);

      // Calculate maximum possible radius to stay within bounds
      const availableSpace = Math.min(
        centerX,
        areaConfig.surfaceWidth - centerX,
        centerY,
        areaConfig.surfaceHeight - centerY
      );
      const actualRadius = Math.max(10, generateRandomInteger(0, availableSpace)); // Ensure min radius

      const fullCircleRadians = Math.PI * 2;
      const startAngleRadians = generateRandomInteger(0, Math.floor(fullCircleRadians * 100)) / 100; // Convert to float
      const endAngleRadians = generateRandomInteger(0, Math.floor(fullCircleRadians * 100)) / 100;
      const isClockwise = (generateRandomInteger(0, 1) === 0); // Boolean

      return {
        centerX: centerX,
        centerY: centerY,
        radius: actualRadius,
        startAngleRad: startAngleRadians,
        endAngleRad: endAngleRadians,
        clockwise: isClockwise
      };
    }
  };
})();

/*
  Original comment:
  export interface IStrokeParameters {
      thickness: number;
      join: Shapes.PenLineJoin;
      startCap: Shapes.PenLineCap;
      endCap: Shapes.PenLineCap;
      miterLimit: number;
  }
  Rewritten comment:
  This module defines a structure for line styling parameters,
  including line width, cap styles for line ends, join styles for corners,
  and the miter limit for sharp joins.
*/
let createRandomLineStyle = function () {
  return {
    lineThickness: generateRandomInteger(2, 40), // Increased max thickness
    lineJoinStyle: generateRandomInteger(0, 2), // Corresponds to miter, bevel, round
    startCapStyle: generateRandomInteger(0, 3), // Corresponds to butt, square, round, triangle (custom)
    endCapStyle: generateRandomInteger(0, 3),
    cornerMiterLimit: 12 // Slightly increased miter limit
  };
};

let applyPathStroke;
let lineStyleToDescription;

(function () {
  // Map numerical values to CanvasRenderingContext2D lineCap strings
  const capStyles = [
    "butt",    // Default flat cap
    "square",  // Square cap extending beyond line end
    "round",   // Round cap
    "butt"     // Triangle (custom, defaulting to butt as canvas doesn't have native triangle)
  ];
  // Map numerical values to CanvasRenderingContext2D lineJoin strings
  const joinStyles = [
    "miter",   // Sharp corners
    "bevel",   // Beveled corners
    "round"    // Rounded corners
  ];

  // Function to apply stroke to a path using provided context and style parameters
  applyPathStroke = function (renderingContext, strokeColor, styleParams) {
    // Guard clause: do nothing if essential parameters are missing
    if (!renderingContext || !strokeColor || !styleParams) {
      console.warn("Missing parameters for applyPathStroke. Skipping stroke application.");
      return;
    }

    // Apply the line styling properties
    renderingContext.lineWidth = styleParams.lineThickness;
    // Prioritize startCapStyle, then endCapStyle, then default to butt
    renderingContext.lineCap = capStyles[styleParams.startCapStyle] || capStyles[styleParams.endCapStyle] || capStyles[0];
    renderingContext.lineJoin = joinStyles[styleParams.lineJoinStyle] || joinStyles[0];
    renderingContext.miterLimit = styleParams.cornerMiterLimit;
    renderingContext.strokeStyle = strokeColor;
    // Perform the actual stroke operation
    renderingContext.stroke();
  };

  // Function to convert line style parameters into a human-readable string description
  lineStyleToDescription = function (styleParams) {
    if (!styleParams) {
      return "No line style defined."; // More descriptive message
    }

    // Retrieve and format individual style components
    const thicknessDesc = `Line Thickness: ${styleParams.lineThickness}px`;
    const startCapText = capStyles[styleParams.startCapStyle] || capStyles[0];
    const endCapText = capStyles[styleParams.endCapStyle] || capStyles[0];
    const joinText = joinStyles[styleParams.lineJoinStyle] || joinStyles[0];
    const miterLimitDesc = `Miter Limit: ${styleParams.cornerMiterLimit}`;

    // Use template literals for cleaner string construction
    return `Style Details: ${thicknessDesc}; Start Cap: ${startCapText}; End Cap: ${endCapText}; Join: ${joinText}; ${miterLimitDesc}`;
  };
})();