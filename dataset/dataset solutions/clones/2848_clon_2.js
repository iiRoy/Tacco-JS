// This function processes the entire provided input string.
function ProcessData ( rawInput ) {
  let linesArray = rawInput . split ( "\n" ) ;
  let dataCount = parseInt ( linesArray [ 0 ] ) ;

  let sortedValues = linesArray [ 1 ] . split ( " " ) . map ( itemStr => parseInt ( itemStr ) ) . sort ( ( valA , valB ) => valA > valB ? -1 : ( valA === valB ? 0 : 1 ) ) ;
  let calculatedSum = 0 ;

  for ( let idx = 0 ; idx < dataCount ; idx ++ ) {
    if ( idx % 2 === 0 ) {
      calculatedSum = calculatedSum + sortedValues [ Math . floor ( idx / 2 ) ] ;
    } else {
      calculatedSum = calculatedSum - sortedValues [ dataCount - Math . floor ( idx / 2 + 1 ) ] ;
    }
  }

  console . log ( calculatedSum ) ;

  if ( dataCount % 2 === 0 ) {
    let currentVal = sortedValues [ dataCount - 1 ] ;
    for ( let idx = 0 ; idx < dataCount - 1 ; idx ++ ) {
      if ( idx % 2 === 0 ) {
        console . log ( sortedValues [ Math . floor ( idx / 2 ) ] + " " + currentVal ) ;
        currentVal = sortedValues [ Math . floor ( idx / 2 ) ] - currentVal ;
      } else {
        console . log ( sortedValues [ dataCount - Math . floor ( idx / 2 + 1 ) ] + " " + currentVal ) ;
        currentVal = sortedValues [ dataCount - Math . floor ( idx / 2 + 1 ) ] - currentVal ;
      }
    }
  } else {
    let currentVal = sortedValues [ 0 ] ;
    for ( let idx = 1 ; idx < dataCount ; idx ++ ) {
      if ( idx % 2 === 0 ) {
        console . log ( sortedValues [ Math . floor ( idx / 2 ) ] + " " + currentVal ) ;
        currentVal = sortedValues [ Math . floor ( idx / 2 ) ] - currentVal ;
      } else {
        console . log ( sortedValues [ dataCount - Math . floor ( idx / 2 + 1 ) ] + " " + currentVal ) ;
        currentVal = sortedValues [ dataCount - Math . floor ( idx / 2 + 1 ) ] - currentVal ;
      }
    }
  }
}
// Do not modify the following line; it handles standard input/output.
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;