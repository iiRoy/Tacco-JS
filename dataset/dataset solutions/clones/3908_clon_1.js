/*
 * This JavaScript module processes numerical data.
 * It reads input, identifies two median values,
 * and then outputs a specific median based on
 * a comparison with each original data point.
 */
function Main (   input   )   {

    // Step 1: Parse the input string into individual lines.
    const   lines   =   input   .   split   (   "\n"   )   ;


    /*
     * Step 2: Extract the number of elements (N)
     * from the first line of the input.
     * N is expected to be an integer.
     */
    let N   =   parseInt   (   lines   [   0   ]   )   ;


    // Step 3: Process the second line to get the array 'a'.
    // It splits the line by spaces and converts each part to an integer.
    let a   =   lines   [   1   ]   .   split   (   " "   )   .   map   (   function   (   i   )   {

            return  parseInt   (   i   )   ;
        }
    )   ;


    // Step 4: Create a sorted copy of the array 'a'.
    // The original array 'a' remains unchanged.
    let sortedA =   a   .   slice   (   )   .   sort   (   function   (   a   ,   b   )   {
            // This anonymous function defines the sorting order (ascending).
            return  a   -   b   ;
        }
    )   ;


    // Step 5: Calculate the two median values.
    // For an even N, these are the two middle elements.
    const   med1    =   sortedA   [   N   /   2   -   1   ]   ;


    const   med2    =   sortedA   [   N   /   2   ]   ;


    // Step 6: Iterate through the original array 'a'
    // and print the determined median for each element.
    a   .   forEach   (   function   (   i   )   {
            // If 'i' is less than or equal to med1, print med2; otherwise, print med1.
            console   .   log   (   i   <=  med1    ?   med2    :   med1    )   ;
        }
    )   ;

}

// This part reads the input from standard input and calls the Main function.
Main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;