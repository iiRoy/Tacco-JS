function ProcessInput ( rawData )
{
    numericValues  =  rawData . split(  " "  ) . map (  function( elementString )
    {
        return   Number . parseInt(  elementString  ) ;
    }  ) ;

    console . log(  numericValues[ 0 ]  *  numericValues[ 1 ]  +  " "  +  (  numericValues[ 0 ]  +  numericValues[ 1 ]  )  *  2  ) ;
}

ProcessInput(  require(  "fs"  ) . readFileSync(  "/dev/stdin"  )  ) ;