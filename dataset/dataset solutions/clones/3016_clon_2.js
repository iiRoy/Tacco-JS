function ProcessInput( rawData )
{
    var  lineData  =  rawData.split( "\n" ) ;
    var  totalElements  =  parseInt( lineData[0] ) ;
    var  numericStrings  =  lineData[1].split( " " ) ;

    var  totalAbsoluteValue  =  0 ;
    var  negativeCount  =  0 ;
    var  minimumAbsoluteValue  =  Number.MAX_SAFE_INTEGER ;
    
    var  tempMap  =  { } ;

    for  ( var  idx  =  0 ;  idx  <  totalElements ;  idx++  )
    {
        var  currentAbsolute  =  Math.abs( numericStrings[idx] ) ;
        
        if  ( numericStrings[idx]  <  0 )
        {
            negativeCount++ ;
        }
        
        if  ( currentAbsolute  <  minimumAbsoluteValue )
        {
            minimumAbsoluteValue  =  currentAbsolute ;
        }
        
        totalAbsoluteValue  =  totalAbsoluteValue  +  currentAbsolute ;
    }

    console.log( negativeCount ) ;
    
    if  ( negativeCount  %  2  ===  0 )
    {
        console.log( totalAbsoluteValue ) ;
    }
    else
    {
        console.log( totalAbsoluteValue  -  minimumAbsoluteValue ) ;
    }
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;