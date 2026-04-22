'use strict';

function  primaryProcess (   inputString   ) {

    inputString  =  inputString . split ( '\n' ) [ 0 ] ;

    let resultString = inputString . replace ( /,/g , ' ' ) ;

    console . log ( resultString ) ;

}

primaryProcess ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;