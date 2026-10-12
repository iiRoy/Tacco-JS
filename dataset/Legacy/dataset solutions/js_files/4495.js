process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'readable', function() {
    var chunk = process.stdin.read();
    var inputLineArr;

    if ( chunk !== null ) {
        inputLineArr = chunk.split('\n');

        if( inputLineArr[inputLineArr.length-1] == '' )
            inputLineArr.pop();

        var num = inputLineArr[0].split(' ').map( function( elem ) {
            return elem;
        } );

        var s = num[0]

        console.log( handle( s.slice( 0, s.length-1 ) ) )
    }
} );

function handle ( s ) {
    if ( s.length % 2 === 0 ) {
        var delta = s.length / 2
        for ( var i = 0; i < s.length / 2; i++ ) {
            if ( s[i] !== s[i+delta] ) {
                return handle( s.slice( 0, s.length-2 ) )
            }
        }

        return s.length
    } else {
        return handle ( s.slice( 0, s.length-1 ) )
    }
}
