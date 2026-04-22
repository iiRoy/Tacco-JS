function processInput ( inputString )
{
  // This routine analyzes a supplied text string for a specific condition.
  const [ firstPart , secondPart ] = inputString.replace( /\r?\n/g , "" ) . split ( " " ) ;

  const valueA = Number ( firstPart ) ;
  const valueB = Number ( secondPart ) ;

  if ( valueA + 1 - ( valueB * 2 ) >= 0 )
  {
    console.log ( "YES" ) ;
  }
  else
  {
    console.log ( "NO" ) ;
  }
}

processInput( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;