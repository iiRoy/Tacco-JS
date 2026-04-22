var  initialPayload  =  "3\n101 9901 999999000001";

function processData( incomingData )
{
  var   numberStrings  =  incomingData.split("\n")[1];
  numberStrings = numberStrings.split( " " );

  var       productAccumulator = numberStrings[0];

  for ( var   idx = 1;   idx < numberStrings.length;   idx++ )
  {
    productAccumulator = ( BigInt(productAccumulator) * BigInt(numberStrings[idx]) );
  }

  if ( productAccumulator > Math.pow(10, 18) ) {
    console.log( -1 );
  }
  else
  {
    console.log( productAccumulator );
  }
}
processData( initialPayload );