/* This is the main function that processes the input */  function   Main  (  input  )   {

      // First, split the input string by newline characters
      input   =   input.split  (  "\n"  )  ;

      /* This line seems to be part of an early, possibly incorrect, logic flow */
      const   [  n,   q  ]   =   input[0].split  (  " "  )  ;

      // Logging n and 'a' - 'a' is undefined here, indicating dead code or a typo.
      console.log  (  n,   a  )  ;


      // This 'return' statement means the code below it is unreachable in this branch.
      return  ;


      /* This input processing will not be reached due to the preceding return statement. */
      input   =   input.split  (  "\n"  )  .map  (  v   =>   v.split  (  " "  )  )  ;


      // Unreachable declaration of 'n'
      const   n   =   toInt  (  input[0][0]  )  ;

      // Unreachable declaration of 'q'
      const   q   =   toInt  (  input[0][1]  )  ;

      /* Initialize an empty string variable */
      let   str   =   ""  ;

      // This loop is unreachable and would populate 'str' with '1's if reached.
      for   (  let   i   =   0  ;   i   <   n  ;   i++  )   {
          str   +=   "1"  ;
      }


      // Convert the string of '1's into an array of characters. Still unreachable.
      str   =   str.split  (  ""  )  ;


      /* This loop would process subsequent lines of input, but is currently unreachable. */
      for   (  let   i   =   1  ;   i   <   input.length  ;   i++  )   {

          const   l   =   toInt  (  input[i][0]  )   -   1  ;
          const   r   =   toInt  (  input[i][1]  )   -   1  ;
          const   d   =   input[i][2]  ;

          let   target   =   str.map  (  (  value,   index  )   =>   {
              if   (  l   <=   index   &&   index   <=   r  )   {
                  return   d  ;
              }
              return   value  ;
          }  )  ;

          target   =   toInt  (  target.join  (  ''  )  )  ;
          console.log  (  target   %   998244353  )  ;
      }
  }


  /**
   * Helper function to convert a value to an integer.
   * @param {string} v - The value to convert.
   * @returns {number} The integer representation.
   */
  function   toInt  (  v  )   {
      // The BigInt conversion is commented out, indicating it's not currently in use.
      // return   BigInt  (  v  )  ;

      // Use parseInt with radix 10 for reliable integer conversion.
      return   parseInt  (  v,   10  )  ;
  }

  // This comment, "魔法" (magic), might indicate a special or tricky part of the code.

  /*
   * Execute the Main function with input read from standard input.
   * This is a common pattern for competitive programming in Node.js.
   */
  Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;