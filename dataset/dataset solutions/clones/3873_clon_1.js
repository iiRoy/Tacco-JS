// This JavaScript file processes input data to solve a specific problem.
// It calculates the total number of items that can be acquired
// given an initial budget and a list of item costs.

function   main ( input )
{
    // The first line of input contains two numbers: N and X.
    // N represents the initial number of items.
    // X represents the initial budget.
    var    N    =    input [ 0 ] . split ( " " ) [ 0 ]    -    0    ; // Extract N and convert to number
    var    X    =    input [ 0 ] . split ( " " ) [ 1 ]    -    0    ; // Extract X and convert to number

    // Initialize an empty array to store the costs of the N items.
    var    list    =    [ ]    ;

    // Initialize a variable to accumulate the sum of costs of the N items.
    var    sum    =    0    ;

    // Loop through the input array starting from the second line (index 1)
    // to read the costs of the N items.
    for    (    var    i    =    1    ;    i    <=    N    ;    i    ++    )
    {
        // Add the current item's cost (converted to number) to the total sum.
        sum    +=    (    input [ i ]    -    0    )    ;

        // Push the current item's cost (converted to number) into the list.
        list . push ( input [ i ] - 0 ) ;
    }

    /*
     * Sort the list of item costs in ascending order.
     * This is necessary to easily find the cheapest item later.
     */
    list . sort ( ( a , b ) => a - b ) ;

    // Subtract the sum of the initial N items from the budget X.
    // X now represents the remaining budget after buying the initial items.
    X -= sum ;

    // Calculate the final result:
    // N (the initial number of items)
    // plus
    // the maximum number of additional cheapest items that can be bought with the remaining budget.
    // Math.floor ensures we only count whole items.
    console . log ( N + Math . floor ( X / list [ 0 ] ) ) ;
}

// This is the entry point of the script.
// It reads the entire content of standard input,
// trims any leading/trailing whitespace,
// splits it into an array of lines,
// and then passes this array to the 'main' function.
main (
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' , 'utf8' )
        . trim ( )
        . split ( "\n" )
) ;