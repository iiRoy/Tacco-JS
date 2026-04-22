function Main( input ){

    input = input.split( '\n' )
    
    var n = Number( input[0] )
    var str = []
    
    for( var i=1; i<n+1; i++ ){
        str.push( [].slice.call( input[i] ).sort() )
    }
    
    var output = ''
    var base = str.shift()
    
    function arr( base, str ){
        if( str.length === 0 ) return base
        
        var s = str.shift()
        
        var out = []
        for( var i=0; i<base.length; i++ ){
            for( var j=0; j<s.length; j++ ){
                if( base[i] === s[j] ){
                    out.push( base[i] )
                    s.splice( j, 1 )
                    break
                }
            }
        }
        
        return arr( out, str )
    }
    
    var result = arr( base, str )
    
    if( result.length === 0 ) console.log()
    else console.log( result.join( '' ) )
    
}

Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )