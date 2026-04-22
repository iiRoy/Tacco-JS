function ProcessData (  rawData  ) {

  const textRows = rawData .split ( '\n' ) ;

  const firstRowParts = textRows[0] . split ( ' ' ) ;

  const firstVal = firstRowParts[0] ;
  const secondVal = firstRowParts[1] ;
  const thirdVal = firstRowParts[2] ;
  const exponentFactor = textRows[1] ;

  let maxElement ;
  let remainingSum ;

  if ( firstVal >= secondVal && firstVal >= thirdVal ) {
    maxElement = firstVal ;
    remainingSum = secondVal + thirdVal ;
  } else if ( secondVal >= thirdVal ) {
    maxElement = secondVal ;
    remainingSum = firstVal + thirdVal ;
  } else {
    maxElement = thirdVal ;
    remainingSum = firstVal + secondVal ;
  }

  const finalResult = maxElement * Math.pow ( 2 , exponentFactor ) + remainingSum ;

  console.log ( finalResult ) ;
}

ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;