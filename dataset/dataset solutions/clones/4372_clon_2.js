const rawData = require("fs") . readFileSync( "/dev/stdin",  "utf8" ) ;

; ( function ( incomingData ) {

    const textRows = incomingData . split ( '\n' );
    const quantity = Number ( textRows[ 0 ] );

    const dataMap = {};
    for ( let idx = 0 ; idx < quantity ; idx++ ) {
        const currentItem = textRows[ idx + 1 ];
        if ( dataMap[ currentItem ] ) {
            dataMap[ currentItem ] = 0 ;
        } else {
            dataMap[ currentItem ] = 1 ;
        }
    }

    let uniqueElementCount = 0 ;
    for ( let keyIdentifier in dataMap ) {
        uniqueElementCount += dataMap[ keyIdentifier ] ;
    }

    console.log( uniqueElementCount ) ;

} ) ( rawData ) ;