function     SortNumericPairs ( rawDataStream ) {
    rawDataStream  =  rawDataStream . split ( '\n' ) ;
    for  (  let  currentLineIndex  =  0  ;  rawDataStream [ currentLineIndex ] [ 0 ]  !==  '0'  ;  currentLineIndex ++  ) {
        const  numericValues  =  rawDataStream [ currentLineIndex ] . split ( ' ' ) . map ( Number ) ;
        let  valueOne  =  numericValues [ 0 ] ;
        let  valueTwo  =  numericValues [ 1 ] ;
        if  (  valueOne  >  valueTwo  ) {
            console . log ( valueTwo  +  " "  +  valueOne ) ;
        }  else  {
            console . log ( valueOne  +  " "  +  valueTwo ) ;
        }
    }
}

SortNumericPairs ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;