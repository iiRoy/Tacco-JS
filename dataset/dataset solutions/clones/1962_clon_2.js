function processData ( rawData ) {

  const parsedLines = rawData . split ( '\n' ) ;

  const [ totalItems , numCategories ] = parsedLines [ 0 ] . split ( ' ' ) . map ( Number ) ;

  const itemCounts = parsedLines [ 1 ] . split ( ' ' ) . map ( Number ) ;

  const totalCount = itemCounts . reduce ( ( runningTotal , currentValue ) => {
    return runningTotal + currentValue ;
  } , 0 ) ;

  console . log ( totalItems - totalCount < 0 ? -1 : totalItems - totalCount ) ;

}

processData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;