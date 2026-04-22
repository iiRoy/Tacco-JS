/*
 * This file contains JavaScript code, potentially transpiled or polyfilled.
 * It's designed to run in various environments.
 */

var $jscomp = $jscomp || {}; // Initialize $jscomp namespace if it doesn't exist
$jscomp.scope = {};          // Define a scope object within $jscomp

// Configuration flags for JavaScript compilation assumptions
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;

// Define a property on an object, handling ES5 compatibility
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ?
    Object.defineProperty : // Use native Object.defineProperty if available or assumed ES5
    function (a, b, c) {   // Fallback implementation for older environments
        // Ensure not to modify Array.prototype or Object.prototype directly
        a != Array.prototype && a != Object.prototype && (a[b] = c.value);
    };


// Utility function to get the global object (window in browser, global in Node.js)
$jscomp.getGlobal = function (a) {
    // Check for window in browser context
    return "undefined" != typeof window && window === a ?
        a :
        // Check for global in Node.js context
        "undefined" != typeof global && null != global ?
            global :
            // Fallback to the provided 'a'
            a;
};

$jscomp.global = $jscomp.getGlobal(this); // Store the determined global object


/*
 * Polyfill mechanism for adding new features to older JavaScript environments.
 * This function helps to conditionally add or update properties on global objects.
 */
$jscomp.polyfill = function (a, b, c, d) {
    // Only proceed if a polyfill implementation 'b' is provided
    if (b) {

        c = $jscomp.global; // Start traversal from the global object
        a = a.split(".");   // Split the path (e.g., "Array.from") into parts

        // Traverse the object path to find the parent object
        for (d = 0; d < a.length - 1; d++) {

            var e = a[d]; // Current path segment

            // If the segment doesn't exist, create an empty object for it
            e in c || (c[e] = {});

            c = c[e]; // Move deeper into the object structure
        }

        a = a[a.length - 1]; // Get the final property name to be polyfilled
        d = c[a];            // Get the existing value of the property (if any)

        b = b(d); // Execute the polyfill function with the existing value

        // If the polyfill returns a new value and it's different from the old one
        // and not null, define the property
        b != d && null != b &&
            $jscomp.defineProperty(c, a, { configurable: !0, writable: !0, value: b });
    }
};


// Polyfill for `Array.from` method, if it's not natively available or needs updating.
$jscomp.polyfill("Array.from", function (a) {
    // If Array.from already exists and 'a' is truthy, return it directly.
    return a ? a : function (a, c, d) {
        // If a map function 'c' is not provided, default to an identity function.
        c = null != c ? c : function (a) { return a };

        var b = [], // Initialize an empty array to store results
            f = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator]; // Check for iterator support

        // If the input 'a' is iterable (has a Symbol.iterator method)
        if ("function" == typeof f) {
            a = f.call(a); // Get the iterator object
            // Iterate through the iterator, pushing mapped values to 'b'
            for (var g = 0; !(f = a.next()).done;) b.push(c.call(d, f.value, g++));
        }
        // If not iterable, assume it's an array-like object (e.g., NodeList, arguments)
        else
            // Iterate using a traditional for loop based on length
            for (f = a.length, g = 0; g < f; g++) b.push(c.call(d, a[g], g));

        return b; // Return the new array
    }
}, "es6", "es3"); // Specify target ES version for compatibility


/*
 * Main function to process input and determine if the array is "almost sorted".
 * The condition for "almost sorted" is that at most 2 elements are out of place.
 */
function main(a) {

    // Split the input string by newlines to get individual lines.
    var b = a.split("\n");

    // Parse the first line as an integer, representing the array size.
    a = parseInt(b[0]);

    var c = []; // Initialize an empty array to store parsed numbers.

    // Split the second line by spaces to get string representations of numbers.
    b[1] = b[1].split(" ");

    // Loop through the split numbers and parse them as integers, then push to array 'c'.
    for (var d = 0; d < a; ++d) c.push(parseInt(b[1][d]));

    // Create a copy of array 'c' using the polyfilled Array.from.
    b = Array.from(c);

    b.sort(); // Sort the copied array 'b' in ascending order.

    // Log both the original (parsed) array 'c' and the sorted array 'b' to console.
    console.log(c, b);

    var e = d = 0; // Initialize two counters: 'e' for loop, 'd' for discrepancy count.

    // Compare elements of the original array 'c' with the sorted array 'b'.
    // Increment 'd' for each element that is not in its sorted position.
    for (e = 0; e < a; ++e) c[e] != b[e] && (d += 1);

    // Check if the number of discrepancies 'd' is less than or equal to 2.
    // If so, print "YES", otherwise print "NO".
    console.log(2 >= d ? "YES" : "NO")
}

// Execute the main function with input read from standard input.
// It reads the entire content of /dev/stdin as a UTF-8 string.
main(require("fs").readFileSync("/dev/stdin", "utf8"));