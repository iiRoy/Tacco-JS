'use strict'

function  processData (  incomingText  ) {

    incomingText  =  incomingText.split (  /\n/  )  ;
    const  totalItems  =  ~~incomingText[0]  ;

    // Split by spaces, convert to numbers, remove duplicates, then sort numerically
    let  distinctPoints  =  incomingText[1] . split ( ' ' ) . map (  itemValue  =>  ~~itemValue  ) . filter ( (  currentVal ,  currentIndex ,  sourceArray  )  =>  {
        return  sourceArray . indexOf (  currentVal  )  ===  currentIndex  ;
    } ) . sort (  (  elementA ,  elementB  )  =>  elementA  -  elementB  )  ;

    const  finalSpread  =  distinctPoints[distinctPoints.length - 1]  -  distinctPoints[0]  ;

    console . log (  finalSpread  )  ;

}
processData (  require('fs').readFileSync ( '/dev/stdin' ,  'utf8' )  )  ;