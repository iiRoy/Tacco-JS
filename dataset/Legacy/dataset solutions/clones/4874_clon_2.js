'use strict';

// This function processes the raw input data to calculate a specific area.
const processInput = (rawData) => {
  // Split the raw input into individual lines, removing any leading/trailing whitespace.
  const lines = rawData.trim().split('\n');

  // Parse the first line to get the initial width, height, and number of queries.
  // The first line contains three space-separated numbers: W H N
  const initialDimensions = lines[0].split(' ').map((strNum) => Number(strNum));
  let widthVal = initialDimensions[0]; // Initial width of the rectangular area
  let heightVal = initialDimensions[1]; // Initial height of the rectangular area
  let numQueries = initialDimensions[2]; // Number of subsequent query lines

  // Extract X, Y coordinates and query types from the remaining lines.
  // Each subsequent line contains three space-separated numbers: x y a
  const xCoords = lines.slice(1, lines.length).map((lineStr) => Number(lineStr.split(' ')[0]));
  const yCoords = lines.slice(1, lines.length).map((lineStr) => Number(lineStr.split(' ')[1]));
  const queryTypes = lines.slice(1, lines.length).map((lineStr) => Number(lineStr.split(' ')[2]));

  // Initialize the four corner points of the active rectangular area.
  // The coordinates are (minX, minY), (minX, maxY), (maxX, maxY), (maxX, minY)
  // Initially, minX=0, minY=0, maxX=widthVal, maxY=heightVal
  // We use an array of objects to represent these points.
  // For clarity, let's think of them as:
  // boundaryPoints[0] = {x: minX, y: minY} (bottom-left)
  // boundaryPoints[1] = {x: minX, y: maxY} (top-left)
  // boundaryPoints[2] = {x: maxX, y: maxY} (top-right)
  // boundaryPoints[3] = {x: maxX, y: minY} (bottom-right)
  let boundaryPoints = [
    { x: 0, y: 0 },
    { x: 0, y: heightVal },
    { x: widthVal, y: heightVal },
    { x: widthVal, y: 0 },
  ];

  // Iterate through each query to adjust the boundaries of the active area.
  for (let idx = 0; idx < queryTypes.length; idx++) {
    let currentType = queryTypes[idx]; // The type of the current query

    // Apply the boundary adjustment based on the query type.
    // Each query effectively "cuts" a portion of the rectangle.
    switch (currentType) {
      case 1: // Cut from the left: x < x_i. The new minX becomes max(current minX, x_i).
        boundaryPoints[0].x = xCoords[idx] > boundaryPoints[0].x ? xCoords[idx] : boundaryPoints[0].x;
        boundaryPoints[1].x = xCoords[idx] > boundaryPoints[1].x ? xCoords[idx] : boundaryPoints[1].x;
        break;
      case 2: // Cut from the right: x > x_i. The new maxX becomes min(current maxX, x_i).
        boundaryPoints[2].x = xCoords[idx] < boundaryPoints[2].x ? xCoords[idx] : boundaryPoints[2].x;
        boundaryPoints[3].x = xCoords[idx] < boundaryPoints[3].x ? xCoords[idx] : boundaryPoints[3].x;
        break;
      case 3: // Cut from the bottom: y < y_i. The new minY becomes max(current minY, y_i).
        boundaryPoints[0].y = yCoords[idx] > boundaryPoints[0].y ? yCoords[idx] : boundaryPoints[0].y;
        boundaryPoints[3].y = yCoords[idx] > boundaryPoints[3].y ? yCoords[idx] : boundaryPoints[3].y;
        break;
      case 4: // Cut from the top: y > y_i. The new maxY becomes min(current maxY, y_i).
        boundaryPoints[1].y = yCoords[idx] < boundaryPoints[1].y ? yCoords[idx] : boundaryPoints[1].y;
        boundaryPoints[2].y = yCoords[idx] < boundaryPoints[2].y ? yCoords[idx] : boundaryPoints[2].y;
        break;
    }
  }

  // Calculate the final area of the remaining rectangle.
  // The width is boundaryPoints[2].x - boundaryPoints[0].x (maxX - minX)
  // The height is boundaryPoints[1].y - boundaryPoints[0].y (maxY - minY)
  // Note: The original code uses (corners[0].x - corners[2].x) * (corners[0].y - corners[1].y)
  // which is (minX - maxX) * (minY - maxY). This will result in a positive area if minX < maxX and minY < maxY.
  // If minX > maxX or minY > maxY, the area would be negative, indicating no valid rectangle.
  const areaResult = (boundaryPoints[2].x - boundaryPoints[0].x) * (boundaryPoints[2].y - boundaryPoints[0].y);

  // Output the calculated area. If the area is negative (meaning the rectangle has collapsed or inverted),
  // output 0 as there is no valid positive area.
  console.log(areaResult > 0 ? areaResult : 0);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
