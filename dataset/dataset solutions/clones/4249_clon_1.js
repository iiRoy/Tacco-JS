// This JavaScript program determines if a given source string is the reverse of a target string.
// It processes input from standard input, assuming two lines of text.

   function   main   (   input   )   {
      // The 'main' function serves as the entry point for processing the input data.
      // It takes a single string 'input' which is expected to contain multiple lines.

      // First, we parse the input string to extract the source and target strings.
      const   args   =   input   .   split   (   '\n'   )   ;   // Splits the input string by newline characters into an array.


      // The first element of the 'args' array is considered the source string.
      const   src   =   args   [   0   ]   ;

      // The second element of the 'args' array is considered the target string.
      const   target   =   args   [   1   ]   ;


      // Now, we perform the core logic to check if 'src' is the reverse of 'target'.
      // This involves several steps:
      // 1. Ensure 'src' is treated as a string using String().
      // 2. Split the 'src' string into an array of individual characters.
      // 3. Reverse the order of elements in the character array.
      // 4. Join the reversed characters back into a single string.
      // 5. Compare this reversed string with the 'target' string (also ensuring it's a string).
      // 6. The result is 'YES' if they match, otherwise 'NO'.
      const   result   =   String   (   src   )   .   split   (   ''   )   .   reverse   (   )   .   join   (   ''   )   ===   String   (   target   )
         ?   'YES'
         :   'NO'
         ;


      // Finally, the determined result is printed to the console.
      console   .   log   (   result   )   ;
   }


// This part of the code is responsible for reading the input from the standard input stream
// and then invoking the 'main' function with the obtained data.
// It uses Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin' as UTF-8.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;