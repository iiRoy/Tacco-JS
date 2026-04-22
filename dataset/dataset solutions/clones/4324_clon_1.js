"use strict"; /* This directive enforces strict mode parsing and execution, which helps catch common coding errors and improves security. */


const main = arg => { // The primary function named 'main' takes a single argument, typically expected to be a string.

    // The input argument string is split into an array of strings based on newline characters.
    let Info = arg . split ( "\n" ) ;

    // The first element is removed from the 'Info' array and assigned to the 'Num' variable.
    // This value might represent a count or some initial parameter from the input.
    let Num = Info . shift ( ) ;

    /*
     * This line processes the remaining elements in the 'Info' array.
     * Each element (a string) is first split by a space character.
     * Then, each resulting part is converted into a number using the multiplication by 1 trick.
     * The final result is an array of arrays, where each inner array contains numbers.
     */
    let personInfo = Info . map ( i => i . split ( " " ) . map ( x => x * 1 ) ) ;

    // A new Map object is instantiated. This will store key-value pairs, where keys are numbers and values are numbers.
    let infoMap = new Map ( ) ;

    // An empty array named 'As' is created. This array will be used to store a specific set of numbers extracted from 'personInfo'.
    let As = [ ] ;


    /*
     * The 'forEach' method is used to iterate over each sub-array within 'personInfo'.
     * For each sub-array 'x' (e.g., [key, value]):
     *   1. The first element (x[0]) is used as a key and the second element (x[1]) as its corresponding value, which are then stored in 'infoMap'.
     *   2. The first element (x[0]) is also added to the 'As' array.
     */
    personInfo . forEach ( ( x ) => {
        infoMap . set ( x [ 0 ] , x [ 1 ] ) ; // Assigns x[0] as key and x[1] as value in the map.
        As . push ( x [ 0 ] ) ;               // Adds the key (x[0]) to the 'As' array.
    } ) ;


    // Determines the maximum numeric value present in the 'As' array.
    // The spread operator (...) expands the 'As' array into individual arguments for Math.max().
    let Amax = Math . max ( ... As ) ;

    // Calculates the final answer by adding 'Amax' to the value associated with 'Amax' in the 'infoMap'.
    let ans = Amax + infoMap . get ( Amax ) ;


    // Outputs the computed 'ans' value to the console. This is typically the final result of the program.
    console . log ( ans ) ;

} ;


// This is the entry point for execution when run in a Node.js environment.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
// The read content is then passed as an argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;