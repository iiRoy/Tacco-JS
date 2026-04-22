n   =   parseInt  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'ascii'  )  )  ; // Read the input number 'n' from standard input.


// Initialize an empty array to store the numbers that satisfy the given conditions.
ary   =   [  ]  ;


// Iterate through numbers starting from 1 up to and including 'n'.
for   (   i   =   1   ;   i   <=   n   ;   i  ++   )

    // Check if the current number 'i' is either divisible by 3
    // OR if its string representation contains the digit '3'.
    if   (   i   %   3   ===   0   ||   String  (   i   )  .  indexOf  (   '3'   )   !==   -1   )

        // If the condition is met, add the number 'i' to our array.
        ary  .  push  (  i  )  ;


// After processing all numbers, print the elements of the 'ary' array,
// separated by a single space, to the console.
console  .  log  (  ary  .  join  (  " "  )  )  ;