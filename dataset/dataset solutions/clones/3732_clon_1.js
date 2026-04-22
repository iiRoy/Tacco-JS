var    toInt    =    x    =>    parseInt ( x , 10 )    ;

var    toIntArr    =    arr    =>    arr . map ( x => toInt ( x ) )    ;

function    min    ( )    {
    var    rest    =    arguments ,
        val    =    rest [ 0 ] ;
    for    ( var i = 1 ; i < rest . length ; i ++ )
        if    ( rest [ i ] < val )
            val    =    rest [ i ] ;
    return    val
}

function    max    ( )    {
    var    rest    =    arguments ,
        val    =    rest [ 0 ] ;
    for    ( var i = 1 ; i < rest . length ; i ++ )
        if    ( rest [ i ] > val )
            val    =    rest [ i ] ;
    return    val
}

Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

function    Main    ( input )    {
    var    k    =    input . split ( '\n' ) [ 0 ] ;
    var    num    =    1 ;
    var    div9    =    0 ;
    var    ans    ;

    for    ( var i = 1 ; i <= k ; i ++ )    {
        ans    =    num . toString ( ) ;
        for    ( var j = 0 ; j < div9 ; j ++ )
            ans    +=    '9' ;

        console . log ( ans ) ;

        num ++ ;
        if    ( num    ===    10 )    {
            num    =    1 ;
            div9 ++ ;
        }
    }
}