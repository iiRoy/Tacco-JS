process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'readable', function() {
    var chunk = process.stdin.read();
    var inputLineArr;

    if ( chunk !== null ) {
        inputLineArr = chunk.split('\n');

        if( inputLineArr[inputLineArr.length-1] == '' )
            inputLineArr.pop();

        var n = inputLineArr[0]
        var ai = inputLineArr[1].split(' ').map( function( elem ) {
            return parseInt(elem);
        } )

        var s1 = '',
            s2 = ''

        for ( var i = n-1; i >= 0; i -= 2 ) {
            s1 += ai[i] + ' '
            if ( i !== 0 )
                s2 = ai[i-1] + ' ' + s2
        }

        console.log( s1 + s2 )
    }
} );

