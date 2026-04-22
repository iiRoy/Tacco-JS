var toInt = x => parseInt(x, 10); // Converts a string value to an integer with base 10

var toIntArr = arr => arr.map(x => toInt(x)); // Transforms an array of strings into an array of integers

var abs = x => x > 0 ? x : -x; /* Calculates the absolute value of the input number */

function min() {
    var rest = arguments,
        v = rest[0]; // Initialize the minimum value with the first argument

    for (var i = 1; i < rest.length; i++) {
        if (rest[i] < v) {
            v = rest[i]; // Update 'v' if a smaller value is found
        }
    }

    return v;
}

function max() {
    var rest = arguments,
        v = rest[0]; // Initialize the maximum value with the first argument

    for (var i = 1; i < rest.length; i++) {
        if (rest[i] > v) {
            v = rest[i]; // Update 'v' if a larger value is found
        }
    }

    return v;
}

function gcd() {
    var rest = arguments,
        v = rest[0],
        temp = (a, b) => b ? temp(b, a % b) : a; // Helper function for Euclidean algorithm (GCD)

    for (var i = 1; i < rest.length; i++) {
        v = temp(v, rest[i]); // Calculate GCD iteratively for all arguments
    }

    return v;
}

// The main function is called with input from standard input.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


function Main(input) {
    /*
     * Process the raw input string.
     * The input is expected to be multiple lines.
     */
    var input = input.split('\n');
    var n = toInt(input[0]); // The first line contains 'n', the number of coordinate pairs

    var xys = []; // Array to store the [x, y] coordinate pairs

    // Loop through each coordinate pair from the input
    for (var i = 0; i < n; i++) {
        xys[i] = toIntArr(input[i + 1].split(' ')); // Parse x and y coordinates for the current pair

        // Check a specific parity condition for all coordinates
        if ((xys[i][0] + xys[i][1] + xys[0][0] + xys[0][1]) % 2 !== 0) {
            console.log(-1); // If condition is not met, print -1
            return 0; // Terminate execution
        }
    }

    // Determine the parity of the sum of the first coordinate pair
    var po = (xys[0][0] + xys[0][1]) % 2;

    // If the parity is odd (1), adjust the xys array
    if (po === 1) {
        // Map over xys, reversing pairs where the first element is even
        xys = xys.map(e => e[0] % 2 === 0 ? e : e.reverse());
    }

    /*
     * Original comment block:
     * even
     * m = 10
     * di = 1*10
     * 2n -> 4:+ (10-4)/2:+,-
     * This block likely contains problem-specific notes or calculations.
     */

    var m = 20; // Initialize a base value for 'm'

    // Adjust 'm' based on the parity of the first x-coordinate
    if (xys[0][0] % 2 === 1) {
        m++;
    }

    // Adjust 'm' based on the parity of the first y-coordinate
    if (xys[0][1] % 2 === 1) {
        m++;
    }

    console.log(m); // Output the final calculated value of 'm'

    var ds = []; // Declare an array 'ds'
    ds.length = m; // Set its length to 'm'
    ds.fill(1); // Fill the array with the value 1
    ds = ds.join(' '); // Convert the array to a space-separated string
    console.log(ds); // Output the 'ds' string

    // Iterate through each coordinate pair to generate movement strings
    for (var i = 0; i < n; i++) {
        var str = ''; // Initialize an empty string for the current pair's movements
        var xy = xys[i]; // Get the current [x, y] pair

        // If x-coordinate is odd, add 'R' and increment x
        if (xy[0] % 2 === 1) {
            str += 'R';
            xy[0]++;
        }

        // If y-coordinate is odd, add 'R' and increment y
        if (xy[1] % 2 === 1) {
            str += 'R';
            xy[1]++;
        }

        // Append movement characters based on calculations
        str += ''.padEnd((10 + xy[0]) / 2, 'R');
        str += ''.padEnd((10 - xy[0]) / 2, 'L');
        str += ''.padEnd((10 + xy[1]) / 2, 'U');
        str += ''.padEnd((10 - xy[1]) / 2, 'D');

        console.log(str); // Output the generated movement string for the current pair
    }

    return 0; // Indicate successful program completion
}