'use strict';

const outputWriter = messageContent => console.log(messageContent);

// This function processes the entire dataset provided as input.
function executeProgram ( rawData )
{
  // The first line of input is in rawData[0], second in rawData[1], and so on.
  let firstFactor = rawData[0].split(" ")[0];
  let secondFactor = rawData[0].split(" ")[1];
  let loopUpperLimit = rawData[0].split(" ")[2];
  let peakValue = 0;


  for ( let currentCount = 1; currentCount <= loopUpperLimit; currentCount++ )
  {
    let calculatedResult = Math.floor( firstFactor * currentCount / secondFactor ) - firstFactor * Math.floor( currentCount / secondFactor );
    if ( calculatedResult > peakValue )
    {
      peakValue = calculatedResult;
    }
  }

  outputWriter( peakValue );
}
// * Do not modify the following line (it reads from standard input and calls the main processing function)
executeProgram( require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n") );