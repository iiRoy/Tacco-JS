/*
 * This is a self-executing anonymous function (IIFE)
 * that defines a helper object for input parsing.
 * It's named GET and is immediately invoked.
 */
var GET = (function() {

    // Inner function 'f' acts as the public constructor for the GET object.
    function f(s) {
        return new g(s);
    }

    // Inner function 'g' is the actual constructor for the parsing instance.
    function g(s) {
        /*
         * Stores the input string 's' after trimming leading/trailing whitespace
         * and splitting it into an array of lines.
         */
        this._s = s.trim().split("\n");
        // '_y' is an internal pointer to the current line being processed.
        this._y = 0;
    }

    // Prototype methods for the 'g' object.
    g.prototype.a = function(f) {
        // 's' refers to the array of input lines.
        var s = this._s,
            // 'y' is the current line index.
            y = this._y,
            // 'r' will hold the result of the operation.
            r;

        // If the current line 's[y]' is a string, it means it hasn't been processed yet.
        if (typeof s[y] === "string") {
            // Split the line by spaces and reverse it, preparing for 'pop' operations.
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element from the current line's array.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the parsed value. If 'f' is true, return as string; otherwise, convert to number.
        return f ? r : +r;
    };

    g.prototype.l = function(f) {
        /*
         * Reads the current line, increments the line pointer,
         * and splits the line by spaces.
         */
        var s = this._s[this._y++].split(" ");
        // If 'f' is true, return as array of strings; otherwise, map to numbers.
        return f ? s : s.map(a => +a);
    };

    g.prototype.m = function(n, f) {
        /*
         * Reads 'n' lines starting from the current pointer,
         * increments the pointer by 'n', and maps each line to an array of strings.
         */
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));
        // If 'f' is true, return as 2D array of strings; otherwise, map inner arrays to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    g.prototype.r = function(n, f) {
        /*
         * Reads 'n' lines starting from the current pointer,
         * increments the pointer by 'n'.
         */
        var r = this._s.slice(this._y, this._y += n);
        // If 'f' is true, return as array of strings; otherwise, map to numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the public constructor 'f'.
    return f;
})();

// Initialize the 'o' object using the GET factory, reading input from stdin.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * Function to create a multi-dimensional array with a default value.
 * 'v' is the default value, and subsequent arguments define dimensions.
 */
function xArray(v) {
    var a = arguments,
        l = a.length,
        // Start building the 'eval' string for the innermost array.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop to build up outer array definitions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}

/*
 * Another self-executing anonymous function defining a PriorityQueue implementation.
 */
var PriorityQueue = (function() {
    // Public factory function for creating a new PriorityQueue instance.
    function f() {
        return new PriorityQueue();
    }

    // The actual constructor for the PriorityQueue.
    function PriorityQueue() {
        // The internal heap array to store elements.
        this.heap = [];
    }

    // Adds an element 'x' to the priority queue.
    PriorityQueue.prototype.push = function(x) {
        var h = this.heap, // Reference to the heap array.
            i = h.length++, // 'i' is the new element's index, then increment length.
            j; // 'j' will be the parent index.

        // Bubble up the new element to maintain heap property.
        while (i) {
            j = i - 1 >> 1; // Calculate parent index.
            if (h[j][0] <= x[0]) {
                break; // If parent is smaller or equal, correct position found.
            }
            h[i] = h[j], i = j; // Swap with parent and move up.
        }
        h[i] = x; // Place the element at its final position.
    };

    // Removes and returns the smallest element from the priority queue.
    PriorityQueue.prototype.pop = function() {
        var h = this.heap, // Reference to the heap array.
            r = h[0], // The root (smallest) element to be returned.
            x = h.pop(), // The last element, which will be re-inserted.
            l = h.length, // Current length of the heap after pop.
            i = 0, // Starting index for bubbling down.
            j; // 'j' will be the child index.

        if (l === 0) {
            return r; // If only one element was left, return it.
        }

        var k = l >> 1; // Index of the last parent node.
        l--; // Adjust 'l' to be the last valid index.

        // Bubble down the re-inserted element to maintain heap property.
        while (i < k) {
            j = (i << 1) + 1; // Calculate left child index.

            // If right child exists and is smaller than left child, choose right child.
            if (j < l && h[j + 1][0] < h[j][0]) {
                j++;
            }

            if (x[0] <= h[j][0]) {
                break; // If element is smaller or equal to smallest child, correct position found.
            }

            h[i] = h[j], i = j; // Swap with child and move down.
        }
        h[i] = x; // Place the element at its final position.
        return r; // Return the original smallest element.
    };

    // The IIFE returns the public factory function 'f'.
    return f;
})();

// Execute the main function and print its return value to the console.
console.log(main());

/*
 * The main logic function of the program.
 * It solves a specific problem involving arrays and a priority queue.
 */
function main() {
    // Read an integer 'n' from input.
    var n = o.a();
    // Read an array 'a' of integers from input.
    var a = o.l();
    // Read another array 'b' of integers from input.
    var b = o.l();

    // Initialize a new PriorityQueue instance.
    var pq = PriorityQueue();

    // Loop through the arrays to initialize the priority queue.
    for (var i = 0; i < n; i++) {
        // If elements are equal, no action needed for this index.
        if (a[i] === b[i]) {
            continue;
        }
        // If 'a[i]' is greater than 'b[i]', it's an impossible scenario.
        if (a[i] > b[i]) {
            return -1;
        }
        // Push '-b[i]' and its index 'i' into the priority queue.
        // We negate 'b[i]' because it's a min-priority queue, and we want to process larger 'b[i]' first effectively.
        pq.push([-b[i], i]);
    }

    // Initialize the answer counter.
    var ans = 0;

    // Process elements from the priority queue until it's empty.
    while (pq.heap.length) {
        // Pop the element with the highest priority (smallest -b[i], i.e., largest b[i]).
        var t = pq.pop();
        // Extract original index 'j' and original value 'x' (which was b[j]).
        var j = t[1],
            x = -t[0];

        // Calculate 'y', the sum of adjacent elements in 'b' (circularly).
        var y = b[(j + n - 1) % n] + b[(j + 1) % n];
        // Calculate 'z', the integer division of 'b[j]' by 'y'.
        var z = b[j] / y | 0;

        // If 'z' is zero, it's an impossible scenario.
        if (z === 0) {
            return -1;
        }

        // Add 'z' to the total answer.
        ans += z;
        // Update 'b[j]' by taking its modulo with 'y'.
        b[j] %= y;

        // After modification, check conditions again.
        if (a[j] === b[j]) {
            continue;
        }
        if (a[j] > b[j]) {
            return -1;
        }

        // If 'b[j]' still needs further reduction, push it back to the priority queue.
        pq.push([-b[j], j]);
    }

    // Return the final calculated answer.
    return ans;
}