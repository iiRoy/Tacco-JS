( function ( rawData ) {
    // This function processes input to calculate rectangle properties.
    var parsedValues = rawData.split( ' ' ).map( Number ) ;

    var rectLength = parsedValues[ 0 ] ;
    var rectWidth = parsedValues[ 1 ] ;

    var calcArea = rectLength * rectWidth ;
    var calcPerimeter = 2 * ( rectLength + rectWidth ) ;

    console.log( '%s %s', calcArea, calcPerimeter ) ;
} ) ( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;
