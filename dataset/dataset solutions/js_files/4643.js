function Main( input ){
 
    input = input.split( ' ' )
 
    var a = Number( input[0] )
    var b = Number( input[1] )
    var c = Number( input[2] )
 
    if( b - a === c - b ){
        console.log( 'YES' )
    } else {
        console.log( 'NO' )
    }
 
}
 
Main( require( 'fs' ).readFileSync(  ) )
