/*
 * This JavaScript file demonstrates a basic Node.js script
 * for reading input from standard input (stdin) and
 * performing a simple calculation.
 *
 * It's configured to run in strict mode for cleaner code practices.
 */
'use strict'   ;   // Activates strict mode for the entire script.


process  .  stdin  .  resume(  )   ;   // Keeps the Node.js process alive to listen for incoming data.


  process  .  stdin  .  setEncoding(  'utf8'  )   ;   // Configures stdin to interpret incoming bytes as UTF-8 encoded characters.


/*
 * A mutable variable to store all incoming data chunks from stdin.
 * It is initialized as an empty string and will be appended to.
 */
let   input   =   ''   ;


// Attach an event listener for the 'data' event on stdin.
// This callback function appends each received 'chunk' of data to the 'input' string.
process  .  stdin  .  on(  'data'  ,   chunk   =>   input   +=   chunk  )   ;


// Attach an event listener for the 'end' event on stdin.
// This callback executes once the input stream has finished sending data.
process  .  stdin  .  on(  'end'  ,   (  )   =>   {
  /*
   * Inside the 'end' event handler:
   * 1. The accumulated 'input' string is converted to a number using Number().
   * 2. This number is then divided by 2.
   * 3. The '>>> 0' operator performs a zero-fill right shift by 0 bits,
   *    effectively truncating the decimal part and converting the result to a 32-bit unsigned integer.
   *    This operation yields the floor of the division for positive numbers.
   */
  let   numEvens   =   (   Number(  input  )   /   2   )   >>>   0   ;

  /*
   * Finally, the script logs a computed value to the console.
   * The calculation involves 'numEvens' and the result of 'number % 2'.
   * Note: The variable 'number' here is not defined within this scope
   * or globally in the original context, which would lead to a ReferenceError
   * if this code were executed as-is. This behavior is preserved as per
   * the Type I cloning requirements.
   */
  console  .  log(   numEvens   *   (   numEvens   +   number   %   2   )   )   ;
}  )   ;