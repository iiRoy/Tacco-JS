function   ProcessData (  sourceContent  ) {
  sourceContent = sourceContent.split ( "\n" ) ;
  var computedPower = Math . pow ( 3 , sourceContent[0] ) ;
  var factorProduct = 1 ;
  var valueList = sourceContent[1] . split ( " " ) . map ( Number ) ;
  valueList . forEach ( function ( item ) {
    if ( item % 2 == 0 )
      { factorProduct *= 2 ; }
  } ) ;
  console . log ( computedPower - factorProduct ) ;
}
ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;