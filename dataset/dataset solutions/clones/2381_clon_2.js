function ProcessData ( rawData ) {
    rawData = rawData .trim( ) .split( "\n" ) .map( function ( singleLine ) {
        return singleLine .split( " " ) ;
    } ) ;

    const timeOne = parseInt( rawData [ 0 ] [ 0 ] , 10 ) ;
    const timeTwo = parseInt( rawData [ 0 ] [ 1 ] , 10 ) ;
    const valueA1 = parseInt( rawData [ 1 ] [ 0 ] , 10 ) ;
    const valueA2 = parseInt( rawData [ 1 ] [ 1 ] , 10 ) ;
    const valueB1 = parseInt( rawData [ 2 ] [ 0 ] , 10 ) ;
    const valueB2 = parseInt( rawData [ 2 ] [ 1 ] , 10 ) ;

    let diffOne = BigInt( valueA1 - valueB1 ) * BigInt( timeOne ) ;
    let diffTwo = BigInt( valueA2 - valueB2 ) * BigInt( timeTwo ) + diffOne ;

    let finalResult = 0n ;
    let temporaryCalculation ;

    if ( diffTwo === 0n ) {
        finalResult = 'infinity' ;
    } else if ( diffOne * diffTwo < 0n ) {
        diffTwo = diffTwo * -1n ;
        temporaryCalculation = ( diffOne / diffTwo ) ;
        finalResult = ( temporaryCalculation * diffTwo === diffOne ) ? temporaryCalculation * 2n : temporaryCalculation * 2n + 1n ;
    } else {
        finalResult = 0n ;
    }

    console.log( finalResult .toString( ) ) ;
}

ProcessData( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;