// This script processes a sequence of numerical inputs.
function  HandleChallenge ( dataString )
{

  dataString = dataString .split ( " " );


  let alphaNum = parseInt ( dataString [ 2 ], 10 );

  let betaNum = parseInt ( dataString [ 0 ], 10 );
  let gammaNum = parseInt ( dataString [ 1 ], 10 );

  console.log(alphaNum + " " + betaNum + " " + gammaNum);
}
HandleChallenge( require("fs") . readFileSync( "/dev/stdin", "utf8" ) );