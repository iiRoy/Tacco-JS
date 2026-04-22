/*
 * This is a Type I clone of the original JavaScript code.
 * It reads input, processes stack commands, and outputs results.
 * No logical or structural changes have been made.
 */

// Import the 'fs' (file system) module for reading files.
var    input      =  require   (  'fs'  )  .  readFileSync   (  '/dev/stdin'  ,    'utf8'   )   ;   // Read synchronous input from standard input

// Split the entire input string into an array of lines.
var      lines     =   input    .    split    (     '\n'     )    ;



// The first line of input represents 'n', the number of stacks.
// The unary plus operator converts the string to a number.
var        n        =    +   lines    .    shift    (    )    ;




// Initialize an array to hold 'n' empty stack arrays.
var        stacks        =        [    ]        ;
/*
 * Loop 'n' times to create 'n' individual stacks.
 * Each stack is an empty array initially.
 */
for ( var    i     =    0    ;    i    <    n    ;    i    ++    )
{
	stacks    .    push    (    [    ]    )    ; // Add an empty array to represent a new stack.
}



// Declare a variable to hold each line read from the input.
var        line        ;

/*
 * Main processing loop.
 * It continues as long as the line read is not the 'quit' command.
 * The 'lines.shift()' method removes the first element from the 'lines' array
 * and returns it, effectively processing input line by line.
 */
while  (   (   line   =   lines   .   shift   (   )   )   !=   'quit'   )
{
	// Split the current line into command parts based on spaces.
	var     command     =    line    .    split    (    ' '    )    ;

	// Check the first part of the command to determine the action.
	if    (    command    [    0    ]    ==    'pop'    )
	{
		// If the command is 'pop', pop an element from the specified stack.
		// command[1] is the stack index (1-based), so subtract 1 for 0-based array.
		var    c    =    stacks    [    command    [    1    ]    -    1    ]    .    pop    (    )    ;
		// Output the popped element to the console.
		console    .    log    (    c    )    ;
	}
	else    if    (    command    [    0    ]    ==    'push'    )
	{
		// If the command is 'push', push an element onto the specified stack.
		// command[1] is the stack index, command[2] is the value to push.
		stacks    [    command    [    1    ]    -    1    ]    .    push    (    command    [    2    ]    )    ;
	}
	else
	{
		/*
		 * If the command is neither 'pop' nor 'push', it implies a 'move' operation.
		 * This means popping from one stack and pushing to another.
		 */
		var    c    =    stacks    [    command    [    1    ]    -    1    ]    .    pop    (    )    ; // Pop from the source stack.
		stacks    [    command    [    2    ]    -    1    ]    .    push    (    c    )    ; // Push to the destination stack.
	}
}
// End of file processing.
// The program terminates once 'quit' command is encountered.