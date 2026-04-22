function ProcessInput( incomingText )
{
  let numericArray = incomingText . trim ( ) . split ( / \s + / ) . map ( currentElement => + currentElement ) ;

  const initialCount = numericArray . shift ( ) ;

  let maximumValue = Math . max . apply ( null , numericArray ) ;

  while ( numericArray . indexOf ( maximumValue ) >= 0 )
  {
    numericArray [ numericArray . indexOf ( maximumValue ) ] = Infinity ;
  }

  let finalResult = numericArray [ numericArray . map ( currentElement => Math . abs ( currentElement - maximumValue / 2 ) ) . indexOf ( Math . min . apply ( null , numericArray . map ( currentElement => Math . abs ( currentElement - maximumValue / 2 ) ) ) ) ] ;

  console . log ( maximumValue + ' ' + finalResult ) ;
}

ProcessInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;