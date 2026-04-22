'use strict';

( function ( dataStream ) {

  var   processedData   =   dataStream . toString() . trim() . split( '\n' ) ;


  ( function ( totalSeconds ) {
    // This routine breaks down a given number of seconds into its constituent
    // hours, minutes, and remaining seconds components for display.
    var computedHours     =    parseInt ( totalSeconds   /   3600 );
    var calculatedMinutes =    parseInt ( ( totalSeconds / 60 )  %  60 );
    var finalSeconds      =    totalSeconds % 60 ;

    console . log( computedHours, calculatedMinutes, finalSeconds ) ;

  } ) ( parseInt( processedData [ 0 ] ,   10 ) ) ; // Extract the initial numerical value from the first input line.

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;