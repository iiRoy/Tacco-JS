var multiplication_lookup = [
  512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
  454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
  482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
  437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
  497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
  320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
  446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
  329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
  505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
  399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
  324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
  268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
  451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
  385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
  332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
  289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
];

var shift_guide_values = [
  9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
  17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
  19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
  20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
];

// Helper class for pixel component storage
function PixelComponentNode() {
  this.redVal = 0;
  this.greenVal = 0;
  this.blueVal = 0;
  this.alphaVal = 0;
  this.nextNode = null;
}

function applyImageSoftness( sourceElementId, targetCanvasId, blurMagnitude, processAlphaLayer ) {
  // Retrieve the source image element
  var sourceImage = document.getElementById( sourceElementId );
  var imgWidth = sourceImage.naturalWidth;
  var imgHeight = sourceImage.naturalHeight;

  // Obtain the canvas for output
  var outputCanvas = document.getElementById( targetCanvasId );

  // Adjust canvas dimensions to match the image
  outputCanvas.style.width = imgWidth + "px";
  outputCanvas.style.height = imgHeight + "px";
  outputCanvas.width = imgWidth;
  outputCanvas.height = imgHeight;

  // Get the 2D rendering context
  var canvasContext = outputCanvas.getContext("2d");
  canvasContext.clearRect(0, 0, imgWidth, imgHeight); // Clear the canvas area
  canvasContext.drawImage(sourceImage, 0, 0); // Draw the image onto the canvas

  // Validate the blur magnitude
  if ( Number.isNaN(blurMagnitude) || blurMagnitude < 1 ) return;

  // Apply the appropriate blur function based on alpha channel preference
  if ( processAlphaLayer ) {
    processCanvasRGBA( targetCanvasId, 0, 0, imgWidth, imgHeight, blurMagnitude );
  } else {
    processCanvasRGB( targetCanvasId, 0, 0, imgWidth, imgHeight, blurMagnitude );
  }
}

function processCanvasRGBA( canvasIdentifier, startCoordX, startCoordY, regionWidth, regionHeight, spreadValue ) {
  // Ensure the spread value is valid and integer
  if ( Number.isNaN(spreadValue) || spreadValue < 1 ) return;
  spreadValue |= 0;

  var canvasRef = document.getElementById( canvasIdentifier );
  var drawingContext = canvasRef.getContext("2d");
  var pixelData;

  try {
    try {
      pixelData = drawingContext.getImageData( startCoordX, startCoordY, regionWidth, regionHeight );
    } catch (errorA) {
      // Handle potential security errors for local files
      try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        pixelData = drawingContext.getImageData( startCoordX, startCoordY, regionWidth, regionHeight );
      } catch (errorB) {
        window.alert("Cannot access local image for processing.");
        throw new Error("Failed to access local image data: " + errorB);
        // return; // This return is unreachable due to the throw
      }
    }
  } catch (errorC) {
    window.alert("Unable to access image data.");
    throw new Error("Failed to obtain image data: " + errorC);
  }

  var pixelArray = pixelData.data;

  // Declare all processing variables
  var colIndex, rowIndex, loopCounter, pixelOffset, prevRowPixelIndex, currentPixelIndex, currentYOffset,
      redAccum, greenAccum, blueAccum, alphaAccum,
      redOutflow, greenOutflow, blueOutflow, alphaOutflow,
      redInflow, greenInflow, blueInflow, alphaInflow,
      pixelRed, pixelGreen, pixelBlue, pixelAlpha, decayFactor;

  var kernelSize = spreadValue + spreadValue + 1;
  var widthTimesFour = regionWidth << 2;
  var lastColumnIndex = regionWidth - 1;
  var lastRowIndex = regionHeight - 1;
  var spreadPlusOne = spreadValue + 1;
  var weightSum = spreadPlusOne * ( spreadPlusOne + 1 ) / 2;

  // Initialize the linked list for stack blur
  var firstNode = new PixelComponentNode();
  var currentNode = firstNode;
  for ( loopCounter = 1; loopCounter < kernelSize; loopCounter++ ) {
    currentNode = currentNode.nextNode = new PixelComponentNode();
    if ( loopCounter === spreadPlusOne ) var finalNode = currentNode;
  }
  currentNode.nextNode = firstNode;
  var inputNode = null;
  var outputNode = null;

  currentYOffset = currentPixelIndex = 0;

  var currentMultiplier = multiplication_lookup[spreadValue];
  var currentShift = shift_guide_values[spreadValue];

  // Process rows horizontally
  for ( rowIndex = 0; rowIndex < regionHeight; rowIndex++ ) {
    redInflow = greenInflow = blueInflow = alphaInflow = redAccum = greenAccum = blueAccum = alphaAccum = 0;

    redOutflow = spreadPlusOne * ( pixelRed = pixelArray[currentPixelIndex] );
    greenOutflow = spreadPlusOne * ( pixelGreen = pixelArray[currentPixelIndex+1] );
    blueOutflow = spreadPlusOne * ( pixelBlue = pixelArray[currentPixelIndex+2] );
    alphaOutflow = spreadPlusOne * ( pixelAlpha = pixelArray[currentPixelIndex+3] );

    redAccum += weightSum * pixelRed;
    greenAccum += weightSum * pixelGreen;
    blueAccum += weightSum * pixelBlue;
    alphaAccum += weightSum * pixelAlpha;

    currentNode = firstNode;

    for ( loopCounter = 0; loopCounter < spreadPlusOne; loopCounter++ ) {
      currentNode.redVal = pixelRed;
      currentNode.greenVal = pixelGreen;
      currentNode.blueVal = pixelBlue;
      currentNode.alphaVal = pixelAlpha;
      currentNode = currentNode.nextNode;
    }

    for ( loopCounter = 1; loopCounter < spreadPlusOne; loopCounter++ ) {
      pixelOffset = currentPixelIndex + (( lastColumnIndex < loopCounter ? lastColumnIndex : loopCounter ) << 2 );
      redAccum += ( currentNode.redVal = ( pixelRed = pixelArray[pixelOffset])) * ( decayFactor = spreadPlusOne - loopCounter );
      greenAccum += ( currentNode.greenVal = ( pixelGreen = pixelArray[pixelOffset+1])) * decayFactor;
      blueAccum += ( currentNode.blueVal = ( pixelBlue = pixelArray[pixelOffset+2])) * decayFactor;
      alphaAccum += ( currentNode.alphaVal = ( pixelAlpha = pixelArray[pixelOffset+3])) * decayFactor;

      redInflow += pixelRed;
      greenInflow += pixelGreen;
      blueInflow += pixelBlue;
      alphaInflow += pixelAlpha;

      currentNode = currentNode.nextNode;
    }

    inputNode = firstNode;
    outputNode = finalNode;
    for ( colIndex = 0; colIndex < regionWidth; colIndex++ ) {
      pixelArray[currentPixelIndex+3] = pixelAlpha = (alphaAccum * currentMultiplier) >> currentShift;
      if ( pixelAlpha !== 0 ) {
        pixelAlpha = 255 / pixelAlpha;
        pixelArray[currentPixelIndex] = ((redAccum * currentMultiplier) >> currentShift) * pixelAlpha;
        pixelArray[currentPixelIndex+1] = ((greenAccum * currentMultiplier) >> currentShift) * pixelAlpha;
        pixelArray[currentPixelIndex+2] = ((blueAccum * currentMultiplier) >> currentShift) * pixelAlpha;
      } else {
        pixelArray[currentPixelIndex] = pixelArray[currentPixelIndex+1] = pixelArray[currentPixelIndex+2] = 0;
      }

      redAccum -= redOutflow;
      greenAccum -= greenOutflow;
      blueAccum -= blueOutflow;
      alphaAccum -= alphaOutflow;

      redOutflow -= inputNode.redVal;
      greenOutflow -= inputNode.greenVal;
      blueOutflow -= inputNode.blueVal;
      alphaOutflow -= inputNode.alphaVal;

      pixelOffset = ( currentYOffset + ( ( pixelOffset = colIndex + spreadValue + 1 ) < lastColumnIndex ? pixelOffset : lastColumnIndex ) ) << 2;

      redInflow += ( inputNode.redVal = pixelArray[pixelOffset]);
      greenInflow += ( inputNode.greenVal = pixelArray[pixelOffset+1]);
      blueInflow += ( inputNode.blueVal = pixelArray[pixelOffset+2]);
      alphaInflow += ( inputNode.alphaVal = pixelArray[pixelOffset+3]);

      redAccum += redInflow;
      greenAccum += greenInflow;
      blueAccum += blueInflow;
      alphaAccum += alphaInflow;

      inputNode = inputNode.nextNode;

      redOutflow += ( pixelRed = outputNode.redVal );
      greenOutflow += ( pixelGreen = outputNode.greenVal );
      blueOutflow += ( pixelBlue = outputNode.blueVal );
      alphaOutflow += ( pixelAlpha = outputNode.alphaVal );

      redInflow -= pixelRed;
      greenInflow -= pixelGreen;
      blueInflow -= pixelBlue;
      alphaInflow -= pixelAlpha;

      outputNode = outputNode.nextNode;

      currentPixelIndex += 4;
    }
    currentYOffset += regionWidth;
  }

  // Process columns vertically
  for ( colIndex = 0; colIndex < regionWidth; colIndex++ ) {
    greenInflow = blueInflow = alphaInflow = redInflow = greenAccum = blueAccum = alphaAccum = redAccum = 0;

    currentPixelIndex = colIndex << 2;
    redOutflow = spreadPlusOne * ( pixelRed = pixelArray[currentPixelIndex]);
    greenOutflow = spreadPlusOne * ( pixelGreen = pixelArray[currentPixelIndex+1]);
    blueOutflow = spreadPlusOne * ( pixelBlue = pixelArray[currentPixelIndex+2]);
    alphaOutflow = spreadPlusOne * ( pixelAlpha = pixelArray[currentPixelIndex+3]);

    redAccum += weightSum * pixelRed;
    greenAccum += weightSum * pixelGreen;
    blueAccum += weightSum * pixelBlue;
    alphaAccum += weightSum * pixelAlpha;

    currentNode = firstNode;

    for ( loopCounter = 0; loopCounter < spreadPlusOne; loopCounter++ ) {
      currentNode.redVal = pixelRed;
      currentNode.greenVal = pixelGreen;
      currentNode.blueVal = pixelBlue;
      currentNode.alphaVal = pixelAlpha;
      currentNode = currentNode.nextNode;
    }

    prevRowPixelIndex = regionWidth;

    for ( loopCounter = 1; loopCounter <= spreadValue; loopCounter++ ) {
      currentPixelIndex = ( prevRowPixelIndex + colIndex ) << 2;

      redAccum += ( currentNode.redVal = ( pixelRed = pixelArray[currentPixelIndex])) * ( decayFactor = spreadPlusOne - loopCounter );
      greenAccum += ( currentNode.greenVal = ( pixelGreen = pixelArray[currentPixelIndex+1])) * decayFactor;
      blueAccum += ( currentNode.blueVal = ( pixelBlue = pixelArray[currentPixelIndex+2])) * decayFactor;
      alphaAccum += ( currentNode.alphaVal = ( pixelAlpha = pixelArray[currentPixelIndex+3])) * decayFactor;

      redInflow += pixelRed;
      greenInflow += pixelGreen;
      blueInflow += pixelBlue;
      alphaInflow += pixelAlpha;

      currentNode = currentNode.nextNode;

      if ( loopCounter < lastRowIndex ) {
        prevRowPixelIndex += regionWidth;
      }
    }

    currentPixelIndex = colIndex;
    inputNode = firstNode;
    outputNode = finalNode;
    for ( rowIndex = 0; rowIndex < regionHeight; rowIndex++ ) {
      pixelOffset = currentPixelIndex << 2;
      pixelArray[pixelOffset+3] = pixelAlpha = (alphaAccum * currentMultiplier) >> currentShift;
      if ( pixelAlpha > 0 ) {
        pixelAlpha = 255 / pixelAlpha;
        pixelArray[pixelOffset] = ((redAccum * currentMultiplier) >> currentShift ) * pixelAlpha;
        pixelArray[pixelOffset+1] = ((greenAccum * currentMultiplier) >> currentShift ) * pixelAlpha;
        pixelArray[pixelOffset+2] = ((blueAccum * currentMultiplier) >> currentShift ) * pixelAlpha;
      } else {
        pixelArray[pixelOffset] = pixelArray[pixelOffset+1] = pixelArray[pixelOffset+2] = 0;
      }

      redAccum -= redOutflow;
      greenAccum -= greenOutflow;
      blueAccum -= blueOutflow;
      alphaAccum -= alphaOutflow;

      redOutflow -= inputNode.redVal;
      greenOutflow -= inputNode.greenVal;
      blueOutflow -= inputNode.blueVal;
      alphaOutflow -= inputNode.alphaVal;

      pixelOffset = ( colIndex + (( ( pixelOffset = rowIndex + spreadPlusOne) < lastRowIndex ? pixelOffset : lastRowIndex ) * regionWidth )) << 2;

      redAccum += ( redInflow += ( inputNode.redVal = pixelArray[pixelOffset]));
      greenAccum += ( greenInflow += ( inputNode.greenVal = pixelArray[pixelOffset+1]));
      blueAccum += ( blueInflow += ( inputNode.blueVal = pixelArray[pixelOffset+2]));
      alphaAccum += ( alphaInflow += ( inputNode.alphaVal = pixelArray[pixelOffset+3]));

      inputNode = inputNode.nextNode;

      redOutflow += ( pixelRed = outputNode.redVal );
      greenOutflow += ( pixelGreen = outputNode.greenVal );
      blueOutflow += ( pixelBlue = outputNode.blueVal );
      alphaOutflow += ( pixelAlpha = outputNode.alphaVal );

      redInflow -= pixelRed;
      greenInflow -= pixelGreen;
      blueInflow -= pixelBlue;
      alphaInflow -= pixelAlpha;

      outputNode = outputNode.nextNode;

      currentPixelIndex += regionWidth;
    }
  }

  drawingContext.putImageData( pixelData, startCoordX, startCoordY );
}


function processCanvasRGB( canvasIdentifier, startCoordX, startCoordY, regionWidth, regionHeight, spreadValue ) {
  // Validate and normalize the spread value
  if ( Number.isNaN(spreadValue) || spreadValue < 1 ) return;
  spreadValue |= 0;

  var canvasRef = document.getElementById( canvasIdentifier );
  var drawingContext = canvasRef.getContext("2d");
  var pixelData;

  try {
    try {
      pixelData = drawingContext.getImageData( startCoordX, startCoordY, regionWidth, regionHeight );
    } catch (errorA) {
      // This block is for handling local file access; it might not be needed in all contexts.
      try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        pixelData = drawingContext.getImageData( startCoordX, startCoordY, regionWidth, regionHeight );
      } catch (errorB) {
        window.alert("Cannot access local image for processing.");
        throw new Error("Failed to access local image data: " + errorB);
        // return; // Unreachable
      }
    }
  } catch (errorC) {
    window.alert("Unable to access image data.");
    throw new Error("Failed to obtain image data: " + errorC);
  }

  var pixelArray = pixelData.data;

  // Declare all processing variables
  var colIndex, rowIndex, loopCounter, pixelOffset, prevRowPixelIndex, currentPixelIndex, currentYOffset,
      redTotal, greenTotal, blueTotal,
      redExitSum, greenExitSum, blueExitSum,
      redEnterSum, greenEnterSum, blueEnterSum,
      currentRed, currentGreen, currentBlue, decayFactor;

  var kernelSize = spreadValue + spreadValue + 1;
  var widthTimesFour = regionWidth << 2;
  var lastColumnIndex = regionWidth - 1;
  var lastRowIndex = regionHeight - 1;
  var spreadPlusOne = spreadValue + 1;
  var weightSum = spreadPlusOne * ( spreadPlusOne + 1 ) / 2;

  // Initialize the linked list for stack blur
  var firstNode = new PixelComponentNode();
  var currentNode = firstNode;
  for ( loopCounter = 1; loopCounter < kernelSize; loopCounter++ ) {
    currentNode = currentNode.nextNode = new PixelComponentNode();
    if ( loopCounter === spreadPlusOne ) var finalNode = currentNode;
  }
  currentNode.nextNode = firstNode;
  var inputNode = null;
  var outputNode = null;

  currentYOffset = currentPixelIndex = 0;

  var currentMultiplier = multiplication_lookup[spreadValue];
  var currentShift = shift_guide_values[spreadValue];

  // Process rows horizontally
  for ( rowIndex = 0; rowIndex < regionHeight; rowIndex++ ) {
    redEnterSum = greenEnterSum = blueEnterSum = redTotal = greenTotal = blueTotal = 0;

    redExitSum = spreadPlusOne * ( currentRed = pixelArray[currentPixelIndex] );
    greenExitSum = spreadPlusOne * ( currentGreen = pixelArray[currentPixelIndex+1] );
    blueExitSum = spreadPlusOne * ( currentBlue = pixelArray[currentPixelIndex+2] );

    redTotal += weightSum * currentRed;
    greenTotal += weightSum * currentGreen;
    blueTotal += weightSum * currentBlue;

    currentNode = firstNode;

    for ( loopCounter = 0; loopCounter < spreadPlusOne; loopCounter++ ) {
      currentNode.redVal = currentRed;
      currentNode.greenVal = currentGreen;
      currentNode.blueVal = currentBlue;
      currentNode = currentNode.nextNode;
    }

    for ( loopCounter = 1; loopCounter < spreadPlusOne; loopCounter++ ) {
      pixelOffset = currentPixelIndex + (( lastColumnIndex < loopCounter ? lastColumnIndex : loopCounter ) << 2 );
      redTotal += ( currentNode.redVal = ( currentRed = pixelArray[pixelOffset])) * ( decayFactor = spreadPlusOne - loopCounter );
      greenTotal += ( currentNode.greenVal = ( currentGreen = pixelArray[pixelOffset+1])) * decayFactor;
      blueTotal += ( currentNode.blueVal = ( currentBlue = pixelArray[pixelOffset+2])) * decayFactor;

      redEnterSum += currentRed;
      greenEnterSum += currentGreen;
      blueEnterSum += currentBlue;

      currentNode = currentNode.nextNode;
    }

    inputNode = firstNode;
    outputNode = finalNode;
    for ( colIndex = 0; colIndex < regionWidth; colIndex++ ) {
      pixelArray[currentPixelIndex] = (redTotal * currentMultiplier) >> currentShift;
      pixelArray[currentPixelIndex+1] = (greenTotal * currentMultiplier) >> currentShift;
      pixelArray[currentPixelIndex+2] = (blueTotal * currentMultiplier) >> currentShift;

      redTotal -= redExitSum;
      greenTotal -= greenExitSum;
      blueTotal -= blueExitSum;

      redExitSum -= inputNode.redVal;
      greenExitSum -= inputNode.greenVal;
      blueExitSum -= inputNode.blueVal;

      pixelOffset = ( currentYOffset + ( ( pixelOffset = colIndex + spreadValue + 1 ) < lastColumnIndex ? pixelOffset : lastColumnIndex ) ) << 2;

      redEnterSum += ( inputNode.redVal = pixelArray[pixelOffset]);
      greenEnterSum += ( inputNode.greenVal = pixelArray[pixelOffset+1]);
      blueEnterSum += ( inputNode.blueVal = pixelArray[pixelOffset+2]);

      redTotal += redEnterSum;
      greenTotal += greenEnterSum;
      blueTotal += blueEnterSum;

      inputNode = inputNode.nextNode;

      redExitSum += ( currentRed = outputNode.redVal );
      greenExitSum += ( currentGreen = outputNode.greenVal );
      blueExitSum += ( currentBlue = outputNode.blueVal );
    }
}