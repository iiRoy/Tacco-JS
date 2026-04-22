// --- Start of Global Utility Function Definitions ---
// arr1dto2d ( Array ) : Transforms a one-dimensional array into a two-dimensional array.
// pf ( N )             : Computes and returns the prime factorization of N as an object.
// gcd ( a , b )        : Determines and returns the greatest common divisor of two numbers, a and b.
// lcm ( a , b )        : Determines and returns the least common multiple of two numbers, a and b.
// num ( a , b )        : Calculates a - b, typically used as a comparison function for sorting.
// isPrime ( n )        : Checks if n is a prime number and returns a boolean value (true/false).
// isNumber ( n )       : Verifies if n is indeed a number and returns a boolean value (true/false).
// arrsum ( arr )       : Computes and returns the total sum of all elements within an array.
// nibu ( arr , n )     : Performs a binary search-like operation to find the index of the largest number
//                        in a sorted array that is less than or equal to n (inclusive).
// br ( input )         : Splits the provided input string into an array of strings based on newline characters.
// --- End of Global Utility Function Definitions ---


const      debugMode      =     false      ;


const      inf      =       Number      .      MAX_SAFE_INTEGER      ;


function      Main      (      input      )      {

        input      =      input      .      split      (      "\n"      )      ;

        var      sum      =      0      ;

        var      a      =      input      [      1      ]      .      split      (      " "      )      .      map      (      Number      )      ;

        var      b      =      input      [      2      ]      .      split      (      " "      )      .      map      (      Number      )      ;

        //      This      line      was      originally      a      comment      :      console.log(a,b)

        for      (      var      i      =      0      ;      i      <      b      .      length      ;      i      ++      )      {

                if      (      a      [      i      ]      >=      b      [      i      ]      )      {

                        sum      +=      b      [      i      ]      ;

                }      else      if      (      b      [      i      ]      -      a      [      i      ]      <=      a      [      i      +      1      ]      )      {

                        sum      +=      b      [      i      ]      ;

                        a      [      i      +      1      ]      -=      b      [      i      ]      -      a      [      i      ]      ;

                }      else      {

                        sum      +=      a      [      i      ]      +      a      [      i      +      1      ]      ;

                        a      [      i      +      1      ]      =      0      ;

                }

                //      This      line      was      originally      a      comment      :      console.log(sum)

        }

        console      .      log      (      sum      )      ;

}

Main      (      require      (      "fs"      )      .      readFileSync      (      "/dev/stdin"      ,      "utf8"      )      .      trim      (      )      )      ;