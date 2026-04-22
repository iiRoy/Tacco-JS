/*
 * This file contains a JavaScript function to solve a specific problem.
 * It processes input from stdin, performs calculations involving BigInts,
 * and outputs a result to stdout.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * The core logic, variable names, and expressions remain identical to the original.
 */

function   main  (  input  )
{
    // Parse the first line of input: n and k
    let  [  n,  k  ]  =  input[0].trim().split(" ").map(  i  =>  BigInt(i)  )  ;

    // Parse the second line of input: array 'a'
    let  a  =  input[1].trim().split(" ").map(  i  =>  parseInt(i)  )  ;


    // Initialize a flag array to keep track of visited elements and their step counts
    let  flag  =  [  ]  ;
    for  (  let  i  =  0  ;  i  <  n  ;  i++  )
    {
        flag[i]  =  -1  ; // -1 indicates not visited yet
        a[i]--  ;         // Adjust 'a' values to be 0-indexed
    }


    // Variables for loop detection
    let  sum  =  0  ;    // Counts steps taken
    let  now  =  0  ;    // Current position in the sequence
    let  judge  =  false  ; // Flag to indicate if a loop was found

    // Traverse the sequence until a loop is detected
    while  (  true  )
    {
        // Check if the next element (a[now]) has been visited before
        if  (  flag[a[now]]  ===  -1  )
        {
            flag[a[now]]  =  sum  ; // Mark the step count when a[now] was first reached
            sum++  ;                // Increment total steps
            now  =  a[now]  ;       // Move to the next element
        }
        else
        {
            judge  =  true  ;       // A loop has been detected
            break  ;                // Exit the loop
        }
    }


    // Calculate the length of the pre-loop part and the loop itself
    let  firstToLoop  =  BigInt(flag[a[now]])  ; // Steps to reach the start of the loop
    let  loop  =  BigInt(sum  -  flag[a[now]])  ; // Length of the detected loop

    let  ans  =  0n  ; // Initialize the answer in BigInt format

    // Determine the effective number of steps 'k' within the sequence
    if  (  (  (k  -  firstToLoop)  <  0  )  ||  (  !judge  )  )
    {
        // If k is less than the steps to reach the loop, or no loop was found
        ans  =  k  ;
    }
    else
    {
        // If k is large and a loop exists, calculate the effective steps within the loop
        ans  =  (  k  -  firstToLoop  )  %  loop  +  firstToLoop  ;
    }


    // Traverse the sequence 'ans' times to find the final position
    now  =  0  ;
    for  (  let  i  =  0  ;  i  <  ans  ;  i++  )
    {
        now  =  a[now]  ; // Move to the next element in the sequence
    }


    // Output the final position (1-indexed)
    console.log(  (  now  +  1  )  +  ""  )  ;
}

// Read input from stdin, process it, and call the main function
main(  require('fs').readFileSync(  '/dev/stdin'  ,  'utf8'  ).trim().split(  "\n"  )  )  ;