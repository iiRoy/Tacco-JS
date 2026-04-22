/* This module handles the processing of a collection of 2D points.
 * It identifies specific relationships between them for calculation. */
function ProcessCoordinates (  dataFeed )
{
  // Divide the input text into distinct rows.
  let rowData = dataFeed.split ( '\n' ) ;

  // Extract the total count of points from the initial row.
  const pointCount=Number(rowData[0]);

  // Declare containers for the X and Y values of the coordinates.
  let xCoords=[];
  let yCoords=[];

  // Populate coordinate arrays by iterating through the input.
  for(let loopCounterA=1;loopCounterA<=pointCount;loopCounterA++){
    // Parse each row, splitting by space, converting string parts to numeric.
    let currentPair = rowData[loopCounterA].split(' ').map(strVal => Number(strVal));
    xCoords.push(currentPair[0]); // Add the X-component.
    yCoords.push(currentPair[1]); // Add the Y-component.
  }

  // An array to hold initial comparison scores for each point.
  let relationScores = [ ];

  // First computation pass: Determine direct relationship scores.
  for(let loopCounterB=0;loopCounterB<pointCount;loopCounterB++){
    let matchTally=0; // Initialize score for the current point.
    for(let loopCounterC=0;loopCounterC<pointCount;loopCounterC++){
      // Check if one point strictly dominates or is strictly dominated by another.
      if((xCoords[loopCounterB]>xCoords[loopCounterC]&&yCoords[loopCounterB]>yCoords[loopCounterC])||(xCoords[loopCounterB]<xCoords[loopCounterC]&&yCoords[loopCounterB]<yCoords[loopCounterC])){
        matchTally++; // Increment if the condition holds true.
      }
    }
    relationScores.push(matchTally); // Store the computed match count.
  }


  // Second computation pass: Aggregate scores and display results.
  for(let loopCounterB=0;loopCounterB<pointCount;loopCounterB++){
    let aggregatedScore = 1; // Start with a base score of 1.
    for(let loopCounterC=0;loopCounterC<pointCount;loopCounterC++){
      // Re-apply the same dominance check condition.
      if((xCoords[loopCounterB]>xCoords[loopCounterC]&&yCoords[loopCounterB]>yCoords[loopCounterC])||(xCoords[loopCounterB]<xCoords[loopCounterC]&&yCoords[loopCounterB]<yCoords[loopCounterC])){
        // Sum the stored relation scores.
        aggregatedScore = aggregatedScore + relationScores[loopCounterC];
      }
    }
    console.log(aggregatedScore); // Output the final aggregated value.
  }
}

// Initialize the process by reading data from the standard input source.
ProcessCoordinates( require('fs').readFileSync('/dev/stdin','utf8') );