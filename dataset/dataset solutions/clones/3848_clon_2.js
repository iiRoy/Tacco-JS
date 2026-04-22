const  dataStreamProcessor = require  ( 'readline'  ) .  createInterface  (  {
    input  :   process.stdin  ,
    output  :   process.stdout
}  ) ;

// Handle incoming user entries
dataStreamProcessor.on  (  'line'  ,   function  (   currentEntry  )
{
    processEntryData ( currentEntry ) ;
}  ) ;

function   processEntryData  (   inputString  )
{
    // Deconstruct the input string into constituent parts
    let   tokenizedValues  =   inputString.split  (  ' '  ) ;
    let   parsedMonthValue  =   parseInt  (  tokenizedValues[  0  ]  ) ;
    let   parsedDayValue  =   parseInt  (  tokenizedValues[  1  ]  ) ;
    let   matchingMonthCount  =   0.0  ;

    // Validate the parsed date components
    if  (  parsedMonthValue  <=  0.0  ||  parsedMonthValue  >  12.0  ||  parsedDayValue  <=  0.0  ||  parsedDayValue  >  31.0  )
    {
        return  console.log  (  matchingMonthCount  ) ;
    }

    // Iterate through months, decrementing from the input month
    for  (  let   currentMonthIterator  =  parsedMonthValue  ;  currentMonthIterator  >  0.0  ;  currentMonthIterator--  )
    {
        // Check if the current month is less than or equal to the specified day
        if  (  currentMonthIterator  <=  parsedDayValue  )
        {
            matchingMonthCount++ ; // Increment counter if condition met
        }
    }

    return  console.log  (  matchingMonthCount  ) ;
}