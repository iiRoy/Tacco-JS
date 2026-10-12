var processInput = (inputLines) => {
  // Parse the first line of input to extract dimensions and coordinates
  let parsedData = inputLines[0].split(" ");

  // Extract width, height, and coordinates, converting them to numbers
  let widthVal = parsedData[0] - 0;
  let heightVal = parsedData[1] - 0;
  let xCoord = parsedData[2] - 0;
  let yCoord = parsedData[3] - 0;

  // Calculate the minimum area when cutting vertically
  // This represents the area of the smaller rectangle formed by a vertical cut at xCoord
  let verticalArea = Math.min((xCoord * heightVal), ((widthVal - xCoord) * heightVal));

  // Calculate the minimum area when cutting horizontally
  // This represents the area of the smaller rectangle formed by a horizontal cut at yCoord
  let horizontalArea = Math.min((yCoord * widthVal), ((heightVal - yCoord) * widthVal));

  // Check if the two minimum areas are equal
  if (verticalArea === horizontalArea) {
    // If both minimum areas are zero, it implies a cut along an edge,
    // so the maximum area is half the total area, and there's only one way to achieve it.
    if (horizontalArea === 0) {
      console.log(heightVal * widthVal / 2 + " " + "0");
    } else {
      // If they are equal and non-zero, output one of the areas and indicate one way.
      console.log(horizontalArea + " " + "1");
    }
  } else {
    // If the minimum areas are not equal, find the maximum of the two
    let resultValue = Math.max(horizontalArea, verticalArea);

    // If the maximum area is exactly half of the total rectangle area,
    // it means there's only one way to achieve this maximum area.
    if (resultValue === (widthVal * heightVal / 2)) {
      console.log(resultValue + " " + "1");
    } else {
      // Otherwise, output the maximum area and indicate zero ways (meaning it's not exactly half).
      console.log(resultValue + " " + "0");
    }
  }
};

// Read input from stdin, decode as UTF-8, trim whitespace, and split into lines
processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
