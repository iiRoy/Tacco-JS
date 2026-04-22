// This JavaScript code processes input data based on specific rules.
// The entire input content is passed to the 'Main' function as a string.
function   Main   (   input   )   {

    // The input string is first split into an array of lines.
    // This allows access to individual lines of input.
    input   =   input . split   (   "\n"   )   ;

    // Extract the integer K from the first line of the input.
    const   K   =   parseInt   (   input[0]   ,   10   )   ;

    // The second line of input contains two space-separated integers, A and B.
    // We split this line to get these two values.
    const   tmp   =   input[1] . split   (   " "   )   ;

    // Parse A, the first integer from the second line.
    const   A   =   parseInt   (   tmp[0]   ,   10   )   ;
    // Parse B, the second integer from the second line.
    const   B   =   parseInt   (   tmp[1]   ,   10   )   ;


    // Check for a specific condition: if A is equal to B.
    // This uses a strict equality check after subtraction.
    if   (   A   -   B   ===   0   )   {
        console . log   (   'OK'   )   ; // If A and B are identical, output 'OK'.
    }
    else   {
        // If A and B are not equal, we proceed with an iteration.

        // Loop through each integer 'i' starting from A up to and including B.
        for   (   let   i   =   A   ;   i   <=   B   ;   i++   )   {
            // Inside the loop, check if the current number 'i' is perfectly divisible by K.
            if   (   i   %   K   ===   0   )   {
                console . log   (   'OK'   )   ; // If 'i' is a multiple of K, output 'OK'.
            }
            // This is an additional condition: if 'i' is the last number (B) AND B itself is divisible by K.
            // Note: The logic here might lead to 'NG' even if an earlier number was 'OK'.
            else   if   (   i   ===   B   &&   B   %   K   ===   0   )   {
                console . log   (   'NG'   )   ; // Output 'NG' under this specific, combined condition.
            }
        }
    }

}


// ******************************************************************************
// * This section is responsible for reading input and invoking the main logic.
// * It must not be altered, as per the problem's requirements for standard I/O.
// * It reads all data from standard input ('/dev/stdin') as a UTF-8 string.
// ******************************************************************************
Main   (   require   (   "fs"   )   . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;