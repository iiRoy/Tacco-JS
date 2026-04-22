var    inputRaw      =     require ( 'fs' ) . readFileSync (   '/dev/stdin' ,     'utf8'   )   ;



// This section is responsible for reading the raw input from standard input.
// The 'fs' module is used for file system operations, and readFileSync reads the file synchronously.
// '/dev/stdin' is a common path for standard input in Unix-like systems.
// 'utf8' specifies the encoding for the input data.


var     input     =     inputRaw
    .  split  (   '\n'   )    // Split the raw input string by newline characters to get individual lines.
    .  map  (   i    =>    i.split(' ')   )   ;    // For each line, split it by spaces to get an array of strings.


// After processing, 'input' will be an array of arrays, where each inner array represents a line of space-separated values.


var    robots    =    input.slice(1)    // Skip the first line of input, assuming it's header or metadata.
    .  map  (   i    =>    [   Number(i[0])   ,   Number(i[1])   ]   )   ;    // Convert the first two elements of each remaining line to numbers and store them as a pair.


// The 'robots' array now contains pairs of numbers, representing some properties of robots.


// The following block is a commented-out alternative sorting logic.
// It calculates an 'end' value for each robot based on its two properties.
// Then, it sorts robots primarily by this 'end' value.
// robots.sort((a, b) => {
//   var aEnd = a[0] + a[1] - 1;
//   var bEnd = b[0] + b[1] - 1;
//
//   if (aEnd < bEnd) {
//     return -1;
//   }
//   if (aEnd > bEnd) {
//     return 1;
//   }
//   return 0;
// });


// This is the active sorting logic. It attempts to sort robots based on a comparison
// of elements at index 'i'. Note: 'i' here is likely undefined or out of scope,
// which would lead to incorrect or unexpected sorting behavior (e.g., NaN comparison or TypeError).
// For a Type I clone, this must remain exactly as is, including the potential logical flaw.
robots . sort (   (   a   ,   b   )    =>    a [ i ]    -    b [ i ]   )   ;


// Output the sorted 'robots' array to the console for inspection.
console . log ( robots ) ;



// Initialize 'selectedRobots' with the first robot from the (potentially incorrectly) sorted 'robots' array.
var     selectedRobots     =     [   robots [ 0 ]   ]   ;


// Iterate through the 'robots' array starting from the second element.
for   (   var   i   =   1   ;   i   <   robots . length   ;   i ++   )   {

    // Get the last robot that was selected.
    var     lastSelectedRobot     =     selectedRobots [ selectedRobots . length    -    1 ]   ;


    // Calculate the 'end' point for the last selected robot.
    var     lastSelectedRobotEnd     =     lastSelectedRobot [ 0 ]    +    lastSelectedRobot [ 1 ]    -    1   ;


    // Calculate a 'start' point for the current robot being considered in the loop.
    var     start     =     robots [ i ] [ 0 ]    -    robots [ i ] [ 1 ]    +    1   ;


    // Check if the current robot's 'start' point is after or at the 'end' point of the last selected robot.
    // If it is, this robot can be selected without overlap (based on this specific problem's logic).
    if   (   lastSelectedRobotEnd    <=    start   )   {
        // Add the current robot to the list of selected robots.
        selectedRobots . push ( robots [ i ] )   ;
    }
}


// Output the final list of selected robots.
console . log ( selectedRobots ) ;


// Output the total count of selected robots.
console . log ( selectedRobots . length ) ;