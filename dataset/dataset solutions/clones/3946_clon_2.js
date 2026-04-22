'use strict';

function processInput( inputString ) {

  let numericValues = inputString.split('\n')[1].split(' ').map( valueStr => parseFloat(valueStr) );

  const coordinates = [0, ...numericValues, 0];
  const distanceDifferences = [];
  const resultArray = [];

  coordinates.forEach( ( currentCoord, indexPos, allCoordinates ) => {
    if (indexPos < allCoordinates.length - 1) {
      distanceDifferences.push(allCoordinates[indexPos + 1] - allCoordinates[indexPos]);
    }
  });

  const totalAbsoluteDifference = distanceDifferences
                                  .map( diffValue => Math.abs(diffValue) )
                                  .reduce( ( accumulator, current ) => accumulator + current );

  for ( let iterationIndex = 1; iterationIndex < coordinates.length - 1; iterationIndex++ ) {

    // Calculate the path if the current coordinate is skipped (a to c)
    const distanceIfSkipped = Math.abs(coordinates[iterationIndex - 1] - coordinates[iterationIndex + 1]);

    // Calculate the path if the current coordinate is visited (a to b) + (b to c)
    const distanceIfStepped = Math.abs(coordinates[iterationIndex - 1] - coordinates[iterationIndex]) + Math.abs(coordinates[iterationIndex] - coordinates[iterationIndex + 1]);

    // Determine the net change in total distance
    const modifiedTravelDistance = distanceIfSkipped - distanceIfStepped;

    resultArray.push(totalAbsoluteDifference + modifiedTravelDistance);
  }

  console.log(resultArray.join('\n'));
}

processInput( require("fs").readFileSync("/dev/stdin", "utf8") );