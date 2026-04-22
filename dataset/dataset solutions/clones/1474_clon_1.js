/*
 * This is a self-executing anonymous function
 * that processes input commands.
 * It simulates a stack-based operation system.
 */
( function(  input  )
{
  // Parse the input string into an array of lines.
  var    p   =    input  .  split(  '\n'  )  ;

  // The first line contains the number of arrays (n).
  var    n    =   Number  (  p  .  shift  (    )    )  ;

  // Initialize an array of arrays.
  var    array    =    [  ]  ;

  /*
   * Loop to create 'n' empty sub-arrays.
   * Each sub-array will act as a separate stack.
   */
  for  (    var    i    =    0  ;    i    <    n  ;    i  ++    )
  {
    array  [  i  ]    =    [  ]  ;
  }

  // Main command processing loop.
  // This loop continues indefinitely until a 'quit' command is received.
  while  (    true    )
  {
    // Get the next command line and split it by spaces.
    var    commands    =    p  .  shift  (    )  .  split  (  ' '  )  ;

    // Extract the command type.
    var    command    =    commands  [  0  ]  ;
    // Extract the first argument.
    var    arg1    =    commands  [  1  ]  ;
    // Extract the second argument.
    var    arg2    =    commands  [  2  ]  ;

    // Check if the command is 'quit'.
    if  (    command    ===    'quit'    )
    {
      // Exit the function.
      return  ;
    }

    // Handle 'push' command: push arg2 onto the stack at index (arg1 - 1).
    if  (    command    ===    'push'    )
    {
      array  [  Number  (  arg1  )    -    1  ]  .  push  (  arg2  )  ;
    }
    // Handle 'pop' command: pop from the stack at index (arg1 - 1) and print.
    else  if  (    command    ===    'pop'    )
    {
      console  .  log  (  array  [  Number  (  arg1  )    -    1  ]  .  pop  (    )    )  ;
    }
    // Handle 'move' command (implied, as it's the only other option):
    // pop from stack (arg1 - 1) and push to stack (arg2 - 1).
    else
    {
      // Pop value 'c' from the source stack.
      var    c    =    array  [  Number  (  arg1  )    -    1  ]  .  pop  (    )  ;
      // Push 'c' onto the destination stack.
      array  [  Number  (  arg2  )    -    1  ]  .  push  (  c  )  ;
    }
  }
} ) ( require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )  )  ;