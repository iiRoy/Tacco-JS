/*
 * This script processes a list of robot data from standard input.
 * It aims to find the maximum number of non-overlapping robots based on their
 * start and end points, which are derived from their initial position and range.
 */

var    inputRaw =   require('fs') . readFileSync(  '/dev/stdin'  ,   'utf8' ) ;


// Process the raw input string
var input = inputRaw
    .trim()  // Remove leading/trailing whitespace
    .split(   '\n'   ) ; // Split into an array of lines


/*
 * Transform the input lines into robot data.
 * Each robot is represented by an array [effective_start, effective_end].
 * effective_start = position - range
 * effective_end   = position + range
 */
var robots = input
        .slice(1) // Skip the first line (assumed to be a count or header)
        .map(    i => i.split(' ').map(Number)     ) // Parse each line into [position, range]
        .map(    i => [ i[0] - i[1] ,   i[0] + i[1] ]    ) ; // Calculate effective start/end

// Sort robots by their effective end points for greedy selection
robots.sort(   (a, b) => a[1] - b[1]   ) ;


// Initialize the list of selected robots with the first robot (after sorting)
var selectedRobots = [  robots[0]  ] ;


/*
 * Iterate through the remaining robots to find non-overlapping ones.
 * This is a greedy approach: always pick the robot that ends earliest
 * among those that don't overlap with the last selected robot.
 */
for (  var i = 1 ;  i < robots.length ;  i++  ) {

    var lastSelectedRobot = selectedRobots[  selectedRobots.length - 1  ] ;
    var lastSelectedRobotEnd = lastSelectedRobot[   1  ] ; // The end point of the last chosen robot

    var start = robots[i][0] ; // The start point of the current robot being considered

    // If the current robot's start is after or at the last selected robot's end,
    // it means they don't overlap, so we can select the current robot.
    if (   lastSelectedRobotEnd <= start   ) {
        selectedRobots.push(  robots[i]  ) ;
    }
}

// Output the total count of selected, non-overlapping robots.
console.log(   selectedRobots.length   ) ;