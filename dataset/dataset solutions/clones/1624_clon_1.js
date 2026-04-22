/* This is the main function that processes the input */
function    Main    (    input    )    {
  // Initialize a counter for specific conditions
  let    counter    =    0    ;

  // Split the input string into an array of lines
	let	tempArr	=	input.split(	'\n'	)	;

  /*
   * Extract the target value from the first line of the input.
   * The target is the second element after splitting by space.
   */
    let    target    =    Number    (    tempArr    [    0    ]    .    split    (    ' '    )    [    1    ]    )    ;


    // Remove the first line and store the remaining lines as coordinate strings
    let    coordinatesArr    =    tempArr    .    splice    (    1    ,    tempArr    .    length    -    1    )    ;

    // Iterate through each coordinate string
    for    (    let    i    =    0    ;    i    <    coordinatesArr    .    length    ;    i    ++    )    {

    	// Split the current coordinate string into x and y components
    	let    arr    =    coordinatesArr    [    i    ]    .    split    (    ' '    )    ;

        // Convert the x component to a number
        let    x    =    Number    (    arr    [    0    ]    )    ;
        // Convert the y component to a number
        let    y    =    Number    (    arr    [    1    ]    )    ;

      	// Calculate the Euclidean distance (magnitude) from the origin
      	let    result    =    Math    .    sqrt    (    Math    .    pow    (    x    ,    2    )    +    Math    .    pow    (    y    ,    2    )    )    ;

        // Check if the rounded distance meets or exceeds the target
        if    (    Math    .    round    (    result    )    >=    target    )    {
        	// If it does, increment the counter
        	++counter    ;
        }
    }

  	// Log the final count to the console
  	console    .    log    (    counter    )    ;
}

// Read input from standard input and pass it to the Main function
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;