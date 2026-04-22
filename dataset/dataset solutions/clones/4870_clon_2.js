// This routine processes the incoming string of data.
function ProcessInputData( rawData )
{
  rawData = rawData . split ( " " ) ;
  const numericValues = rawData . map ( currentString => parseInt ( currentString , 10 ) ) ;
  numericValues . sort ( ( firstNum , secondNum ) => firstNum - secondNum ) ;
  console . log ( numericValues [ 0 ] + numericValues [ 1 ] === numericValues [ 2 ] ? "Yes" : "No" ) ;
}

ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;