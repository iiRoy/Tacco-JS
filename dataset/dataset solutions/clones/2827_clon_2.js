'use strict';

const ProcessInputData = ( initialPayload ) => {
    let contentRows = initialPayload .trim() .split( '\n' ) ;

    let horzExtent = contentRows[ 0 ] .split( ' ' ) .map( ( val ) => parseInt( val, 10 ) ) [ 0 ] ;
    let vertExtent = contentRows[ 0 ] .split( ' ' ) .map( ( val ) => parseInt( val, 10 ) ) [ 1 ] ;
    let pointX = contentRows[ 0 ] .split( ' ' ) .map( ( val ) => parseInt( val, 10 ) ) [ 2 ] ;
    let pointY = contentRows[ 0 ] .split( ' ' ) .map( ( val ) => parseInt( val, 10 ) ) [ 3 ] ;

    let totalSurfaceDivTwo = ( horzExtent * vertExtent ) / 2.0 ;
    let centralAlignmentFlag = 0 ;

    let midpointHorz = horzExtent / 2.0 ;
    let midpointVert = vertExtent / 2.0 ;
    
    if ( midpointHorz === pointX && midpointVert === pointY )
    {
        centralAlignmentFlag = 1 ;
    }

    console .log( totalSurfaceDivTwo , centralAlignmentFlag ) ;
};

ProcessInputData( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ) ;