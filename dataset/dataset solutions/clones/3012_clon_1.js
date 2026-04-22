/*
 * This JavaScript code processes input to find the greatest common divisor (GCD)
 * that satisfies a specific condition related to filtering a list of numbers.
 * The input is expected to be provided via standard input.
 */

// The 'input' parameter receives the entire input data as a single string.
function Main ( input )
{

    // Split the input string by newline characters to get an array of lines.
    // The first line will be input[0], the second input[1], and so on.
    input  =  input . split ( "\n" ) ;

    // Parse the first line to extract N and potentially other numbers.
    // Here, we assume the first line contains space-separated integers.
    const   numList0   =   input [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ,   10 ) ) ;
    // N is the first number from the first line.
    const   N   =   numList0 [ 0 ] ;
    // Parse the second line to get the main list of numbers, AList.
    const   AList   =   input [ 1 ] . split ( ' ' ) . map ( x => parseInt ( x ,   10 ) ) ;


    // Initialize an empty list to store the divisors.
    const   yakusuuList   =   [ ] ;
    // Find the maximum number in AList, which is assumed to be the last element
    // based on typical competitive programming problem structures where the list is sorted or max is at N-1.
    const   MaxNumber   =   AList [ N   -   1 ] ;

    // Iterate from 1 up to the MaxNumber to find all its divisors.
    for   (   var   i   =   1   ;   i   <=   MaxNumber   ;   i ++   )
    {
        // Check if 'i' is a divisor of MaxNumber.
        if   (   MaxNumber   %   i   ===   0   )
        {
            // If it is, add it to the list of divisors.
            yakusuuList . push ( i ) ;
        }
    }

    // Reverse the list of divisors to process them from largest to smallest.
    const   reversedList   =   yakusuuList . reverse ( ) ;


    // Iterate through the reversed list of divisors.
    for   (   var   i   =   0   ;   i   <   reversedList . length   ;   i ++   )
    {
        // Get the current divisor.
        var   yakusuu   =   reversedList [ i ] ;
        // Filter AList to find all elements that are divisible by the current 'yakusuu'.
        var   filteredList   =   AList . filter ( ( elem )   =>   elem   %   yakusuu   ===   0 ) ;

        // Check if the count of numbers divisible by 'yakusuu' plus one
        // is greater than or equal to the total length of AList.
        // This condition implies that 'yakusuu' is a suitable GCD candidate.
        if   (   filteredList . length   +   1   >=   AList . length   )
        {
            // If the condition is met, print the 'yakusuu' and exit the function.
            console . log ( yakusuu ) ;
            return ;
        }
    }

    // If no such 'yakusuu' is found in the loop, it means 1 is the GCD that satisfies the condition.
    console . log ( 1 ) ;
}


// Read the input from standard input (usually /dev/stdin in competitive programming environments).
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;