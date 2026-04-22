function    detonate(  rowCoord,  colCoord,  directionIdx  )
{
    // Validate if the current cell is available for marking
    if (    gridMatrix[rowCoord][colCoord]    !==    "+"    )
    {
        return    ; // Exit if already visited or not an empty space
    }

    // Define the changes in row and column for each direction
    const    rowOffsets    =    [  -1  ,  0  ,  1  ,  0  ]    ; // Up, Right, Down, Left
    const    colOffsets    =    [  0  ,  1  ,  0  ,  -1  ]    ; // Up, Right, Down, Left

    // Calculate the coordinates of the next potential step
    let    nextRow    =    rowCoord    +    rowOffsets[directionIdx]    ;
    let    nextCol    =    colCoord    +    colOffsets[directionIdx]    ;

    // Check if the next step is outside the grid boundaries
    if  (  nextRow  <  0  ||  nextCol  <  0  ||  nextRow  >=  gridSize  ||  nextCol  >=  gridSize  )
    {
        // If out of bounds, change to the next direction and re-evaluate from current position
        directionIdx    =    (    directionIdx    +    1    )    %    4    ;
        detonate    (    rowCoord    ,    colCoord    ,    directionIdx    )    ;
    }
    else
    {
        // If the next cell is already marked as part of the path ('#')
        if  (  gridMatrix[nextRow][nextCol]    ===    "#"  )
        {
            // Unmark the cell just before the current one (backtracking logic)
            gridMatrix    [    nextRow    -    rowOffsets[directionIdx]    ]    [    nextCol    -    colOffsets[directionIdx]    ]    =    "+"    ;

            // Perform a special recursive call based on the current direction
            if  (  directionIdx    ===    3  ) // Moving Left
            {
                detonate    (    nextRow    -    2    *    rowOffsets[directionIdx]    -    1    ,    nextCol    -    2    *    colOffsets[directionIdx]    ,    0    )    ;
            }
            else    if    (    directionIdx    ===    0    ) // Moving Up
            {
                detonate    (    nextRow    -    2    *    rowOffsets[directionIdx]    ,    nextCol    -    2    *    colOffsets[directionIdx]    +    1    ,    1    )    ;
            }
            else    if    (    directionIdx    ===    1    ) // Moving Right
            {
                detonate    (    nextRow    -    2    *    rowOffsets[directionIdx]    +    1    ,    nextCol    -    2    *    colOffsets[directionIdx]    ,    2    )    ;
            }
            else    if    (    directionIdx    ===    2    ) // Moving Down
            {
                detonate    (    nextRow    -    2    *    rowOffsets[directionIdx]    ,    nextCol    -    2    *    colOffsets[directionIdx]    -    1    ,    3    )    ;
            }
        }
        else
        {
            // Mark the current cell as part of the path
            gridMatrix    [    rowCoord    ]    [    colCoord    ]    =    "#"    ;
            // Update the record of the last visited position
            finalPosition    =    [    rowCoord    ,    colCoord    ]    ;
            // Recursively call for the next step in the current direction
            detonate    (    nextRow    ,    nextCol    ,    directionIdx    )    ;
        }
    }
}


// Read raw input data from the standard input stream
const    rawData    =    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    ;

// Process the input string: trim whitespace, split into lines, and convert to numbers
let    inputLines    =    rawData    .    trim    (    )    .    split    (    "\n"    )    .    map    (    Number    )    ;

// Extract the total number of test cases from the beginning of the input
let    testCasesCount    =    inputLines    .    shift    (    )    ;

// Loop through each of the provided test cases
while    (    testCasesCount--    )
{
    // Get the grid size for the current test case
    let    gridSize    =    inputLines    .    shift    (    )    ;

    // Handle special case: a grid of size 0
    if  (  gridSize    ===    0  )
    {
        console    .    log    (    ""    )    ; // Print an empty line
        continue    ; // Move to the next test case
    }

    // Handle special case: a grid of size 1
    if  (  gridSize    ===    1  )
    {
        console    .    log    (    "#"    )    ; // Print a single hash
        continue    ; // Move to the next test case
    }

    // Handle special case: a grid of size 2
    if  (  gridSize    ===    2  )
    {
        console    .    log    (    "##\n# "    )    ; // Print the specific 2x2 pattern
        continue    ; // Move to the next test case
    }

    // Initialize the 2D grid matrix
    let    gridMatrix    =    [  ]    ;
    // Populate the grid with empty markers ('+')
    for  (  let    rowIndex    =    0    ;    rowIndex    <    gridSize    ;    rowIndex++    )
    {
        gridMatrix    [    rowIndex    ]    =    [  ]    ;
        for  (  let    colIndex    =    0    ;    colIndex    <    gridSize    ;    colIndex++    )
        {
            gridMatrix    [    rowIndex    ]    [    colIndex    ]    =    "+"    ;
        }
    }

    // Declare a variable to keep track of the last marked position
    let    finalPosition    =    [  ]    ;

    // Initiate the path generation algorithm from the bottom-left corner, facing upwards
    detonate    (    gridSize    -    1    ,    0    ,    0    )    ;

    // Apply a post-processing step for even-sized grids: unmark the final position
    if  (  gridSize    %    2    ===    0  )
    {
        gridMatrix    [    finalPosition[0]    ]    [    finalPosition[1]    ]    =    "+"    ;
    }

    // Format and print the final grid: join rows with newlines, remove commas, replace '+' with spaces
    console    .    log    (    gridMatrix    .    join    (    "\n"    )    .    replace    (    /\,/g    ,    ""    )    .    replace    (    /\+/g    ,    " "    )    )    ;
}