/* This function processes the entire input data provided.
 * It's designed to solve a specific problem. */
function    Main  (  input  )
{
    var   ans   =   'No'  ; // Initialize the answer variable. This will hold the final result.

    // The input string is processed:
    // First, leading/trailing whitespace is removed using .trim().
    // Then, it's split into an array of strings based on newline characters using .split("\n").
    // Each element of this array corresponds to a line of the original input.
    input  =  input.trim  (  )  .split  (  "\n"  )  ;

    // The first line of input (input[0]) is further processed.
    // It's split by spaces, and each part is converted to an integer using parseInt.
    // The resulting array of numbers is stored in 's'.
    s  =  input  [  0  ]  .split  (  ' '  )  .map  (  (  n  )   =>   (  parseInt  (  n  )  )  )  ;

    // Sort the array 's' in ascending order. This is crucial for the comparison logic below.
    s.sort  (  )  ;


    // Check the first set of conditions for setting 'ans' to 'Yes'.
    // Condition 1.1: If the first two elements of the sorted array are equal...
    if   (  s  [  0  ]   ===   s  [  1  ]  )
    {
        // ...and Condition 1.2: the first element is not equal to the third element.
        if   (  s  [  0  ]   !==   s  [  2  ]  )
        {
            ans   =   'Yes'  ; // If both conditions are met, set answer to 'Yes'.
        }
    }


    // Check the second set of conditions for setting 'ans' to 'Yes'.
    // Condition 2.1: If the second and third elements of the sorted array are equal...
    if   (  s  [  1  ]   ===   s  [  2  ]  )
    {
        // ...and Condition 2.2: the first element is not equal to the third element.
        if   (  s  [  0  ]   !==   s  [  2  ]  )
        {
            ans   =   'Yes'  ; // If both conditions are met, set answer to 'Yes'.
        }
    }


    // Final output of the determined answer.
    console.log  (  ans  )  ;
}

/* This line and below are part of the standard input/output handling.
 * It ensures the program can read from standard input and call the Main function.
 * Do not modify this part. */
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;