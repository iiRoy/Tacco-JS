/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - No changes to identifiers, operators, or expressions.
 * - Only whitespace and comments are altered.
 * The goal is to make it visually different while being logically identical.
 */

function   main  (  input  )
{
    // Declare and initialize the variable N from the first line of input.
    // The '-0' converts the string to a number.
    var  N  =  input[  0  ]  .  split  (  " "  )  [  0  ]  -  0  ;


    // Declare and initialize the variable M from the first line of input.
    // This represents another numerical parameter.
    var  M  =  input[  0  ]  .  split  (  " "  )  [  1  ]  -  0  ;

    // Process the second line of input:
    // 1. Split by space.
    // 2. Convert each part to a number using map(v=>v-0).
    // 3. Sort the resulting array in descending order.
    var  list  =  input  [  1  ]  .  split  (  " "  )  .  map  (  v  =>  v  -  0  )  .  sort  (  (  a  ,  b  )  =>  b  -  a  )  ;

    // Initialize the answer variable to zero.
    var  ans  =  0  ;

    // Outer loop: Iterate N times.
    // The 'start' label is used for breaking out of both loops.
    start:  for  (  var  i  =  0  ;  i  <  N  ;  i  ++  )
    {
        // Add twice the current list element to the answer.
        ans  +=  list[  i  ]  *  2  ;

        // Decrement M, indicating one operation used.
        M  --  ;

        // If M becomes zero, we've used all operations, so break.
        if  (  M  ==  0  )
        {
            break  start  ;
        }

        // Inner loop: Iterate from i+1 to N-1.
        for  (  var  j  =  i  +  1  ;  j  <  N  ;  j  ++  )
        {
            // Calculate the contribution of the pair (list[i], list[j]).
            // It's (list[i] + list[j]) multiplied by the minimum of 2 and M.
            ans  +=  (  list  [  i  ]  +  list  [  j  ]  )  *  Math  .  min  (  2  ,  M  )  ;

            // Decrement M by 2, indicating two operations used for a pair.
            M  -=  2  ;

            // If M is less than or equal to zero, we've used all operations, so break.
            if  (  M  <=  0  )
            {
                break  start  ;
            }
        }
    }

    // Output the final calculated answer to the console.
    console  .  log  (  ans  )  ;
}

// This section handles reading input from stdin and calling the main function.
// It reads the entire file, decodes it as UTF-8, and splits it by newlines.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  .  split  (  "\n"  )  )