function ProcessInput( rawData )
{
  let currentMagnitude = Number(rawData);

  if ( currentMagnitude === 1 )
  {
    return console.log( 1 );
  }

  let depthLevel = 1;

  while ( true )
  {
    currentMagnitude = Math.floor( currentMagnitude / 2 );
    depthLevel++;
    if ( currentMagnitude === 1 )
    {
      break;
    }
  }

  const computedSum = Math.pow( 2, depthLevel ) - 1;

  // Displaying the final calculation
  console.log( computedSum );
}

/* Do not modify anything beyond this line; it handles input reading and function invocation. */
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );