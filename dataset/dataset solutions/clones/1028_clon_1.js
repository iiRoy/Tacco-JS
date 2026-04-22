process . stdin . resume ( ) ;
// Resume standard input stream for data processing
process . stdin . setEncoding ( "utf8" ) ; // Set the encoding to UTF-8 for input

/*
 * Initialize readline interface to handle input/output.
 * This will allow us to read input line by line.
 */
const reader = require ( "readline" ) . createInterface ( {

  input  :  process . stdin ,   // Use standard input as the source
  output :  process . stdout  // Use standard output for any prompts (though not directly used here for prompts)

} ) ;

const lines = [ ] ; // Array to store all input lines

// Event listener for each line of input received
reader . on ( "line" , ( line ) => {
  lines . push ( line ) ; // Add the current line to our array
} ) ;


const nil = { } ; // Create a sentinel node for a circular doubly linked list
nil . after = nil ; // Initialize 'after' pointer to itself
nil . before = nil ; // Initialize 'before' pointer to itself


// Event listener for when the input stream closes
reader . on ( "close" , ( ) => {
  /*
   * The first line of input (lines[0]) is expected to be
   * the number of commands 'n'. Convert it to a number.
   */
  const n = lines [ 0 ] - 0 ;

  // Process each command from the input lines
  for ( let i = 1 ; i <= n ; i ++ )
  {
    // Split the command line into command and operand
    let [ command , operand ] = lines [ i ] . split ( " " ) ;

    // Execute actions based on the command
    switch ( command )
    {
      case "insert" :
        // Create a new node 'o'
        const o = {
          value  :  operand ,   // Store the operand as the node's value
          before :  nil ,       // New node's 'before' points to nil
          after  :  nil . after , // New node's 'after' points to the first actual node
        } ;
        nil . after . before = o ; // Update the 'before' pointer of the node that was previously first
        nil . after = o ;          // Update nil's 'after' pointer to the new node, making it the new first
        break ;

      case "delete" :
        // Iterate through the list starting from the first actual node
        for ( let c = nil . after ; nil !== c ; c = c . after )
        {
          if ( c . value === operand ) // If the current node's value matches the operand
          {
            c . before . after = c . after ; // Bypass 'c': link 'c.before' to 'c.after'
            c . after . before = c . before ; // Bypass 'c': link 'c.after' to 'c.before'
            break ; // Exit loop after deleting the first occurrence
          }
        }
        break ;

      case "deleteFirst" :
        // Remove the first actual node in the list
        nil . after = nil . after . after ; // nil's 'after' now points to the second node
        nil . after . before = nil ;        // The new first node's 'before' points to nil
        break ;

      case "deleteLast" :
        // Remove the last actual node in the list
        nil . before = nil . before . before ; // nil's 'before' now points to the second to last node
        nil . before . after = nil ;           // The new last node's 'after' points to nil
        break ;
    }
  }

  let first = true ; // Flag to handle spacing for output

  // Iterate through the circular doubly linked list (excluding nil)
  // and print the values of the nodes
  for ( let c = nil . after ; nil !== c ; c = c . after )
  {
    if ( ! first )
    {
      process . stdout . write ( " " ) ; // Add a space before subsequent elements
    }
    process . stdout . write ( c . value ) ; // Print the node's value
    first = false ; // After the first element, set flag to false
  }
  console . log ( "" ) ; // Print a newline character at the end
} ) ;