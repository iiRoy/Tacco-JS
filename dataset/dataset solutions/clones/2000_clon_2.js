function processInputValues ( rawTextStream ) {

  const parsedItems = rawTextStream.split ( ' ' ) ;

  let primaryValue = parseInt ( parsedItems[0] , 10 ) ;
  let secondaryValue = parseInt ( parsedItems[1] , 10 ) ;
  let tertiaryValue = parseInt ( parsedItems[2] , 10 ) ;


  [ primaryValue , secondaryValue ] = [ secondaryValue , primaryValue ] ;


  [ primaryValue , tertiaryValue ] = [ tertiaryValue , primaryValue ] ;


  console.log ( `${primaryValue} ${secondaryValue} ${tertiaryValue}` ) ;

}

processInputValues ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;