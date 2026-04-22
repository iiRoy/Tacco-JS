function ProcessSequence( inputVal )
{
  let sequenceLength = inputVal . length;
  const baseCharAscii = "a".charCodeAt(0);
  let charAvailability = new Array(26) . fill(1);
  let currentIdx;

  if ( sequenceLength < 26 )
  {
    for ( currentIdx = 0; currentIdx < sequenceLength; currentIdx++ )
    {
      charAvailability[ inputVal.charCodeAt(currentIdx) - baseCharAscii ] = 0;
    }
    for ( currentIdx = 0; currentIdx < 26; currentIdx++ ) {
      if ( charAvailability[currentIdx] ) {
        inputVal += String.fromCharCode( baseCharAscii + currentIdx );
        break;
      }
    }
  }
  else
  {
    if ( inputVal === "zyxwvutsrqponmlkjihgfedcba" )
    {
      console.log( -1 );
      return;
    }
    charAvailability[ inputVal.charCodeAt(25) - baseCharAscii ] = 0;
    mainLoop:
    for ( currentIdx = 24; currentIdx >= 0; currentIdx-- )
    {
      for ( let candidateIdx = inputVal.charCodeAt(currentIdx) - baseCharAscii; candidateIdx < 26; candidateIdx++ )
      {
        if ( charAvailability[candidateIdx] === 0 )
        {
          inputVal = inputVal.slice(0, currentIdx);
          inputVal += String.fromCharCode(baseCharAscii + candidateIdx);
          break mainLoop;
        }
        charAvailability[ inputVal.charCodeAt(currentIdx) - baseCharAscii ] = 0;
      }
    }
  }
  console.log( inputVal );
}
ProcessSequence( require("fs").readFileSync("/dev/stdin", "utf8").trim() );