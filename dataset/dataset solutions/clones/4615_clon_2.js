function ProcessInputData(incomingText)
{
  const lineSeparated = incomingText.split( '\n' );

  const firstLineNumbers = lineSeparated[0].split(' ');
  let elementQuantity = Number( firstLineNumbers[0] );
  let durationCeiling = Number( firstLineNumbers[1] );

  const momentSequence = lineSeparated[1].split(' ').map(x => parseFloat(x));

  let finalAccumulation = 0;

  for ( let currentPosition = 1; currentPosition < elementQuantity; currentPosition++ ) {
    if ( momentSequence[currentPosition] - momentSequence[currentPosition - 1] < durationCeiling )
    {
      finalAccumulation = momentSequence[currentPosition];
    }
    else
    {
      finalAccumulation += durationCeiling;
    }
  }

  console.log(finalAccumulation + durationCeiling);
  return;
}

ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );