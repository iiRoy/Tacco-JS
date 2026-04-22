const processText = function (  incomingData  )
{
    let   charArray   = incomingData . split ( /\n/ ) [ 0 ] . trim ( ) . split ( '' ) ;

    if  ( charArray . slice ( -1 ) [ 0 ]  ===  's'  )
        charArray . push ( 'es' ) ;
    else
        charArray . push ( 's' ) ;

    console . log ( charArray . join ( "" ) ) ;
} ;

processText ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;