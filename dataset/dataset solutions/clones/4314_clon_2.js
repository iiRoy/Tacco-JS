"use strict"
;const solveProblem = inputData => {
  inputData = inputData.trim().split("\n");
  const targetValue = parseInt( inputData[0] );
  for ( let heightVar = 1 ; heightVar <= 3500 ; heightVar++ ) {
    for ( let numeratorVar = 1 ; numeratorVar <= 3500 ; numeratorVar ++ ) {
      let resultVal = (targetValue * heightVar * numeratorVar) / (4 * heightVar * numeratorVar - targetValue * numeratorVar - targetValue * heightVar);
      if ( resultVal % 1 === 0 ) {
        console.log(heightVar + " " + numeratorVar + " " + resultVal);
        return;
      }
    }
  }
};
solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));