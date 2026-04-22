const    inputDataArray    =    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    .    split    (    '\n'    )    ;

// Extract the initial line of input which contains the coordinate values.
let    coordinateStrings    =    inputDataArray    .    shift    (    )    .    split    (    ' '    )    ;

// Parse the coordinates for the first point (P1).
const    firstXCoordinate    =    Number    (    coordinateStrings    .    shift    (    )    )    ;
const    firstYCoordinate    =    Number    (    coordinateStrings    .    shift    (    )    )    ;

// Parse the coordinates for the second point (P2).
const    secondXCoordinate    =    Number    (    coordinateStrings    .    shift    (    )    )    ;
const    secondYCoordinate    =    Number    (    coordinateStrings    .    shift    (    )    )    ;

// Compute the differences in the X and Y coordinates between P1 and P2.
const    horizontalDifference    =    firstXCoordinate    -    secondXCoordinate    ;
const    verticalDifference    =    firstYCoordinate    -    secondYCoordinate    ;

// Calculate the coordinates for the third point (P3) based on a rotation.
const    thirdPointX    =    secondXCoordinate    +    verticalDifference    ;
const    thirdPointY    =    secondYCoordinate    -    horizontalDifference    ;

// Calculate the coordinates for the fourth point (P4) using the same rotational logic.
const    fourthPointX    =    firstXCoordinate    +    verticalDifference    ;
const    fourthPointY    =    firstYCoordinate    -    horizontalDifference    ;

// Display the computed coordinates of the third and fourth points to the standard output.
console    .    log    (    '%d %d %d %d'    ,    thirdPointX    ,    thirdPointY    ,    fourthPointX    ,    fourthPointY    )    ;