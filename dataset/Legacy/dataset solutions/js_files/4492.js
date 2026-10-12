process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'readable', function() {
    var chunk = process.stdin.read();
    var inputLineArr;

    if ( chunk !== null ) {
        inputLineArr = chunk.split('\n');

        if( inputLineArr[inputLineArr.length-1] == '' )
            inputLineArr.pop();

        var num = inputLineArr[0].split(' ').map( function( elem ) {
            return parseInt( elem );
        } );

        var a = num[0] + num[1],
            b = num[1] + num[2],
            c = num[2] + num[0];

        console.log( Math.min( a, b, c ) );
    }
} );
