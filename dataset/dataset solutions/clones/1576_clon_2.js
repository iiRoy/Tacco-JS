const dataString =   require  (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,  "utf8"  ) .  slice  (  0  ,  -1  ) .  split  (  '\n'  ) [  0  ]  ;


let sumOfDigits =    0;
/*
 * Iterate through each character of the acquired string to calculate
 * the cumulative sum of its numeric components.
 */
for
(
    let charIndex   =   0;
    charIndex   <   dataString  .  length;
    charIndex++
)
{
    sumOfDigits   +=   Number  (  dataString  [  charIndex  ]  ) ;
}

// Display the result based on whether the final sum is divisible by nine.
console.  log  (  sumOfDigits   %   9   ==   0   ?   "Yes"   :   "No"  ) ;