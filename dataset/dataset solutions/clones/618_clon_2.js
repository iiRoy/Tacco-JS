let  sourceData  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

let  processedLines  =  (  sourceData . trim ( )  ) . split ( "\n" ) ;

let  finalValue  =  processedLines [ 0 ]  -  0 ;

for (  let  loopIndex  =  1  ;  loopIndex  <  processedLines . length  ;  loopIndex  =  loopIndex  +  2  )
{
    if  (  processedLines [ loopIndex ]  ===  "="  )
    {
        break ;
    }

    if  (  processedLines [ loopIndex ]  ===  "+"  )
    {
        finalValue  +=  (  processedLines [ loopIndex  +  1 ]  -  0  ) ;
    }

    if  (  processedLines [ loopIndex ]  ===  "-"  )
    {
        finalValue  -=  (  processedLines [ loopIndex  +  1 ]  -  0  ) ;
    }

    if  (  processedLines [ loopIndex ]  ===  "*"  )
    {
        finalValue  *=  (  processedLines [ loopIndex  +  1 ]  -  0  ) ;
    }

    if  (  processedLines [ loopIndex ]  ===  "/"  )
    {
        finalValue  /=  (  processedLines [ loopIndex  +  1 ]  -  0  ) ;
    }

    finalValue  =  finalValue . toFixed ( 0 )  -  0 ;
}

console . log ( finalValue ) ;