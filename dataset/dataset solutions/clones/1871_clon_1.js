/*
 * This JavaScript file processes numerical input to perform a specific calculation.
 * It demonstrates conditional branching using if-else if-else statements.
 */

function   main  (input)
{
    // The input string is expected to contain four space-separated numbers.
    // These numbers are parsed and assigned to variables a, b, c, and k.
    let  [  a,   b,   c,   k  ]  =  input  .  split  (  ' '  )  .  map  (  Number  )  ;

    // Check the first condition: if 'a' is large enough.
    if  (  a  >=  k  )
    {
        // If 'a' alone satisfies 'k', output 'k'.
        console  .  log  (  k  )  ;
    }
    // Check the second condition: if 'a' and 'b' combined are large enough.
    else  if  (  (  a  +  b  )  >=  k  )
    {
        // If 'a' and 'b' together satisfy 'k', output 'a'.
        // This implies 'k' is greater than 'a' but not greater than 'a + b'.
        console  .  log  (  a  )  ;
    }
    // If neither of the above conditions is met.
    else
    {
        // In this case, (a + b) is less than k.
        // The calculation is equivalent to a - (k - (a + b)), which simplifies to a + b - k.
        console  .  log  (  a  -  (  k  -  (  a  +  b  )  )  )  ;
    }
}

// The program reads its input from standard input.
// The 'fs' module is used to read the file content from '/dev/stdin'.
// The read content is decoded as UTF-8 and then any leading/trailing whitespace is removed.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  .  trim  (  )  )  ;

// End of the JavaScript program.