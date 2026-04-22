const   fileSystemHelper   =   require  ( "fs" ) ;

var   inputContentBuffer   =   fileSystemHelper.readFileSync(
        "/dev/stdin" ,
        "utf8"
    ) ;

var   numericValueString   =   inputContentBuffer.split(
        /\ \n\ /
    )[0] ;

console.log( ( numericValueString  *  numericValueString  *  numericValueString )  +  " \n " ) ;