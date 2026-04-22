'use strict'

const processInputData = ( initialText ) => {
  const upperLimit = parseInt( initialText );
  let finalProduct = 1;

  for ( let iteratorValue = 1; iteratorValue <= upperLimit; iteratorValue++ )
  {
    finalProduct *= iteratorValue;
    finalProduct %= Math.pow(10, 9) + 7;
  }

  console.log( finalProduct );
};

processInputData( require('fs').readFileSync( '/dev/stdin', 'utf-8' ) );