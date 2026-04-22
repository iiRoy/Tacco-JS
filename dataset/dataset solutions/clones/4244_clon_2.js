function processInput(  sourceText ) {
    const textRows = sourceText . split( '\n' ) ;

    const configParams = textRows . shift() . split( ' ' ) . map(  item => parseInt( item )  );

    const numElements = configParams[0];
    const startPoint = configParams[1];
    const endPoint = configParams[2];

    const valuesList = textRows . shift() . split( ' ' ) . map(  item => parseInt( item )  );

    /*
     * This section calculates three key absolute differences:
     * 1. The initial difference between the 'startPoint' and 'endPoint'.
     * 2. The difference between the last element and the second-to-last element of 'valuesList'.
     * 3. The difference between the last element of 'valuesList' and 'endPoint'.
     */

    const originGap = Math.abs( startPoint - endPoint );
    const secondLastGap = Math.abs( valuesList[ numElements - 1 ] - valuesList[ numElements - 2 ] );
    const lastElementGap = Math.abs( valuesList[ numElements - 1 ] - endPoint );

    const overallMax = Math.max( originGap, secondLastGap, lastElementGap );

    console.log( overallMax );
}

processInput( require('fs') . readFileSync( '/dev/stdin', 'utf8' ) );