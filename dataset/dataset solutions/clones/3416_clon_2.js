let   inputRecords    =    [ ]   ;

const   inputProcessor   =   require   (   'readline'   )   ;

const   system   =   {
  inputSource :   process . stdin   ,
  outputDestination :   process . stdout
}   ;

let   userInterface   =   inputProcessor . createInterface   (   {
    input   :   system . inputSource   ,
    output   :   system . outputDestination   ,
}   )   ;

userInterface . on   (   'line'   ,   (   currentText   )   =>   {
    inputRecords . push   (   currentText   )   ;
}   )   ;

userInterface . on   (   'close'   ,   function   (   )   {

    const   initialCount   =   Number   (   inputRecords   [   0   ]   . split   (   " "   )   [   0   ]   )   ;
    const   subsetSize   =   Number   (   inputRecords   [   0   ]   . split   (   " "   )   [   1   ]   )   ;

    inputRecords . shift   (   )   ;

    let   dataElements   =   inputRecords . map   (   (   elementValue   )   =>   Number   (   elementValue   )   )   ;

    dataElements . sort   (   (   firstVal   ,   secondVal   )   =>   firstVal   -   secondVal   )   ;

    let   minimumRange   =   Infinity   ;

    for   (   let   loopIndex   =   0   ;   loopIndex   <   dataElements . length   ;   loopIndex   ++   )   {
        if   (   minimumRange   >   dataElements   [   loopIndex   +   subsetSize   -   1   ]   -   dataElements   [   loopIndex   ]   )   {
            minimumRange   =   dataElements   [   loopIndex   +   subsetSize   -   1   ]   -   dataElements   [   loopIndex   ]   ;
        }
    }

    console . log   (   minimumRange   )   ;
}   )   ;