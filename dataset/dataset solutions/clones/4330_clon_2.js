"use strict" ;

const processInput = inputData => {
    inputData = inputData.trim().split('\n') ;
    const charArray = inputData[ 0 ] . split ( '' ) ;
    
    if ( charArray.slice ( 0 , 4 ) . join ( "" ) === "GRILL" ) {
        console . log ( "Affirmative" ) ;
    } else {
        console . log ( "Negative" ) ;
    }
}
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;