var InputDataProcessor=(function(){
  // Factory function to create an instance of the data reader.
  function createReaderInstance(sourceText){
    return new DataReader(sourceText);
  }

  // Class constructor for handling input data lines.
  function DataReader(sourceText){
    // Internal storage for all lines from the source text, trimmed and split.
    this._sourceContentLines = sourceText.trim().split("\n");
    // Pointer to the current line being processed.
    this._currentLinePointer = 0;
  }

  // Prototype method to fetch the next numeric value from the current line.
  // Lines are processed word by word from left to right.
  DataReader.prototype.fetchNextNumericValue=function(shouldReturnAsString=false){
    const lines = this._sourceContentLines;
    let currentLineIdx = this._currentLinePointer;

    // Guard clause: Check if we've run out of lines.
    if(currentLineIdx >= lines.length){
      console.warn("Attempted to read past the end of input data.");
      return shouldReturnAsString ? "" : NaN;
    }

    // If the current line hasn't been split into individual values yet, do so.
    // We're changing the original array element in place.
    if(typeof lines[currentLineIdx] === "string"){
      lines[currentLineIdx] = lines[currentLineIdx].split(" ");
    }

    const currentLineValues = lines[currentLineIdx];
    let retrievedValue;

    // Guard clause: Check if the current line is empty after splitting.
    if(currentLineValues.length === 0){
      this._currentLinePointer++; // Move to the next line if current is empty
      return this.fetchNextNumericValue(shouldReturnAsString); // Try reading from next line
    }

    // Extract the first value from the current line's array.
    retrievedValue = currentLineValues.shift();

    // If the line becomes empty after shifting, advance the line pointer.
    if(currentLineValues.length === 0){
      this._currentLinePointer++;
    }

    // Return the value either as a string or converted to a number.
    return shouldReturnAsString ? retrievedValue : Number(retrievedValue);
  };

  // Prototype method to read an entire line and return its values as numbers.
  DataReader.prototype.readEntireLineAsNumbers=function(shouldReturnAsStringArray=false){
    const lines = this._sourceContentLines;
    let currentLineIdx = this._currentLinePointer++; // Advance line pointer immediately

    // Guard clause: Check if line index is out of bounds.
    if(currentLineIdx >= lines.length){
      console.warn("Attempted to read line past end of input data.");
      return [];
    }

    const lineValues = String(lines[currentLineIdx]).split(" ");
    return shouldReturnAsStringArray ? lineValues : lineValues.map(val => Number(val));
  };

  // Prototype method to read 'count' lines as a matrix of numbers.
  DataReader.prototype.readMatrixOfNumbers=function(count, shouldReturnAsStringMatrix=false){
    const lines = this._sourceContentLines;
    const startLine = this._currentLinePointer;
    this._currentLinePointer += count; // Advance line pointer by 'count'

    // Guard clause: Ensure we don't read beyond available lines.
    if(startLine + count > lines.length){
      console.error(`Requested ${count} lines for matrix, but only ${lines.length - startLine} available.`);
      return [];
    }

    const matrixRows = lines.slice(startLine, this._currentLinePointer).map(line => String(line).split(" "));
    return shouldReturnAsStringMatrix ? matrixRows : matrixRows.map(row => row.map(val => Number(val)));
  };

  // Prototype method to read 'count' raw lines, converting each to a number.
  DataReader.prototype.readRawLinesAsNumbers=function(count, shouldReturnAsStringArray=false){
    const lines = this._sourceContentLines;
    const startLine = this._currentLinePointer;
    this._currentLinePointer += count; // Advance line pointer by 'count'

    // Guard clause: Ensure we don't read beyond available lines.
    if(startLine + count > lines.length){
      console.error(`Requested ${count} raw lines, but only ${lines.length - startLine} available.`);
      return [];
    }

    const rawData = lines.slice(startLine, this._currentLinePointer);
    return shouldReturnAsStringArray ? rawData : rawData.map(val => Number(val));
  };

  // Prototype method to check if there are more lines to read.
  DataReader.prototype.hasMoreLines = function() {
    return this._currentLinePointer < this._sourceContentLines.length;
  };

  return createReaderInstance;
})();

// Initialize the input data handler by reading from standard input.
const dataInputHandler = InputDataProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

// Global arrays to store processed point data.
let totalPointsCount;
const pointXCoords = [];
const pointYCoords = [];
const pointAngularPositions = []; // Stores angles in degrees for each point.

// Configuration for the simulation.
const simulationSteps = 10000;
const DEGREES_IN_CIRCLE = 360.0;
const HALF_VIEW_ANGLE = 90.0; // Corresponds to a 180-degree viewing window.

// Output the result of the main calculation.
console.log(calculateMaxVectorMagnitude());

/**
 * Main function to perform the vector summation simulation.
 * It reads point coordinates, filters out (0,0), calculates their angles,
 * then simulates a rotating 180-degree view to find the maximum possible
 * magnitude of the sum of visible vectors.
 * @returns {number} The maximum magnitude found.
 */
function calculateMaxVectorMagnitude(){
  // Read the initial count of points.
  totalPointsCount = dataInputHandler.fetchNextNumericValue();

  const rawPointsData = []; // Temporarily store points before filtering.

  // Read all points and filter out (0,0) coordinates.
  for(let i = 0; i < totalPointsCount; ++i){
    const currentX = dataInputHandler.fetchNextNumericValue();
    const currentY = dataInputHandler.fetchNextNumericValue();

    // Only consider points that are not at the origin (0,0).
    if(currentX !== 0 || currentY !== 0){
      rawPointsData.push({ x: currentX, y: currentY });
    }
  }

  // Update the total points count based on valid points.
  totalPointsCount = rawPointsData.length;

  // If no valid points remain, the magnitude is 0.
  if(totalPointsCount === 0){
    return 0;
  }

  // Populate the global coordinate and angle arrays from the filtered data.
  for(const point of rawPointsData){
    pointXCoords.push(point.x);
    pointYCoords.push(point.y);
    pointAngularPositions.push(calculatePolarAngleInDegrees(point.x, point.y));
  }

  let maxSquaredMagnitude = 0; // Stores the maximum squared magnitude found.

  // Simulate rotations to find the optimal viewing angle.
  for(let stepIdx = 0; stepIdx < simulationSteps; ++stepIdx){
    // Calculate the center angle of the current 180-degree viewing window.
    // The +0.5 ensures the angle is at the center of each step interval.
    const currentRotationAngle = (stepIdx + 0.5) / simulationSteps * DEGREES_IN_CIRCLE;

    let currentSumX = 0; // Sum of X components for visible vectors.
    let currentSumY = 0; // Sum of Y components for visible vectors.

    // Iterate through all valid points to determine visibility and sum vectors.
    for(let pointIdx = 0; pointIdx < totalPointsCount; ++pointIdx){
      const pointAngle = pointAngularPositions[pointIdx];

      // Calculate the difference between the point's angle and the current view angle.
      let angleDifference = pointAngle - currentRotationAngle;

      // Normalize the angle difference to be within (-180, 180] degrees.
      // This correctly handles wrap-around cases (e.g., 350 vs 10 degrees).
      angleDifference = (angleDifference + DEGREES_IN_CIRCLE * 1.5) % DEGREES_IN_CIRCLE - DEGREES_IN_CIRCLE / 2;

      // If the absolute angle difference is less than the half view angle (90 degrees),
      // the point is within the 180-degree viewing window.
      if(Math.abs(angleDifference) < HALF_VIEW_ANGLE){
        currentSumX += pointXCoords[pointIdx];
        currentSumY += pointYCoords[pointIdx];
      }
    }

    // Calculate the squared magnitude of the summed vector for the current rotation.
    const currentSquaredMagnitude = currentSumX * currentSumX + currentSumY * currentSumY;

    // Update the maximum squared magnitude if the current one is larger.
    if(currentSquaredMagnitude > maxSquaredMagnitude){
      maxSquaredMagnitude = currentSquaredMagnitude;
    }
  }

  // The problem asks for the magnitude, so take the square root of the maximum squared magnitude.
  return Math.sqrt(maxSquaredMagnitude);
}

/**
 * Calculates the polar angle of a point (x, y) in degrees, normalized to [0, 360).
 * Uses Math.atan2 for robust quadrant handling.
 * @param {number} inputX - The X coordinate of the point.
 * @param {number} inputY - The Y coordinate of the point.
 * @returns {number} The angle in degrees.
 * @throws {Error} If the angle calculation results in an invalid number.
 */
function calculatePolarAngleInDegrees(inputX, inputY){
  // Math.atan2(y, x) correctly handles all quadrants and axis cases, returning radians in [-PI, PI].
  let radians = Math.atan2(inputY, inputX);
  // Convert radians to degrees.
  let degrees = radians * (180 / Math.PI);

  // Normalize the angle to be within the [0, 360) range.
  if(degrees < 0){
    degrees += DEGREES_IN_CIRCLE;
  }

  // Basic validation for the resulting angle.
  if(isNaN(degrees) || degrees < 0 || degrees >= DEGREES_IN_CIRCLE){
    throw new Error(`Angle calculation resulted in an invalid value: ${degrees} for (${inputX}, ${inputY}).`);
  }

  return degrees;
}