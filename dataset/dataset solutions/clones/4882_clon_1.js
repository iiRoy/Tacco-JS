function   Main   ( input   )   { /* This function processes input to find a specific pattern.
                                      * It calculates the maximum difference between an element
                                      * and the minimum element encountered so far,
                                      * and counts how many times this maximum difference occurs.
                                      */
    // First, split the entire input string by newline characters.
    input  =  input.split  (  "\n"  )  ;


    // The first line of input (`input[0]`) contains space-separated values.
    // We need to parse the first of these values.
    tmp   =   input[0] . split ( " " ) ;

    var   n   =   parseInt ( tmp[0] ) ; // 'n' represents the number of elements in the array.


    // Initialize an array 'a' of size 'n' with all elements set to 0.
    a = new   Array ( n ) . fill ( 0 ) ;

    var   max   =   0 ; /* 'max' will store the greatest difference found. */
    var   ans   =   0 ; /* 'ans' will count the occurrences of 'max'. */
    var   min   =   0 ; // 'min' tracks the smallest value seen up to the current point.


    // Iterate through the elements to process the second line of input.
    for  (  i = 0 ;  i < n ;  i++  )  {
        // Parse the current element from the second line (`input[1]`).
        a[i]   =   parseInt ( input[1] . split ( " " ) [i] ) ;

        // Check if the current element is smaller than the current minimum,
        // or if it's the very first element (i.e., 'min' hasn't been set yet).
        if  (  min > a[i]  ||  i == 0  )  {
            min = a[i] ; // Update the minimum value.
        }

        // Calculate the difference between the current element and the minimum.
        // If this difference equals the current maximum difference, increment 'ans'.
        if  (  max == a[i] - min  )  {
            ans++ ;
        }
        // If this difference is greater than the current maximum difference,
        // update 'max' and reset 'ans' to 1 (as it's a new maximum).
        else   if  (  max < a[i] - min  )  {
            ans   =   1 ;
            max   =   a[i] - min ;
        }
    }

    // Print the final calculated answer to the console.
    console.log ( '%s',   ans ) ;
}

// This line reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;