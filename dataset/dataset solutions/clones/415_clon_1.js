/*
 * This JavaScript code implements a Breadth-First Search (BFS)
 * algorithm to solve a specific string transformation problem.
 * It finds the minimum number of steps to transform a given
 * string of '0', '1', '2' (or 'r', 'g', 'b' which are converted)
 * into a string where all characters are identical.
 */

// The core BFS function for finding the shortest path in a state space.
function BFS(x) {

    // 'obj' acts as a set to keep track of visited states (strings)
    // to prevent infinite loops and redundant processing.
    var obj = {};

    // 'bfs' is the queue for the BFS, storing [current_string, steps_taken].
    // It starts with the initial string 'x' and 0 steps.
    var bfs = [[x, 0]];

    // Mark the initial state 'x' as visited.
    obj[x] = true;

    // The main loop of the Breadth-First Search.
    // It continues until a solution is found or the queue is empty.
    while (true) {

        // Check if the BFS queue is empty.
        // If it is, no solution could be found from the starting state.
        if (bfs.length == 0) {
            ans = "NA"; // Assign "NA" to 'ans' indicating no solution.
            break;      // Exit the BFS loop.
        }

        // Dequeue the first element from the BFS queue.
        // 'leaf' contains the current string and the steps to reach it.
        var leaf = bfs.shift();

        // Extract the string and the count of transformations.
        var str = leaf[0];
        var cnt = leaf[1];


        // Check if the current string 'str' meets the target condition.
        // The target is a string consisting of only '0's, '1's, or '2's.
        if (/^0+$|^1+$|^2+$/.test(str)) {
            ans = cnt;  // If target reached, 'ans' is the current count.
            break;      // Exit the BFS loop as a solution is found.
        }

        // Iterate through the string to find adjacent characters.
        // We look for pairs of characters (str[i] and str[i+1]).
        for (var i = 0; i < str.length - 1; i++) {

            // If the adjacent characters are the same, no transformation is needed
            // or possible for this pair, so skip to the next pair.
            if (str[i] == str[i+1]) {
                continue;
            }

            // Convert the current string 'str' into an array of characters.
            // This allows individual characters to be modified.
            var arr = str.split("");

            // Calculate the 'color' for the transformation.
            // This logic assumes three colors (0, 1, 2) and determines the third
            // color when two are given (3 - color1 - color2).
            var color = 3 - (+arr[i]) - (+arr[i+1]);

            // Apply the new 'color' to both adjacent characters in the array.
            arr[i] = color;
            arr[i+1] = color;

            // Join the array back into a string to get the new state.
            var Str = arr.join("");

            // Check if this newly generated string state 'Str' has been visited before.
            // We use 'hasOwnProperty' for a robust check against inherited properties.
            if (obj.hasOwnProperty(Str) == false) {
                // If not visited, add it to the BFS queue with an incremented count.
                bfs.push([Str, cnt + 1]);
                // Mark this new state 'Str' as visited.
                obj[Str] = true;
            }
        }
    }
}


/*
 * This section handles input/output operations.
 * It reads input from stdin, processes each line,
 * calls the BFS function, and prints the result.
 */


// Read the entire input from standard input as a UTF-8 string.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input string,
// then split it into an array of strings based on newline characters.
var Arr = (input.trim()).split("\n");


// Loop through each line of the processed input array.
// This loop continues until a specific termination condition is met.
while (true) {

    // Get the first element (line) from the 'Arr' array and remove it.
    var rgb = Arr.shift();

    // Check if the current line is the termination signal "0".
    if (rgb == "0") {
        break; // If "0" is found, exit the input processing loop.
    }

    // Replace 'r', 'g', 'b' characters in the input string with '0', '1', '2'.
    // This converts the color representation into a numerical one for BFS.
    rgb = rgb.replace(/r/g, "0").replace(/g/g, "1").replace(/b/g, "2");

    // Declare a variable 'ans' to hold the result from the BFS function.
    // It will be assigned within the BFS function.
    var ans;

    // Call the BFS function with the converted RGB string.
    // The result will be stored in the global 'ans' variable (or 'NA').
    BFS(rgb);

    // Print the result ('ans') to the console.
    console.log(ans);
}