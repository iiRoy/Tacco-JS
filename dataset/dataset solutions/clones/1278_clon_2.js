var   dataSource   =   require ( 'fs' )
                     . readFileSync ( '/dev/stdin' ,
                                     'utf8' ) ;

var   receivedLines   =   dataSource . split ( "\n" ) ;

receivedLines . shift ( ) ;

var   suitSymbols   =   "SHCD" . split ( "" ) ;

var   missingCardsOutput   =   "" ;

for   (   var   outerIndex   =   0  ;
        outerIndex   <   4  ;
        outerIndex ++   )
{
    for   (   var   innerCounter   =   1  ;
            innerCounter   <=   13  ;
            innerCounter ++   )
    {
        var   currentCardDesignation   =   suitSymbols [ outerIndex ]   +   " "   +   innerCounter ;

        if   (   receivedLines . indexOf ( currentCardDesignation )   ===   -1   )
        {
            missingCardsOutput   +=   currentCardDesignation   +   "\n" ;
        }
    }
}

if   (   missingCardsOutput   !==   ""   )
{
    console . log (   missingCardsOutput . trim ( )   ) ;
}