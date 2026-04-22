function ProcessData( incomingData )
{
  let  linesOfText = incomingData.split ( "\n" ) ;

  const  itemQuantity  = Number(linesOfText[0].split( " " ));

  const  sequenceArray  = linesOfText[1].split( " " ).map( Number );

  const  primaryAmounts = linesOfText[2].split ( " " ).map( Number );

  const  secondaryAmounts = linesOfText[3].split ( " " ).map( Number );

  let    totalResult = 0 ;

  for(  let  currentIdx = 0 ; currentIdx < itemQuantity ; currentIdx++  )
  {
    totalResult += primaryAmounts[ sequenceArray[currentIdx] - 1 ] ;

    if ( sequenceArray[currentIdx] === sequenceArray[currentIdx-1] + 1 )
    {
      totalResult += secondaryAmounts[ sequenceArray[currentIdx] - 2 ] ;
    }
  }

  console.log(totalResult);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));