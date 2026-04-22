/*
 *  This file contains the primary logic for processing
 *  a specific type of input data structure.
 *  The main entry point is the 'Main' function.
 */
function  Main  (  input  )
{

    // Step 1: Pre-process the raw input string.
    //  - Remove leading/trailing whitespace.
    //  - Split into individual lines.
    //  - For each line, split it by spaces.
    input  =
        input
            .  trim  (  )
            .  split  (  "\n"  )
            .  map  (  function  (  x  )
                {
                    return  x . split ( " " )
                }
            )
    ;


    // Declare several variables to be used throughout the function.
    // These include arrays for storing parsed data and counters.
    var  NM  =  [ ]  ;               // Stores N (number of switches) and M (number of lights).
    var  vec_p  =  [ ]  ;            // Stores the required parity for each light.
    var  vec_s  =  [ ]  ;            // Declared but unused in this specific implementation.
    var  ary_ks  =  [ ]  ;           // Stores connectivity information: for each light,
                                     //   how many switches it's connected to, and their indices.

    var  ans  =  0  ;                // Counter for valid configurations.

    var  tmpAry ,                  // Temporary array/string for binary representation.
         j ,                       // Loop counter (unused in final code, but declared).
         tmpNum ,                  // Temporary number for switch state.
         tmpSum  ;                 // Accumulator for switch states affecting a light.


    // Step 2: Parse specific parts of the pre-processed input.

    // The first line of input contains N and M.
    NM  =  input [ 0 ] . map (  e  =>  parseInt (  e ,  10  )  )  ;

    // The line after the connectivity info (NM[1]+1) contains the parity requirements (vec_p).
    vec_p  =  input [  NM [ 1 ]  +  1  ] . map (  e  =>  parseInt (  e ,  10  )  )  ;


    // Loop through the input lines to populate the 'ary_ks' array.
    // These lines represent the connectivity of switches to lights.
    for  (  var  ki  =  1  ;  ki  <=  NM [ 1 ]  ;  ki  ++  )
    {
        ary_ks . push (  input [ ki ] . map (  e  =>  parseInt (  e ,  10  )  )  )  ;
    }


    // Step 3: Main logic - Iterate through all possible switch configurations.
    // There are 2^N possible configurations.
    // We iterate from 2^N to 2^(N+1)-1 and use the binary representation.
    for  (  var  i  =  Math . pow ( 2 , NM [ 0 ] )  ;
             i  <   Math . pow ( 2 , NM [ 0 ] )  *  2  ;
             i  ++  )
    {

        // Convert the current integer 'i' to its binary string representation.
        // We use substr(1) to effectively get an N-bit string, assuming i starts at 2^N.
        tmpAry  =  i . toString ( 2 ) . substr ( 1 )  ;

        // Initialize temporary sum for the current configuration 'i'.
        tmpSum  =  0  ;


        // This labeled loop checks the conditions for each light.
        tmpAry_loop :
        for  (  var  ki  =  1  ;  ki  <=  NM [ 1 ]  ;  ki  ++  )
        {

            // For the current light 'ki', iterate through all switches connected to it.
            for  (  var  sij  =  1  ;
                     sij  <=   ary_ks [ ki - 1 ] [ 0 ]  ;
                     sij  ++  )
            {

                // Get the state (0 or 1) of the current switch from the binary string 'tmpAry'.
                tmpNum  =  parseInt (  tmpAry [ ary_ks [ ki - 1 ] [ sij ] - 1 ] ,  10  )  ;

                // Add the switch's state to the cumulative temporary sum.
                tmpSum  +=  tmpNum  ;
            }


            // After checking all switches for light 'ki',
            // verify if the parity condition is met.
            if  (  tmpSum  %  2  !=  vec_p [ ki - 1 ]  )
            {
                // If the parity is incorrect, this configuration 'i' is invalid.
                // Break out of the 'tmpAry_loop' to try the next 'i'.
                break  tmpAry_loop  ;
            }


            // If we've reached the last light (ki == M) and all previous conditions
            // were met, then this configuration 'i' is valid.
            if  (  ki  ==  NM [ 1 ]  )
            {
                // Increment the answer counter.
                ans  ++  ;
            }

        } // End of tmpAry_loop (for ki)

    } // End of main iteration loop (for i)


    // Step 4: Output the final result.
    console . log (  ans  )  ;

} // End of Main function definition.


// Immediately invoke the 'Main' function.
// It reads input synchronously from /dev/stdin using Node.js 'fs' module.
Main (
    require ( "fs" )
        .  readFileSync (
            "/dev/stdin" ,
            "utf8"
        )
) ;