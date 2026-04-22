// This function serves to analyze an incoming text string for specific character sequences.
function ProcessInputString (  inputDataStream  ) {

    // First, check if the most complex pattern of three 'R's exists within the provided string.
    if  ( inputDataStream . indexOf ( 'RRR' )   !=   -1 )
    {
        // If the 'RRR' sequence is found, output the highest priority level.
        console.log  (  3  )  ;
    }
    // If 'RRR' is not present, proceed to check for the next complex pattern: two 'R's.
    else   if  (  inputDataStream . indexOf  ( 'RR'  )  !==  -1  )
    {
        // If the 'RR' sequence is identified, output the medium priority level.
        console.log   (  2  )  ;
    }
    // If neither 'RRR' nor 'RR' are found, check for the simplest pattern: a single 'R'.
    else  if  (  inputDataStream . indexOf  ( 'R' )   !=   -1  )
    {
        // If a single 'R' is detected, output the lowest priority level for a match.
        console.log   (  1  )  ;
    }
    // If none of the specified 'R' patterns are found in the input string,
    // execute the default case, indicating no pattern match.
    else
    {
        // No 'R' patterns were found, so output the default value.
        console.log   (  0  )  ;
    }

}
// Call the primary processing function, feeding it content read directly from standard input.
ProcessInputString (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8"  )  )  ;