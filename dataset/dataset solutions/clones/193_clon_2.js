var sourceData = require('fs') . readFileSync(
    '/dev/stdin' ,
    'utf8'
); // Acquire raw string data from standard input stream

// Process the raw input: remove leading/trailing whitespace,
// split into lines, and convert each line to a numerical value.
var weightList = (sourceData. trim())
    .split("\n")
    .map(Number);


// Iterate over each numerical weight obtained from the input.
weightList.forEach(  function ( currentWeightValue )  {
    // Initialize a string variable to hold the determined weight class.
    var assignedClass = "";

    // Define an array of predetermined weight class names.
    var classNamesArray = "light fly,fly,bantam,feather,light,light welter,welter,light middle,middle,light heavy,heavy"
        .split(",");

    // Determine the appropriate weight class based on the current weight value
    // using a series of conditional checks.
    if ( currentWeightValue <= 48 ) assignedClass = classNamesArray[0];
    if ( currentWeightValue > 48 ) assignedClass = classNamesArray[1];
    if ( currentWeightValue > 51 ) assignedClass = classNamesArray[2];
    if ( currentWeightValue > 54 ) assignedClass = classNamesArray[3];
    if ( currentWeightValue > 57 ) assignedClass = classNamesArray[4];
    if ( currentWeightValue > 60 ) assignedClass = classNamesArray[5];
    if ( currentWeightValue > 64 ) assignedClass = classNamesArray[6];
    if ( currentWeightValue > 69 ) assignedClass = classNamesArray[7];
    if ( currentWeightValue > 75 ) assignedClass = classNamesArray[8];
    if ( currentWeightValue > 81 ) assignedClass = classNamesArray[9];
    if ( currentWeightValue > 91 ) assignedClass = classNamesArray[10];

    // Output the determined weight class to the console.
    console.log( assignedClass );
});