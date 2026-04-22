/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact functionality and structure,
 * only varying in whitespace and comments.
 */
function Main(  input  ) { // Function definition starts here.
    // Processing the input string.
    input = input.split(  "\n"  )  ;

    // Parse the first line for the number of elements 'n'.
    var   n   =   parseInt(  input[  0  ]  )  ;

    /*
     * The second line contains space-separated numbers.
     * Splitting it into an array of strings.
     */
    tmp   =   input[  1  ]  .split(  " "  )  ;

    // Initialize an array 'a' of size 'n' with zeros.
    a = new Array(  n  )  .fill(  0  )  ;

    // Loop to populate array 'a' with integer values.
    for  (  i  =  0  ;  i  <  n  ;  i++  )  {
        a[  i  ]   =   parseInt(  tmp[  i  ]  )  ; // Convert string to integer.
    }

    // Initialize counters for odd and four-multiples.
    var   odd   =   0  ;
    var   four  =   0  ;

    // Second loop: iterate through array 'a' to count odd numbers and multiples of four.
    for  (  i  =  0  ;  i  <  n  ;  i++  )  {
        // Check if the current element is odd.
        if  (  a[  i  ]  %  2  ==  1  )  {
            odd++  ;  // Increment odd counter.
        }
        // Else, check if it's a multiple of four.
        else  if  (  a[  i  ]  %  4  ==  0  )  {
            four++  ; // Increment four-multiples counter.
        }
    }

    // Initialize the answer string.
    var   ans   =   "No"  ;

    // Logic to determine the final answer "Yes" or "No".
    // Condition 1: If there are no odd numbers.
    if  (  odd  ==  0  )  {
        ans   =   "Yes"  ;
    }
    // Condition 2: If the count of odd numbers minus multiples of four is less than or equal to zero.
    else  if  (  odd  -  four  <=  0  )  {
        ans   =   "Yes"  ;
    }
    /*
     * Condition 3: A special case for n=3.
     * If n is 3, and (odd - four) is 0 or 1, and there's at least one multiple of four.
     */
    else  if  (  n  ==  3  &&  odd  -  four  <=  1  &&  four  >  0  )  {
        ans   =   "Yes"  ;
    }

    // Output the result to the console.
    console.log(  '%s'  ,  ans  )  ; // Using printf-style formatting.
}

// Call the Main function with input read from stdin.
Main(  require(  "fs"  )  .readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ; // End of script.