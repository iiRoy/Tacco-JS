/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been altered.
 */
const    main   =  (  input  )   =>   {
  // Define a string for character mapping. The '0' is a placeholder.
  const   a   =   '0abcdefghijklmnopqrstuvwxyz' ;


  // Convert the trimmed input string to a BigInt.
  let    N    =   BigInt  (  input.trim  ()  ) ;

  // Initialize an array to store the result characters.
  const   ans   =   [  ] ;


  // Loop while N is greater than zero.
  while   (  N   >   0n  )    {
    // Calculate the remainder when N is divided by 26.
    const   r   =   Number  (  N   %   26n  ) ;

    // Add the corresponding character to the beginning of the 'ans' array.
    ans.unshift  (  a  [  r  ]  ) ;

    // Update N for the next iteration.
    N   =   (  N   -   BigInt  (  r  )  )   /   26n ;
  }
  // The following line was commented out in the original,
  // and remains commented out here. It's an alternative approach
  // or a remnant of a different logic path.
  // if (N > 0n) ans.unshift(a[Number(N)])

  // Log the joined characters to the console and return the result of console.log.
  return   console.log  (  ans.join  (  ''  )  ) ;
}

// This part handles execution based on environment variable.
// If MYTEST is set, it calls test(). Otherwise, it reads from stdin
// and passes the content to the main function.
process.env.MYTEST   ?   test  ()   :   main  (  require  (  'fs'  )  .readFileSync  (  '/dev/stdin'  ,   'utf8'  )  ) ;