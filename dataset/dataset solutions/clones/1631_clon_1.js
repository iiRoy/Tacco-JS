/*
 * This JavaScript program processes a string of 'W' and 'R' characters.
 * It aims to count the minimum number of swaps required to arrange all 'W's before all 'R's.
 * A swap involves exchanging the leftmost 'W' with the rightmost 'R'.
 */
function main  (  input  )
{
    // The input is expected to be a multi-line string.
    // The first line contains N (not directly used here but implied for string length),
    // and the second line contains the color string.
    input = input . split ( '\n' ) ;

    // Parse the number N from the first line, though it's not explicitly used in the logic.
    const   N   =   Number (  input  [  0  ]  )  ;

    // Convert the color string from the second line into an array of characters.
    const   colors   =   input  [  1  ]  .  split  (  ''  )  ;


    let   count   =   0  ; // Initialize a counter for the number of swaps.


    while ( true )
    {
        // Debugging line, currently commented out.
        // console.log(colors);

        // Find all indices where a 'W' is immediately followed by an 'R'.
        // These represent the "errors" in the desired sorted sequence.
        let   errors   =   findWR ( colors ) ;


        // If no 'W' followed by 'R' is found, the array is sorted, so we can exit.
        if ( errors . length === 0 )
        {
            break ;
        }

        // Locate the first occurrence of 'W' from the left.
        let   w   =   firstW ( colors ) ;

        // Locate the last occurrence of 'R' from the right.
        let   r   =   lastR ( colors ) ;

        // Perform the swap: change the leftmost 'W' to 'R' and the rightmost 'R' to 'W'.
        colors  [  w  ]  =  'R'  ;
        colors  [  r  ]  =  'W'  ;

        /*
         * The following commented block represents an alternative or previous logic
         * that might have been considered but is not active in the current implementation.
         * It might have intended to handle a specific edge case where only one error exists.
         */
        // if(errors.length === 1){
        //   count++;
        //   break;
        // }
        // let w = errors[0];
        // let r = errors[errors.length-1];
        // colors[w] = 'R';
        // colors[r+1] = 'W';

        // Increment the swap counter.
        count++;
    }


    // Output the total number of swaps performed.
    console . log ( count ) ;
}




/*
 * This utility function identifies positions where 'W' is immediately followed by 'R'.
 * Such sequences indicate an unsorted pair that needs attention.
 */
function   findWR   (   colors   )
{
    let   indices   =   [  ]  ; // Array to store the starting indices of 'WR' patterns.

    // Iterate through the array up to the second to last element.
    for ( let   i   =   0  ;   i   <   colors . length - 1  ;   i++   )
    {
        // Check for the 'W' followed by 'R' pattern.
        if ( colors  [  i  ]  ===  'W'   &&   colors  [  i+1  ]  ===  'R'  )
        {
            indices . push ( i ) ; // Store the index of 'W' in the 'WR' pair.
        }
    }

    return   indices  ; // Return all found indices.
}


// This function finds the index of the first 'W' character from the beginning of the array.
function   firstW   (   colors   )
{
    for ( let   i   =   0  ;   i   <   colors . length  ;   i++   )
    {
        if ( colors  [  i  ]  ===  'W'  )
        {
            return   i  ; // Return the index as soon as the first 'W' is found.
        }
    }
    // If no 'W' is found, the function implicitly returns undefined,
    // which should not happen if `findWR` has identified errors.
}


/*
 * This function locates the index of the last 'R' character
 * when scanning the array from the end towards the beginning.
 */
function   lastR   (   colors   )
{
    for ( let   i   =   colors . length - 1  ;   i   >=   0  ;   i--   )
    {
        if ( colors  [  i  ]  ===  'R'  )
        {
            return   i  ; // Return the index of the last 'R'.
        }
    }
    // Similar to firstW, if no 'R' is found, it implicitly returns undefined.
}


// --- Program Entry Point ---
// Read input from standard input, decode it as UTF-8, and trim any leading/trailing whitespace.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( )  )  ;