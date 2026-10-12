var n, m;
var a = [], b = [];

// The original 'search' function (iterative binary search) is replaced
// by creating a Set from array 'b' for O(1) average time lookups.
// The original 'rep' helper function is replaced by standard array methods
// like Array.from, reduce, and some.

function main() {
    // Loop through test cases, preserving the original termination condition
    while (n = scan()) {
        m = scan();

        // Populate arrays 'a' and 'b' using a declarative approach
        a = Array.from({ length: n }, () => scan());
        b = Array.from({ length: m }, () => scan());

        // Sort arrays 'a' and 'b' as required for the problem's logic
        a.sort((val1, val2) => val1 - val2);
        b.sort((val1, val2) => val1 - val2);

        // Calculate sums of elements in 'a' and 'b' using Array.prototype.reduce
        const sumA = a.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const sumB = b.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        const diff = sumB - sumA;

        // Check if the total difference is odd. If so, no integer solution exists.
        if (diff % 2 !== 0) {
            print(-1);
            continue;
        }

        const targetDiff = diff / 2; // The required value to add to an element of 'a'

        // Create a Set from array 'b' for efficient average O(1) lookups
        const bLookup = new Set(b);

        let foundPair = false; // Flag to indicate if a suitable pair has been identified

        // Iterate through array 'a' using Array.prototype.some, which allows early termination
        a.some(currentValA => {
            const requiredValB = currentValA + targetDiff;
            // Check if the 'requiredValB' exists in the 'bLookup' Set
            if (bLookup.has(requiredValB)) {
                print(`${currentValA} ${requiredValB}`); // Use template literal for output
                foundPair = true;
                return true; // Return true to stop Array.prototype.some iteration
            }
            return false; // Return false to continue Array.prototype.some iteration
        });

        // If no pair was found after checking all elements in 'a'
        if (!foundPair) {
            print(-1);
        }

        // Reset global arrays for the next test case, preserving original behavior
        a = [];
        b = [];
    }
}

// Input/Output functions are kept as they are part of the external contract
// and behavior-critical for interacting with stdin/stdout.
var input = '';

function scan() {
    return +input.pop();
}

function scan_string() {
    return input.pop();
}

function print(val) {
    console.log(val);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    input = input.trim().split(/\s+/).reverse();
    main();
});
