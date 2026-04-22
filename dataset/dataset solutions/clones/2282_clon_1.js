process.stdin.resume(); // Resumes the standard input stream to listen for data.
process.stdin.setEncoding('utf8'); // Sets the character encoding for the standard input.


var lines = []; // An array to store all lines read from input.

// Initializes a readline interface for reading input line by line.
var reader = require('readline').createInterface({
    input: process.stdin, // Specifies standard input as the source.
    output: process.stdout // Specifies standard output as the destination (though not used for prompts here).
});


// Event listener: This function is called every time a new line of input is received.
reader.on('line', (line) => {
    lines.push(line); // Adds the received line to the 'lines' array.
});


// Event listener: This function is called when the input stream ends (e.g., EOF is reached).
reader.on('close', () => {

    // Parses the first line of input as an integer, representing 'n'.
    var n = Number(lines[0]);

    // Initializes two variables 'a' and 'b' which will store permutation ranks.
    var a = 0;
    var b = 0;

    // Declares an empty array that will be populated with numbers from 1 to n.
    var array = [];

    // Processes the second line of input to get permutation 'p'.
    var p = lines[1].split(' '); // Splits the string by spaces into an array of strings.
    // Converts each string in 'p' to a number.
    p = p.map(function(str) {
        return Number(str);
    });

    // Processes the third line of input to get permutation 'q'.
    var q = lines[2].split(' '); // Splits the string by spaces into an array of strings.
    // Converts each string in 'q' to a number.
    q = q.map(function(str) {
        return Number(str);
    });


    /**
     * @function junretsu
     * @description Recursively generates all permutations (junretsu in Japanese)
     *              of 'balls' taking 'nukitorisu' elements at a time.
     * @param {Array<number>} balls - The array of elements to permute.
     * @param {number} nukitorisu - The number of elements to pick for each permutation.
     * @returns {Array<Array<number>>} An array containing all generated permutations.
     */
    function junretsu(balls, nukitorisu) {
        var arrs, i, j, zensu, results, parts;

        arrs = []; // This array will hold the final list of permutations.
        zensu = balls.length; // Total number of elements in the 'balls' array.

        // Base case: If the number of items to pick is greater than available items.
        if (zensu < nukitorisu) {
            return;
        }
        // Base case: If only one item needs to be picked, each item itself is a permutation.
        else if (nukitorisu == 1) {
            for (i = 0; i < zensu; i++) {
                arrs[i] = [balls[i]];
            }
        }
        // Recursive case: If more than one item needs to be picked.
        else {
            for (i = 0; i < zensu; i++) {
                // Create a copy of the 'balls' array to manipulate.
                parts = balls.slice(0);
                // Remove the current element at index 'i' from 'parts'.
                parts.splice(i, 1)[0];
                // Recursively call junretsu to get permutations of the remaining 'parts',
                // picking one less element.
                results = junretsu(parts, nukitorisu - 1);

                // Combine the current 'balls[i]' with each result from the recursive call.
                for (j = 0; j < results.length; j++) {
                    arrs.push([balls[i]].concat(results[j]));
                }
            }
        }
        return arrs; // Returns the array of all permutations.
    }


    // Populates the 'array' with sequential numbers from 1 to 'n'.
    for (i = 1; i <= n; i++) {
        array.push(i);
    }

    // Generates all permutations of the 'array' (numbers from 1 to n).
    var arr = junretsu(array, n);

    // Initializes a counter 'i' to track the rank of permutations.
    var i = 0;

    // Iterates through each generated permutation to find the ranks of 'p' and 'q'.
    arr.forEach(item => {

        i++; // Increments the permutation rank.

        // Compares the current permutation 'item' with 'p' using JSON.stringify for deep comparison.
        if (JSON.stringify(item) == JSON.stringify(p)) {
            a = i; // Assigns the rank 'i' to 'a' if 'item' matches 'p'.
        }

        // Compares the current permutation 'item' with 'q' using JSON.stringify for deep comparison.
        if (JSON.stringify(item) == JSON.stringify(q)) {
            b = i; // Assigns the rank 'i' to 'b' if 'item' matches 'q'.
        }
    });

    // Prints the absolute difference between the ranks of 'p' and 'q'.
    console.log(Math.abs(a - b));

}); // End of the 'close' event handler.