// This module processes incoming textual information
function CalculateArea(entryData) {
    // The given data is broken down into individual lines
    entryData = entryData.split("\n") ;
    // Extracting components from the very first line of the input
    let initialParts = entryData[0].split(" ") ;
    // Converting the first component into a floating-point number for calculations
    let circleRadius = parseFloat(initialParts[0]) ;
    // Outputting the computed result to the console, which is 3 * radius * radius
    console.log(3 * circleRadius * circleRadius) ;
}

// Do not modify the following section, it manages standard input/output operations
CalculateArea(  require("fs").readFileSync("/dev/stdin", "utf8")  ) ;
// Example: CalculateArea("5\n");