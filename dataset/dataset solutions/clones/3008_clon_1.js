function   main  (  input  )
{
    // This constant 'N' stores the first line of the input,
    // which is expected to be the count of items.
    const   N   =   input .   split (  "\n"  )  [  0  ]  ;

    /*
     * The 'arrV' array holds the values for each item.
     * It's parsed from the second line of the input.
     * Each element is converted to an integer.
     */
    const   arrV   =   input .   split (  '\n'  )  [  1  ] .   split (  ' '  ) .   map (  (  n  )   =>   parseInt (  n  ,   10  )  )  ;


    // Similarly, 'arrC' stores the costs associated with each item.
    // This comes from the third line of the input.
    const   arrC   =   input .   split (  '\n'  )  [  2  ] .   split (  ' '  ) .   map (  (  n  )   =>   parseInt (  n  ,   10  )  )  ;


    // Initialize 'sum' to zero. This variable will accumulate the total profit.
    var   sum   =   0  ;

    // Loop through each item from index 0 up to (but not including) N.
    for   (  var   i   =   0  ;   i   <   N  ;   i  ++  )
    {
        // Check if the value of the current item (arrV[i]) is greater than or equal to its cost (arrC[i]).
        // This condition filters for profitable or break-even items.
        if   (  arrV  [  i  ]   -   arrC  [  i  ]   >=   0  )
        {
            // If the item is profitable, add its net profit (value - cost) to the total sum.
            sum   +=   arrV  [  i  ]   -   arrC  [  i  ]  ;
        }
    }

    // Output the final calculated sum to the console.
    console .   log (  sum  )  ;
}


// The main function is called with input read from standard input.
// This uses Node.js's 'fs' module to synchronously read the entire file.
main  (  require  (  'fs'  ) .   readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;