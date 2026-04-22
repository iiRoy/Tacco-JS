'use strict';
function executeLogic( inputDataString ) {
  inputDataString = inputDataString.replace( /^\s+|\s+$/g, '' ).split( '\n' );

  // Parse initial configuration parameters.
  let boundaryParameters = inputDataString[0].split( ' ' ).map( ( valueElement ) => Number( valueElement ) );
  let primaryLimit = boundaryParameters[0];
  let secondaryLimit = boundaryParameters[1];

  let candidateScores = inputDataString[1].split( ' ' ).map( ( entryItem ) => parseInt( entryItem, 10 ) ).sort( ( firstVal, secondVal ) => secondVal - firstVal );

  let finalOutcome = "Yes";

  // Calculate the grand total of all scores.
  let cumulativeSum = candidateScores.reduce( ( runningTotal, currentElement ) => runningTotal + currentElement, 0 );

  // Evaluate if the top 'secondaryLimit' items meet the specified threshold.
  for ( let countIndex = 0; countIndex < secondaryLimit; countIndex++ ) {
    if ( candidateScores[countIndex] < cumulativeSum / ( 4 * secondaryLimit ) ) {
      finalOutcome = "No";
    }
  }

  console.info( finalOutcome );
}

executeLogic( require( 'node:fs' ).readFileSync( '/dev/stdin', { encoding: 'utf8', flag: 'r' } ) );