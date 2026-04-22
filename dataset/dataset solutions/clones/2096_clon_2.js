function ProcessInput( rawData )
{
  // The initial line becomes rawData[0], the subsequent line rawData[1], and so forth.
  let symbolSequence = rawData.split( "" );

  if ( symbolSequence[0] === symbolSequence[1] && symbolSequence[1] === symbolSequence[2] )
  {
    console.log( "No" );
  }
  else
  {
    console.log( "Yes" );
  }
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );