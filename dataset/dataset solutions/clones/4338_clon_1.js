function    Main (    input   )
{

    // This is the entry point of the program.
    // It processes the input to determine if a certain condition is met.

    const   Param   =   input.split ( '\n' ) [ 0 ] .split ( ' ' ) ; // Extract parameters from the first line of input.

    // Initialize variables H and W by converting the extracted parameters to integers.
    const   H   =   i ( Param [ 0 ] ) ; // Represents the height.
    const   W   =   i ( Param [ 1 ] ) ; // Represents the width.

    // Check for a specific edge case: if the width is 1.
    if  ( W == 1 )
    {
        return  console.log ( 'Yes' ) ; // If width is 1, the condition is always met.
    }


    /*
     *  This section processes the grid data from the input.
     *  It constructs an object 'Obj' where keys are characters
     *  and values are their frequencies within the grid.
     */
    const   Obj =   input
        .split  ( '\n' ) // First, split the entire input string by newline characters.
        .slice  ( 1 )    // Then, remove the first element (which contains H and W parameters).
        .join   ( '' )   // Concatenate all remaining lines into a single string.
        .split  ( '' )   // Split that single string into an array of individual characters.
        .reduce (        // Use the reduce method to count character occurrences.
            function    ( obj , c )
            {
                // If the character 'c' is not yet a property of 'obj', initialize its count to zero.
                if  ( obj [ c ] == undefined )
                {
                    obj [ c ] = 0 ;
                }

                // Increment the count for the current character.
                obj [ c ] ++ ;

                return  obj ; // Return the updated object for the next iteration.
            } ,
            {} // The initial value for the accumulator (obj) is an empty object.
        )   ;


    // Conditional logic based on the parity of H and W.

    // --- CASE 1: Both H and W are even. ---
    if  ( H % 2 == 0 && W % 2 == 0 )
    {
        // Filter characters whose counts are not multiples of 4.
        const   len =   Object.keys ( Obj )
            .filter ( function ( k ) {
                return  Obj [ k ] % 4 != 0 ; // The condition for filtering.
            } )
            .length ; // Get the number of such characters.

        // If 'len' is 0, it means all character counts are multiples of 4.
        if  ( len == 0 )
        {
            return  console.log ( 'Yes' ) ; // Output 'Yes'.
        }
        else
        {
            return  console.log ( 'No' ) ; // Otherwise, output 'No'.
        }
    }

    // --- CASE 2: Both H and W are odd. ---
    if  ( H % 2 != 0 && W % 2 != 0 )
    {
        // Calculate the sum of counts for characters whose frequencies are not multiples of 4.
        const   sum =   Object.keys ( Obj )
            .filter ( function ( k ) {
                return  Obj [ k ] % 4 != 0 ; // Filtering condition.
            } )
            .reduce ( function ( sum , key ) {
                return  sum + i ( Obj [ key ] ) ; // Accumulate the integer value of the count.
            } , 0 ) ; // Initial sum value.

        // If this accumulated sum is odd, output 'Yes'.
        if  ( sum % 2 == 1 )
        {
            return  console.log ( 'Yes' ) ;
        }
        else
        {
            return  console.log ( 'No' ) ; // Otherwise, output 'No'.
        }
    }


    // --- CASE 3: One of H or W is even, and the other is odd. ---
    // This block is executed if neither of the above 'if' conditions were met.

    const s = Object.keys(Obj)
        .filter(function (k) {
            return Obj[k] % 4 != 0; // Filter characters whose counts are not divisible by 4.
        })
        .reduce(function (sum, k) {
            return sum + i(Obj[k]); // Sum their integer counts.
        }, 0); // Initialize sum to 0.

    if (s == 0) { // If the sum 's' is 0.
        return console.log('Yes'); // Output 'Yes'.
    } else {
        return console.log('No'); // Otherwise, output 'No'.
    }
}

// Helper function to parse a string into an integer.
function    i ( x )
{
    return  parseInt ( x , 10 ) ; // Converts the input string 'x' to an integer with base 10.
}

// Main program execution point.
// Reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;