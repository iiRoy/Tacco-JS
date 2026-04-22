// This function processes the incoming string data.
function AnalyzeGeometricData( entryString ) {
	let tokenizedInput = entryString.split(" ");
  let primaryDimension = Number(tokenizedInput[0]);
  let secondaryDimension = Number(tokenizedInput[1]);
  let horizontalCoord = Number(tokenizedInput[2]);
  let verticalCoord = Number(tokenizedInput[3]);
  
  let finalOutcome = 0;

  let largestComponentArea = 0;
  let numEqualLargestAreas = 0;

  if ( horizontalCoord === primaryDimension / 2 && verticalCoord === secondaryDimension / 2 ) {
    largestComponentArea = (primaryDimension * secondaryDimension) / 2;
    numEqualLargestAreas = 1;
  }
  else if ( horizontalCoord === primaryDimension || verticalCoord === secondaryDimension || horizontalCoord === primaryDimension / 2 || verticalCoord === secondaryDimension / 2 ) {
    largestComponentArea = (primaryDimension * secondaryDimension) / 2;
  }
  else if ( (horizontalCoord / verticalCoord) === (primaryDimension / secondaryDimension) || ((horizontalCoord / verticalCoord) * horizontalCoord + verticalCoord) === secondaryDimension ) {
    largestComponentArea = (primaryDimension * secondaryDimension) / 2;
    numEqualLargestAreas = 1;
  }
  else {
    let adjustedXLength = verticalCoord / horizontalCoord * secondaryDimension;
    let adjustedYLength = horizontalCoord / verticalCoord * primaryDimension;
    let smallRectArea = 0;

    if (adjustedXLength < primaryDimension) {
      smallRectArea = (horizontalCoord - adjustedXLength) * (secondaryDimension - verticalCoord);
    }
    else if (adjustedYLength < secondaryDimension) {
      smallRectArea = (primaryDimension - horizontalCoord) * (verticalCoord - adjustedYLength);
    }

    let firstAreaComponent = (primaryDimension - horizontalCoord) * (secondaryDimension - verticalCoord) / 2 + (horizontalCoord * verticalCoord) + smallRectArea;

    let secondAreaComponent = primaryDimension * secondaryDimension - firstAreaComponent;

    if (firstAreaComponent > secondAreaComponent) {
      largestComponentArea = firstAreaComponent;
    }
    else {
      largestComponentArea = secondAreaComponent;
    }
  }
  finalOutcome = (primaryDimension * secondaryDimension) - largestComponentArea;
  
 	// Display the computed result.
 	console.log(finalOutcome + ' ' + numEqualLargestAreas);
 }
 //* The subsequent line should not be modified (it reads input from standard I/O and invokes the primary function).
 AnalyzeGeometricData(require("fs").readFileSync("/dev/stdin", "utf8"));