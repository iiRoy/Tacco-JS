function fetchInputData () {
    return  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ;
}

let letterCollection = 'abcdefghijklmnopqrstuvwxyz' . split ( '' ) ;

let occurrenceMap = fetchInputData ( )
    . split ( '' )
    . reduce ( function ( charMap , inputChar )
    {
        let  normalizedChar  =  inputChar . toLowerCase ( ) ;

        if ( normalizedChar . match ( /[a-zA-Z]/ ) )
        {
            charMap [ normalizedChar ] = ( charMap [ normalizedChar ] || 0 ) + 1 ;
        }
        return charMap ;
    } ,
    { }
) ;

letterCollection . forEach ( function ( displayChar )
{
    console . log ( displayChar  +  " : "  +  ( occurrenceMap [ displayChar ]  ?  occurrenceMap [ displayChar ]  :  0 ) ) ;
} ) ;