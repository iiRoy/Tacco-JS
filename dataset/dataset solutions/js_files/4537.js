function Main( input ){
  input = input.split( '\n' )
  num = input[0].split( ' ' )
  let a = Number( num[0] )
  let b = Number( num[1] )
  if( a + b >= 10 ) console.log( 'error' )
  else console.log( a + b )
}

Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )