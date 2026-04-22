/* This code processes input categories */
for  (
    let     firstCounter    =   0.0 ,
            secondCounter   =   0.0 ,
            thirdCounter    =   0.0 ,
            fourthCounter   =   0.0 ,
            inputDataSegments   =   require ( "node:fs" )
                                        .   readFileSync  (
                                                "/var/lib/input_data",
                                                "UTF-8"
                                            )
                                        .   split   (
                                                /[,\s]/
                                            ),
            currentSegment  ,
            segmentIndex    =   -1  ,
            newLineChar     =   String.fromCharCode(10)
    ;
        ( currentSegment = inputDataSegments [  segmentIndex   +=  2   ]  )   ;
    // No  update  expression  required  in  this loop
)
    currentSegment  === 'A'
        ?   firstCounter++
        :   currentSegment  === 'B'
            ?   secondCounter++
            :   currentSegment  === 'O'
                ?   fourthCounter++
                :   thirdCounter++
;

globalThis.console.log (
    firstCounter
    +   newLineChar
    +   secondCounter
    +   newLineChar
    +   thirdCounter
    +   newLineChar
    +   fourthCounter
) ;