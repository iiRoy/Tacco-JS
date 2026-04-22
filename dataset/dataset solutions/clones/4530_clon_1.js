function  main ( input )
{
    // This function processes the input data according to specific rules.

    // Step 1: Divide the raw input string into an array of lines.
    input  =  input . split ( "\n" ) ;

    // Step 2: Extract the second line of input (index 1) and split it by spaces.
    // This line is expected to contain a series of numbers.
    temp  =  input [ 1 ] . split ( " " ) ;

    // Step 3: The first line of input (index 0) contains the count of items to process.
    len  =  input [ 0 ] ;

    // Initialize an empty array to store unique numerical categories.
    list  =  [ ] ;

    // Initialize a counter for items that fall into a special category (num > 7).
    index  =  0 ;

    // Begin a loop to iterate through the 'temp' array based on the 'len' value.
    for  ( var  i  =  0 ;  i  <  len ;  i += 1 )
    {
        // Calculate a category number by dividing the current item by 400 and taking the floor.
        num  =  Math . floor ( temp [ i ]  /  400 ) ;

        // Check if the calculated category number exceeds a specific threshold (7).
        if  ( num  >  7 )
        {
            // If 'num' is greater than 7, increment the special category counter.
            index  +=  1 ;
        }
        else
        {
            // If 'num' is not greater than 7, ensure it's a unique category.
            // Check if 'num' already exists in the 'list' array.
            if  ( list . indexOf ( num )  ===  -1 )
            {
                // If 'num' is not found in 'list', add it to maintain uniqueness.
                list . push ( num ) ;
            }
            // End of inner conditional block.
        }
        // End of outer conditional block.
    }
    // After processing all items, output two values:
    // 1. The count of unique categories found in 'list'.
    // 2. The total count, which is the sum of unique categories and the special category counter.
    console . log ( list . length , list . length + index ) ;
}

// The main function is invoked here, reading input from standard input.
// It uses the 'fs' module to synchronously read the file content at '/dev/stdin' as UTF-8.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;