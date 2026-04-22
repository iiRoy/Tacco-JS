/*
 * This module provides a flexible input parsing utility.
 * It is designed to read various formats from a multi-line string input.
 */
var DATA_PARSER=(function()
{
  // The main factory function to create an input handler.
  function createInputHandler(sourceString)
  {
    return new InputHandler(sourceString);
  }

  /*
   * Constructor for the InputHandler object.
   * Initializes the internal state for parsing.
   */
  function InputHandler(rawText)
  {
    this._lines = rawText.trim().split("\n"); // Store lines as an array
    this._currentLineIndex = 0;              // Pointer to the current line being processed
  }

  // Prototype methods for InputHandler
  InputHandler.prototype.readSingleValue=function(keepAsString)
  {
    var currentLines = this._lines,
        pointer = this._currentLineIndex,
        extractedValue;

    // If the current line hasn't been split into tokens yet, do it now.
    // Tokens are processed in reverse order for easy popping.
    if (typeof currentLines[pointer] === "string")
      currentLines[pointer] = currentLines[pointer].split(" ").reverse();

    // Extract the last token from the current line.
    extractedValue = currentLines[pointer].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLines[pointer].length)
      this._currentLineIndex++;

    // Return the value, either as string or number based on the flag.
    return keepAsString ? extractedValue : +extractedValue;
  };

  InputHandler.prototype.readLineValues=function(keepAsString)
  {
    // Retrieve and split the current line, then advance the line pointer.
    var lineContent = this._lines[this._currentLineIndex++].split(" ");

    // Return values as strings or convert them to numbers.
    return keepAsString ? lineContent : lineContent.map(token=>+token);
  };

  InputHandler.prototype.readMatrix=function(numRows, keepAsString)
  {
    // Extract a slice of lines to form the matrix.
    // Advance the line pointer by the number of rows read.
    var matrixData = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                .map(rowString=>rowString.split(" "));

    // If numbers are required, convert all cell values.
    return keepAsString ? matrixData : matrixData.map(rowContent=>rowContent.map(cellValue=>+cellValue));
  };

  InputHandler.prototype.readRawLines=function(numToExtract, keepAsString)
  {
    // Extract a specified number of raw lines.
    // Advance the line pointer.
    var extractedLines = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numToExtract);

    // Return lines as strings or convert each line to a number.
    return keepAsString ? extractedLines : extractedLines.map(lineItem=>+lineItem);
  };

  return createInputHandler; // Return the factory function
})();

// Create an input reader instance by reading from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

/*
 * Utility function to create a multi-dimensional array with a default value.
 * Arguments are the dimensions, followed by the initial value.
 * Example: createMultiDimArray(2, 3, 0) -> [[0,0,0],[0,0,0]]
 */
function createMultiDimArray(initialValue)
{
  var argsList = arguments,
      arrayLength = argsList.length,
      arrayCreationString = "Array(argsList["+--arrayLength+"]).fill(0).map(itemPlaceholder=>{return "+initialValue+";})";

  while (--arrayLength)
    arrayCreationString = "Array(argsList["+arrayLength+"]).fill(0).map(itemPlaceholder=>"+arrayCreationString+")";

  return eval(arrayCreationString);
}

// Global variables for problem state
var stepCount, targetX, targetY, currentX=0, currentY=0;

// Output the result of the main processing function.
console.log(processSolution());

/*
 * The main function that orchestrates the solution logic.
 * It reads initial parameters, performs calculations, and generates a path.
 */
function processSolution()
{
  // Read initial parameters from the input.
  stepCount = inputReader.readSingleValue();
  targetX = inputReader.readSingleValue();
  targetY = inputReader.readSingleValue();

  // Handle base cases: target is origin or impossible scenarios.
  if (targetX === 0 && targetY === 0)
    return 0; // Already at the target.

  // If total steps are even and Manhattan distance parity is odd, it's impossible.
  if (stepCount % 2 === 0 && (targetX + targetY) % 2)
    return -1; // Cannot reach the target.

  var solutionPath = []; // Stores the sequence of moves.
  var manhattanDist = calculateManhattanDistance(0,0); // Distance from (0,0) to (targetX, targetY).

  // Check if the initial Manhattan distance is not a multiple of 'stepCount'.
  if (manhattanDist % stepCount !== 0)
  {
    // If the remainder's parity is odd, make an initial move.
    if (manhattanDist % stepCount % 2 === 1)
    {
      solutionPath.push(makeMove()); // Perform an initial adjustment move.
    }

    // Calculate a new 'manhattanDist' based on the current position and 'stepCount'.
    manhattanDist = calculateManhattanDistance(currentX,currentY) % stepCount / 2;

    // Adjust 'manhattanDist' if 'stepCount' is even.
    if (stepCount % 2 === 0)
      manhattanDist = stepCount - manhattanDist;

    // Determine the next step based on 'manhattanDist' and target coordinates.
    if (Math.abs(currentX - targetX) >= manhattanDist)
    {
      // Adjust X coordinate.
      if (currentX < targetX)
        currentX += manhattanDist;
      else
        currentX -= manhattanDist;

      // Adjust Y coordinate in the opposite direction.
      if (currentY < targetY)
        currentY -= (stepCount - manhattanDist);
      else
        currentY += (stepCount - manhattanDist);
    }
    else
    {
      // Adjust Y coordinate.
      if (currentY < targetY)
        currentY += manhattanDist;
      else
        currentY -= manhattanDist;

      // Adjust X coordinate in the opposite direction.
      if (currentX < targetX)
        currentX -= (stepCount - manhattanDist);
      else
        currentX += (stepCount - manhattanDist);
    }
    // Record the current position after this complex adjustment.
    solutionPath.push(currentX + " " + currentY);
  }

  // Continue making moves until the current position matches the target.
  while (calculateManhattanDistance(currentX,currentY))
  {
    solutionPath.push(makeMove()); // Add the next move to the path.
  }

  // Log the total number of moves and return the path as a newline-separated string.
  console.log(solutionPath.length);
  return solutionPath.join("\n");
}

/*
 * Calculates the Manhattan distance between current coordinates and target coordinates.
 * @param {number} coordA - The current X coordinate.
 * @param {number} coordB - The current Y coordinate.
 * @returns {number} The Manhattan distance.
 */
function calculateManhattanDistance(coordA, coordB)
{
  return Math.abs(coordA - targetX) + Math.abs(coordB - targetY);
}

/*
 * Determines the sign of the difference between two coordinates.
 * @param {number} startCoord - The starting coordinate.
 * @param {number} endCoord   - The ending coordinate.
 * @returns {number} 1 if start > end, -1 if start < end, 0 if equal.
 */
function getDirectionSign(startCoord, endCoord)
{
  var difference = startCoord - endCoord;
  return difference > 0 ? 1 : difference < 0 ? -1 : 0;
}

/*
 * Performs a single 'stepCount' move towards the target coordinates (targetX, targetY).
 * Updates currentX and currentY and returns the new coordinates as a string.
 */
function makeMove()
{
  var remainingSteps = stepCount; // Steps available for this move.

  // Prioritize moving along the X-axis if not at targetX.
  if (targetX !== currentX)
  {
    if (targetX < currentX)
    {
      // Move left (decrease X)
      if (remainingSteps >= currentX - targetX)
      {
        remainingSteps -= (currentX - targetX);
        currentX = targetX; // Reached targetX
      }
      else
      {
        currentX -= remainingSteps;
        remainingSteps = 0; // All steps used for X-axis movement
      }
    }
    else
    {
      // Move right (increase X)
      if (remainingSteps >= targetX - currentX)
      {
        remainingSteps -= (targetX - currentX);
        currentX = targetX; // Reached targetX
      }
      else
      {
        currentX += remainingSteps;
        remainingSteps = 0; // All steps used for X-axis movement
      }
    }
  }

  // If steps are still remaining, move along the Y-axis.
  if (remainingSteps)
  {
    if (targetY < currentY)
    {
      currentY -= remainingSteps; // Move down (decrease Y)
    }
    else
    {
      currentY += remainingSteps; // Move up (increase Y)
    }
  }
  // Return the new current coordinates as a string.
  return currentX + " " + currentY;
}