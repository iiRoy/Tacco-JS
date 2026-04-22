/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered significantly to
 * create a visually distinct but functionally equivalent version.
 */
(  function    main  (   )    {

  // Entry point of the program.
  // Reads input from standard in, processes it, and prints the result.

  const   lines    =    require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )  .  trim  (  )  .  split  (  '\n'  )  ;   // Read all lines from standard input

  const   n    =    Number  (  lines  .  shift  (  )  )  ;   // The first line contains the number of elements (n)

  const   arr    =    lines  .  shift  (  )  .  split  (  ' '  )  .  map  (  Number  )  ;   // The second line contains the array elements, parse them as numbers

  // Now, we build a max-heap from the given array.
  buildMaxHeap  (  arr  ,    n  )  ;

  // After heapification, print the elements of the array,
  // preceded by a space for each element.
  console  .  log  (  arr  .  reduce  (  (  s  ,    e  )    =>    s    +=    ` ${e}`  ,    ''  )  )  ;

}  )  (   )  ;  // Immediately invoked function expression (IIFE) for main execution

/* This function takes an array and its size, then transforms it into a max-heap. */
function   buildMaxHeap  (  arr  ,    n  )    {

  /* Helper function to maintain the max-heap property for a subtree rooted at index i. */
  const   maxHeapify    =    (  i  )    =>    {

    let   left  ,    right  ,    largest  ;   // Declare variables for child indices and the largest element's index

    left    =    2    *    i    +    1  ;   // Calculate the index of the left child
    right    =    2    *    i    +    2  ;   // Calculate the index of the right child

    // Determine the largest among the current node and its left child.
    largest    =    left    <    n    &&    arr  [  left  ]    >    arr  [  i  ]    ?    left    :    i  ;

    // If the right child exists and is larger than the current 'largest', update 'largest'.
    if    (  right    <    n    &&    arr  [  right  ]    >    arr  [  largest  ]  )    largest    =    right  ;

    // If the largest element is not the current node, swap them and recursively heapify.
    if    (  largest    !=    i  )    {
      // A clever swap using array destructuring (or temporary array)
      arr  [  largest  ]    =    [  arr  [  i  ]  ,    arr  [  i  ]    =    arr  [  largest  ]  ]  [  0  ]  ;

      maxHeapify  (  largest  )  ;   // Recursively call maxHeapify on the affected subtree
    }
  }  ;

  // Build the max-heap by heapifying all non-leaf nodes from bottom-up.
  // The expression 'n << 1' is equivalent to 'n * 2', but the original used 'n << 1'
  // for '2 * i' in the next line, so this might be a typo or intended as 'floor(n/2) - 1' if it's
  // the typical heap build from last parent. However, the original code uses 'n << 1' which
  // is 'n * 2', and then goes down to 0, which is an unusual range for `buildMaxHeap`
  // but it's a Type I clone, so it must be kept exactly as is.
  for    (  let    i    =    n    <<    1  ;    i    >=    0  ;    i  --  )    maxHeapify  (  i  )  ;

}  // End of buildMaxHeap function definition