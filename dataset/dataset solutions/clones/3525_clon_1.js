let    lines    =    [ ]   ;
let    reader    =    require ( 'readline' ) .   createInterface (   {
    input  : process.stdin    ,
    output : process.stdout
}   )   ;

// This event listener processes each line of input
reader.on (   'line'   ,   function ( line ) {
    // Split the line by spaces and add it to the 'lines' array
    lines .   push (   line .   split ( " " )   )   ;
}   )   ;


// This event listener is triggered when the input stream closes
reader.on (   'close'   ,   function ( )   {
    // Check if a war happens based on the processed lines
    if    (   happensWars ( lines )   )   {
        console .   log (   "War"   )   ;
    }
    else    {
        console .   log (   "No War"   )   ;
    }
}   )   ;

/*
  Input data structure:
  - Line 1: [N, M, X, Y]
    - N: Minimum territories to control (not used in this specific logic)
    - M: Maximum territories to control (not used in this specific logic)
    - X: Current coordinate of Empire A
    - Y: Current coordinate of Empire B
  - Line 2: Array of desired coordinates for Empire A
  - Line 3: Array of desired coordinates for Empire B
*/
function happensWars (   coordinates   )   {
    // Initialize the maximum desired coordinate for Empire A to a very low value
    let    maxOfA    =    -100    ;
    // Initialize the minimum desired coordinate for Empire B to a very high value
    let    minOfB    =    100    ;

    // Extract current coordinates of Empire A and Empire B from the first line
    const    coordinateA    =    Number (   coordinates [ 0 ] [ 2 ]   )   ;
    const    coordinateB    =    Number (   coordinates [ 0 ] [ 3 ]   )   ;

    // Process desired coordinates for Empire A to find the maximum
    coordinates [ 1 ] .   map (   ( num )   =>    {
        const    coordinateX    =    Number ( num )   ;
        if    (   maxOfA    <    coordinateX   )   {
            maxOfA    =    coordinateX    ;
        }
    }   )   ;

    // Process desired coordinates for Empire B to find the minimum
    coordinates [ 2 ] .   map (   ( num )   =>    {
        const    coordinateY    =    Number ( num )   ;
        if    (   minOfB    >    coordinateY   )   {
            minOfB    =    coordinateY    ;
        }
    }   )   ;

    // Condition for war: If Empire A's max desired coordinate is at or beyond Empire B's current or min desired coordinate
    if    (   maxOfA    >=    coordinateB    ||    maxOfA    >=    minOfB   )   {
        return    true    ;
    }
    // Condition for war: If Empire B's min desired coordinate is at or below Empire A's current or max desired coordinate
    if    (   minOfB    <=    coordinateA    ||    minOfB    <=    maxOfA   )   {
        return    true    ;
    }

    // No war if neither of the above conditions is met
    return    false    ;
}