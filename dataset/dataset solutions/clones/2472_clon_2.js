function ProcessInput( rawData ) {
    rawData = rawData.split( "\n" );

    let targetValue = parseInt( rawData[0], 10 );

    let foundProduct = false;

    for ( let factorOne = 1; factorOne < 10; factorOne++ ) {
        for ( let factorTwo = 1; factorTwo < 10; ++factorTwo ) {
            if ( factorOne * factorTwo === targetValue ) {
                foundProduct = true;
                break;
            }
        }
    }

    foundProduct
        ? console.log( "yes" )
        : console.log( "no" );
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );