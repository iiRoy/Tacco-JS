/* This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * The core logic and structure remain identical.
 */
const    main   =  (  input  )  =>   {

        // Define a constant for the modulo operation. It's a BigInt.
  const  mod =   998244353n;
  // Destructure the input into the first line 'f' and the rest 'q'.
  const  [  f  ,  ...q  ]   =   input . trim (  ) . split (  '\n'  ) ;
  // Parse 'n' from the first line. The comma indicates ignoring the second part if any.
  const  [  n  ,  ]   =   f . split (  ' '  ) . map (  Number  ) ;


  const   _s   =   {  } ; // Initialize an empty object to store counts.

  // Loop through each query in 'q'.
  for  (  let   i = 0  ;   i < q . length  ;  i++   )   {
        // Parse 'a' and 'b' from the current query line.
    const  [  a  ,  b  ]   =   q [  i  ] . split (  ' '  ) . map (  Number  ) ;

    // Increment counts for numbers in the range [a, b].
    for  (  let   x = a  ;   x <= b  ;  x++   )
             _s [  x  ] ++ ; // This uses postfix increment.
  }

  // Convert the keys of _s to an array of numbers and sort them in ascending order.
  const   s   =   Array . from (  Object . keys (  _s  )  ) . sort (  (  a  ,  b  )   =>   a  -  b  ) ;


  // Initialize an array 'arr' of size n+1 with BigInt zeros.
  const   arr   =   new   Array (  n + 1  ) . fill (  0n  ) ;
  arr [  1  ]   =   1n ; // Set the second element (index 1) to 1n.

  // Main loop to calculate combinations.
  for  (  let   i = 1  ;   i < n  ;  i++   )   {
    // If arr[i] is zero, it means no path leads to 'i', so skip.
    if  (  arr [  i  ]   ===   0n  )
           continue ;

    // Iterate through the sorted 's' array.
    for  (  let   x = 0  ;   x < s . length  ;  x++   )   {
      // Convert the string key from 's' to a number 'p'.
      const   p   =   Number (  s [  x  ]  ) ;

      // If arr[i+p] exists, add arr[i] to it.
      if  (  arr [  i + p  ]   !==   undefined  )
             arr [  i + p  ]   +=   arr [  i  ] ;
      // If arr[i+p] does not exist (i.e., i+p > n), then further p values will also be out of bounds, so break.
      else
             break ;
    }
  }

  // Calculate the final result modulo 'mod' and print it to the console.
  return   console . log (  `${  (  arr [  n  ]   %   mod   +   mod  )   %   mod  }`  ) ;
} ;

// Conditional execution based on the MYTEST environment variable.
process . env . MYTEST
  ?   (  process . env . MYTEST   ===   'test'   ?   test (  )   :   main (  require (  'fs'  ) . readFileSync (  'dev/stdin'  ,  'utf8'  )  )  )
  :   main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  )  ) ; // Fallback for standard input.