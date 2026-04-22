const characterSequence = 'abcdefghijklmnopqrstuvwxyz' ;

require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
  . split ( '\n' )
  . map ( ( currentLineItem ) => {
    for ( let charShift = 26 ; charShift-- ; ) {
      let resultString = currentLineItem . replace ( /[a-z]/g , ( matchedChar ) => {
        return characterSequence [ ( characterSequence . indexOf ( matchedChar ) + charShift ) % 26 ] ;
      } ) ;

      resultString . match ( /th(e|is|at)/ )
        ? console . log ( resultString )
        : undefined ;
    }
  } ) ;