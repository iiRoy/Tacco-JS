/*
 * This script is designed to read a sequence of digits from standard input.
 * It then processes these digits by swapping '1's with '9's and vice-versa.
 * Finally, it outputs the resulting number.
 */


    var   input   =   require   (  'fs'  )  .  readFileSync   (  '/dev/stdin'  ,   'utf8'  )  ; // Obtain the raw input string from the standard input stream


    // Split the input string into an array of individual characters.
    // This allows for character-by-character processing.
    var   list   =   input  .  split   (  ''  )  ;


/*
 * The main transformation logic:
 * We iterate over each character in the 'list' array.
 * For each character 'n', we perform a conditional check.
 * If 'n', when converted to a number, is exactly 1, we return 9.
 * Otherwise (if 'n' is not 1), we return 1.
 * This effectively creates a new list where all '1's are replaced by '9's
 * and all other digits (in this specific problem context, implicitly '9's) are replaced by '1's.
 */
    var   newList   =   list  .  map   (  (  n  )   =>   {


        if   (   Number   (  n  )   ===   1   )   { // Check if the current character, as a number, is one


            return   9  ; // If it's one, replace it with nine


        }   else   { // If it's not one (assuming it's nine based on problem context)


            return   1  ; // Replace it with one


        }


    }  )  ;


// Join the processed characters back into a single string,
// then convert that string to a number, and print it to the console.
    console  .  log   (  Number   (  newList  .  join   (  ''  )  )  )  ;