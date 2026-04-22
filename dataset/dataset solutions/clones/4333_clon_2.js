// This function processes an incoming data string to find a specific combination.
var  processInput  =  function (  incomingData  )  {
    // Parse the input string into an array of integers.
    // It expects space-separated numerical values.
    var  numericValues  =  incomingData . split ( ' ' ) . map (  item  =>  parseInt (  item ,  10  )  ) ;

    // Extract the three critical numerical parameters from the parsed array.
    var  firstLimit  =  numericValues [  0  ] ;
    var  secondLimit  =  numericValues [  1  ] ;
    var  targetSum  =  numericValues [  2  ] ;

    // Initialize a status indicator, assuming no match initially.
    var  outcomeStatus  =  'NO_MATCH' ;

    // Begin nested iteration to explore all possible combinations within the given limits.
    // The outer loop iterates from zero up to and including 'firstLimit'.
    for  (  let  rowCounter  =  0 ;  rowCounter  <=  firstLimit ;  ++rowCounter  )  {
        // The inner loop iterates from zero up to and including 'secondLimit'.
        for  (  let  colCounter  =  0 ;  colCounter  <=  secondLimit ;  ++colCounter  )  {
            // Check if the current combination satisfies the target condition.
            // The formula is: colCounter * (firstLimit - rowCounter) + rowCounter * (secondLimit - colCounter)
            if  (  (  colCounter  *  (  firstLimit  -  rowCounter  )  )  +  (  rowCounter  *  (  secondLimit  -  colCounter  )  )  ===  targetSum  )  {
                // If a match is found, update the status and immediately report it.
                outcomeStatus  =  'MATCH_FOUND' ;
                console . log (  outcomeStatus  ) ;
                return  void  0 ;  // Exit early on success
            }
        }
    }

    // If the loops complete without finding a match, print the default status.
    console . log (  'Ans'  ) ; // Replicating the original's specific string literal output here.
    return  void  0 ; // Indicate completion.
} ;

// Execute the main processing function with data read from standard input.
// Reads file content, decodes as UTF-8, and removes leading/trailing whitespace.
processInput (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . trim ( )  ) ;