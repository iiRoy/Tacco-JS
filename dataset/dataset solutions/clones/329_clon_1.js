var print = console.log; // This line assigns the console.log function to a variable named 'print' for convenience.

// This function is designed to create a closure that reads lines from a given input string.
function read_input(
    _input
) {
    // Split the entire input string into an array of lines based on the newline character.
    var lines = _input.split(
        "\n"
    );


    /*
     * Returns a function. Each call to this returned function will
     * remove and return the first element (line) from the 'lines' array.
     */
    return function() {
        return lines.shift(); // The shift() method removes the first element from an array and returns that element.
    };
}


// Extend the String prototype with a new method called 'dot'.
// This method repeats the string 'x' times.
String.prototype.dot = function dot(x) {

    var res = ""; // Initialize an empty string to accumulate the result.

    // Loop 'x' times to append the string.
    for (
        var i = 0;
        i < x;
        i++
    ) {
        res += this.toString(); // Append the current string (this) to the result.
    }

    return res; // Return the concatenated string.
};


/*
 * Function: IL (Integer List)
 * Parses a line of space-separated integers into an array of numbers.
 *
 * @param {string} line - The input string containing space-separated integers.
 * @param {boolean} min1Flg - If true, subtracts 1 from each parsed integer (for 0-indexed conversion).
 * @returns {Array<number>} An array of parsed integers.
 */
function IL(
    line,
    min1Flg
) {
    var s = line.split(' '); // Split the input line by spaces to get string representations of numbers.

    // Determine the offset based on the min1Flg.
    // If min1Flg is true, offset is -1 (to subtract 1 from each number).
    // Otherwise, offset is 0.
    var offset = min1Flg ? -1 : 0;

    var res = []; // Initialize an empty array to store the resulting integers.

    // Iterate over each string number in the 's' array.
    for (
        var i = 0;
        i < s.length;
        i++
    ) {
        res.push(parseInt(s[i])); // Convert the string to an integer and add it to the result array.
    }

    return res; // Return the array of integers.
}


/*
 * Generates an array of numbers in a specified range.
 *
 * @param {number} i - The starting number (inclusive).
 * @param {number} n - The ending number (exclusive).
 * @returns {Array<number>} An array containing numbers from i up to (but not including) n.
 */
function range(i, n) {
    var res = []; // Initialize an empty array.

    // Loop from 'i' up to 'n' (exclusive).
    for (;
        i < n;
        i++
    ) {
        res.push(i); // Add the current number to the array.
    }

    return res; // Return the populated array.
}


// Returns the maximum of two numbers.
function IMAX(x, y) {
    return x > y ? x : y; // Ternary operator to find the maximum.
}

// Returns the minimum of two numbers.
function IMIN(x, y) {
    return x < y ? x : y; // Ternary operator to find the minimum.
}


/*
 * This function is a factory for comparison functions.
 * It creates a comparator that compares objects based on a specific key.
 *
 * @param {string} x - The key name to use for comparison.
 * @returns {function(Object, Object): number} A comparison function suitable for Array.prototype.sort().
 */
function item_getter_key(x) {
    // This inner function takes two objects (a, b) and compares their properties at key 'x'.
    return function(a, b) {
        if (a[x] < b[x]) {
            return -1; // 'a' comes before 'b'
        } else if (a[x] > b[x]) {
            return 1; // 'b' comes before 'a'
        }
        return 0; // 'a' and 'b' are equal based on key 'x'
    };
}

/*

(((???????????)??? ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????

*/


// input?????\??????????????¨????????\???
// This is the main function where the program logic resides.
function Main(_input) {

    var input = read_input(_input); // input = ?????????????????¢??°
    // The 'input' variable now holds a function that reads the next line from the input.

    var N = input() - 0; // Read the first line, convert to number (subtracting 0 is a common trick for type conversion).
    // N represents the number of test cases or iterations.

    // Loop N times, once for each test case.
    for (
        var i = 0;
        i < N;
        i++
    ) {
        var out = 0; // Initialize 'out' counter (number of outs).
        var runner = 0; // Initialize 'runner' counter (number of runners on base, including batter if they got on base).
        var pt = 0; // Initialize 'pt' counter (total points/runs scored).

        // The game continues until 3 outs are made.
        while (out < 3) {
            var v = input(); // Read the next event from the input.

            // Check the type of event.
            if (v === 'HIT') {
                runner++; // A hit means a runner is added (the batter).
                // If there are 4 runners (bases loaded + batter), a run scores.
                if (runner === 4) {
                    pt++; // Increment points.
                    runner--; // One runner scores, so decrease runner count.
                }
            } else if (v === 'HOMERUN') {
                // A homerun scores all current runners plus the batter.
                pt += runner + 1;
                runner = 0; // All runners clear the bases.
            } else {
                // Any other event is an 'OUT'.
                out++; // Increment the out counter.
            }
        }
        print(pt); // After 3 outs, print the total points scored for this test case.
    }

}


//*???????????\????????¨??????????????§????????????????¨??????\????????????????????????????????????Main????????????????????????
// The following lines are for executing the Main function with input from stdin or a file.
Main(require("fs").readFileSync("/dev/stdin", "utf8")); // Reads input from standard input (for competitive programming environments).
//Main(require("fs").readFileSync("input.txt", "utf8")); // Reads input from a local file named "input.txt" (for local testing).