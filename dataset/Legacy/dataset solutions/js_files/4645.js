function Main( input ){

    input = input.split( '\n' )
    
    var o = [].slice.call( input[0] )
    var e = [].slice.call( input[1] )
    
    var pass = ''
    
    for( ;; ){
        if( o.length ) pass += o.shift()
        if( e.length ) pass += e.shift()
        if( o.length === 0 && e.length === 0 ) break
    }
    
    console.log( pass )

}

Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )