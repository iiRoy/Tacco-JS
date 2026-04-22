"use strict";

const processInput = ( inputData ) => {

 inputData = inputData.trim() . split( "\n" );
 const targetValue = inputData [ 0 ];
 
 if ( targetValue < 100 ) {
    console.log( 0 );
    return;
 }
 
 let remainderPart = parseInt( targetValue.split("").slice(-2).join("") );
 let operationCount = 0;
 
 if ( remainderPart === 0 ) {
   console.log( 1 );
   return;
 }
 
 if ( remainderPart === 1 ) {
    operationCount = remainderPart;
 }
 
 while ( remainderPart !== 0 ) {
    if ( remainderPart >= 5 ) {
        remainderPart = remainderPart % 5;
    } else if ( remainderPart >= 4 ) {
        remainderPart = remainderPart % 4;
    } else if ( remainderPart >= 3 ) {
        remainderPart = remainderPart % 3;
    } else if ( remainderPart >= 2 ) {
        remainderPart = remainderPart % 2;
    } else if ( remainderPart >= 1 ) {
        remainderPart = remainderPart % 1;
    }
    operationCount++;
 }
 
 if ( 100 * operationCount < targetValue ) {
   console.log( 1 );
 } else {
   console.log( 0 );
 }

};

processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );