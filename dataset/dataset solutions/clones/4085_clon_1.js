'use strict'

// This is the main application class for solving the problem.
class Main {

    // The core logic of the application resides in the solve method.
    solve() {

        // Read two integers from input, representing n and k.
        const nk   = input.nextIntArr();
        const n    = nk[0];
        const k    = nk[1];

        // Calculate 2*k, which is a frequently used value.
        const k2   = 2 * k;

        // Process the input list of points.
        // Each element is a string array, e.g., ["1", "2", "B"].
        // Convert them into objects with x and y coordinates.
        // The coordinates are adjusted based on 'B' (black) or 'W' (white)
        // and then taken modulo k2.
        const list = input.nextStrRange(n).map( e => {
            // Return an object representing a point.
            return {
                // x-coordinate: parse integer, add k if 'B', then modulo k2.
                x: ( parseInt(e[0]) + ( e[2] === 'B' ? k : 0 ) ) % k2,
                // y-coordinate: parse integer, then modulo k2.
                y: parseInt(e[1]) % k2,
            }
        } );

        // Create a compressed grid data structure from the list of points.
        const grid = CGrid.from(list);

        // Define a helper function to determine the color of a cell (x, y).
        // 0 for white, 1 for black.
        // The pattern is a checkerboard based on k-sized squares.
        const color = (x, y) => (x < k ? 0 : 1) ^ (y < k ? 0 : 1);

        // Initialize the count of points that are white (color 0).
        let count   = list.filter(e => color(e.x, e.y) === 0).length;

        // Initialize the maximum count found so far.
        let max     = count;

        // Iterate through possible y-offsets (dy) from 0 to k-1.
        for (let dy = 0; dy < k; ++dy) {

            // Iterate through possible x-offsets (dx) from 0 to k2-1.
            for (let dx = 0; dx < k2; ++dx) {

                // Calculate dxk, which is dx shifted by k, handling wrap-around for k2.
                const dxk = dx + ( ( dx + k ) >= k2 ? -k : k );

                // Skip ahead if there are no points in the current dx column
                // or the dx+k column, for efficiency.
                while ( dx < k && grid.size('x', dx) === 0 && grid.size('x', dx + k) === 0 ) {
                    ++dx;
                }

                // Update the maximum count if the current count is higher.
                max = Math.max(max, count);

                // Calculate white points in the current dx column segment.
                const wl = grid.count(dx, dy, dx, dy + k);
                // Calculate black points in the current dx column segment.
                const bl = grid.size('x', dx) - wl;

                // Calculate white points in the dxk (shifted) column segment.
                const wr = grid.count(dxk, dy, dxk, dy + k);
                // Calculate black points in the dxk (shifted) column segment.
                const br = grid.size('x', dxk) - wr;

                // Adjust the count based on points moving in/out of the white region.
                // When a column shifts, points that were white become black, and vice versa.
                // (-wl + bl) accounts for points leaving the current dx column.
                // (+wr - br) accounts for points entering the dxk column.
                // This is a rolling sum optimization.
                count += ( -wl + bl ) + ( +wr - br );
            }

            // Skip ahead if there are no points in the current dy row
            // or the dy+k row, for efficiency.
            while ( dy < k && grid.size('y', dy) === 0 && grid.size('y', dy + k) === 0 ) {
                ++dy;
            }

            // If dy reaches k, all rows have been processed, so break.
            if (dy == k) {
                break;
            }

            // Calculate white points in the current dy row segment (0 to k).
            const wl = grid.count(0, dy, k, dy);
            // Calculate black points in the current dy row segment.
            const bl = grid.size('y', dy) - wl;

            // Calculate white points in the dy+k (shifted) row segment (0 to k).
            const wr = grid.count(0, dy + k, k, dy + k);
            // Calculate black points in the dy+k (shifted) row segment.
            const br = grid.size('y', dy + k) - wr;

            // Adjust the count based on points moving in/out of the white region due to row shift.
            count += ( -wl + bl ) + ( +wr - br );
        }

        // Return the maximum count of white points found.
        return max;
    }
}


// Compressed Grid Array
// This class stores points in a way that allows efficient querying
// for counts within rectangular regions.
class CGrid {

    // Default parameters for indexing (x and y coordinates).
    static get DefaultParams() {
        return ['x', 'y'];
    }

    // Default sorting keys for lists indexed by x or y.
    // When indexed by 'x', sort by 'y'. When indexed by 'y', sort by 'x'.
    static get DefaultSortKeys() {
        return { 'x': (a, b) => a.y - b.y, 'y': (a, b) => a.x - b.x };
    }

    // Factory method to create and initialize a CGrid instance.
    static from(list, addParams, addSortKeys) {
        return new CGrid().init(list, addParams, addSortKeys);
    }

    // Returns the number of points at a specific coordinate 'i' for a given parameter 'p'.
    // If no points exist, returns 0.
    size(p, i) {
        return this.lists[p][i] == null ? 0 : this.lists[p][i].length;
    }

    // Initializes the CGrid with a list of points.
    // addParams and addSortKeys allow extending default behavior.
    init(list, addParams, addSortKeys) {
        // Initialize optional parameters if not provided.
        if (addParams == null) {
            addParams = [];
        }
        if (addSortKeys == null) {
            addSortKeys = {};
        }

        // Combine default and additional parameters.
        this.params   = CGrid.DefaultParams.concat(addParams);
        // Merge default and additional sort keys.
        this.sortKeys = Object.assign(CGrid.DefaultSortKeys, addSortKeys);

        // Initialize lists object to store points indexed by parameters.
        this.lists    = {};
        // Create an empty object for each parameter in this.lists.
        this.params.forEach(p => {
            this.lists[p] = {};
        });

        // Populate the lists with points.
        list.forEach(e => {
            this.params.forEach(p => {
                // If a list for the current parameter value doesn't exist, create it.
                if (this.lists[p][e[p]] === undefined) {
                    this.lists[p][e[p]] = [];
                }
                // Add the point to the appropriate list.
                this.lists[p][e[p]].push(e);
            });
        });

        // Sort the lists for each parameter.
        this.params.forEach(p => {
            const elements = this.lists[p];
            // Iterate through each specific coordinate (key) for the current parameter.
            for (const key in elements) {
                // Sort the array of points at this coordinate using the defined sort key.
                elements[key].sort(this.sortKeys[p]);
            }
        });
        return this;
    }

    // Retrieves a specific point at (x, y).
    // This method seems to have a potential bug: it uses `this.lists.x[i]` instead of `this.lists.x[x]`.
    // Assuming 'x' is the coordinate for the 'x' parameter, not an index 'i'.
    get(x, y) {
        // Find the index of y in the sorted list of points at x.
        const i = _.binarySearch(this.lists.x[x], y, 'y');
        // Check if the point exists and its y-coordinate matches.
        // The original code has a potential error here, `this.lists.x[i]` should probably be `this.lists.x[x][i]`.
        // Sticking to the original code structure as per Type I clone definition.
        if (this.lists.x[i] == null || this.lists.x[i].y !== y) {
            return null;
        }
        return this.lists.x[i];
    }

    // Counts points within a rectangular region defined by [(x1,y1), (x2,y2)).
    // Note: The count method only works for axis-aligned lines (x1=x2 or y1=y2).
    // Otherwise, it returns -1.
    count(x1, y1, x2, y2) {
        // If it's a vertical line segment (x-coordinates are the same).
        if (x1 == x2) {
            // If no points exist at x1, return 0.
            if (this.lists.x[x1] == null) return 0;
            // Use binary search to find the range of points within [y1, y2).
            const l = _.binarySearch(this.lists.x[x1], y1, 'y');
            const r = _.binarySearch(this.lists.x[x1], y2, 'y');
            return r - l; // The count is the difference of indices.
        }
        // If it's a horizontal line segment (y-coordinates are the same).
        if (y1 == y2) {
            // If no points exist at y1, return 0.
            if (this.lists.y[y1] == null) return 0;
            // Use binary search to find the range of points within [x1, x2).
            const l = _.binarySearch(this.lists.y[y1], x1, 'x');
            const r = _.binarySearch(this.lists.y[y1], x2, 'x');
            return r - l; // The count is the difference of indices.
        }
        // If it's a general rectangle, this method doesn't support it, return -1.
        return -1;
    }

    // Retrieves some points within a rectangular region defined by [(x1,y1), (x2,y2)).
    // Similar to count, this method only works for axis-aligned lines.
    // It returns an array of points found.
    getSome(x1, y1, x2, y2) {
        // If it's a vertical line segment.
        if (x1 == x2) {
            const ret = [];
            // If no points exist at x1, return an empty array.
            if (this.lists.x[x1] == null) return ret;
            // Find the range of points.
            const l = _.binarySearch(this.lists.x[x1], y1, 'y');
            const r = _.binarySearch(this.lists.x[x1], y2, 'y');
            // Collect points within the range. Note: this loops over indices `x` but pushes `this.lists.y[x]`.
            // This appears to be an error in the original code, likely intended `this.lists.x[x1][x]`.
            // Adhering to Type I, replicating the exact expression.
            for (let x = l; x < r; ++x) {
                ret.push(this.lists.y[x]);
            }
            return ret;
        }
        // If it's a horizontal line segment.
        if (y1 == y2) {
            const ret = [];
            // If no points exist at y1, return an empty array.
            if (this.lists.y[y1] == null) return ret;
            // Find the range of points.
            const l = _.binarySearch(this.lists.y[y1], x1, 'x');
            const r = _.binarySearch(this.lists.y[y1], x2, 'x');
            // Collect points within the range. Note: this loops over indices `y` but pushes `this.lists.x[y]`.
            // This appears to be an error in the original code, likely intended `this.lists.y[y1][y]`.
            // Adhering to Type I, replicating the exact expression.
            for (let y = l; y < r; ++y) {
                ret.push(this.lists.x[y]);
            }
            return ret;
        }
        // If it's a general rectangle, return -1.
        return -1;
    }
}


// Class for modular arithmetic operations.
class Mod {

    // Constructor initializes the modulo value.
    constructor(mod) {
        if (mod == null) {
            // Default modulo if not specified (from an assumed Combinatorics class).
            mod = Combinatorics.DefaultMod;
        }
        this.mod = mod;
    }

    // Modular multiplication (a * b) % mod.
    // Implemented using binary multiplication to avoid overflow if a*b is very large.
    mult(a, b) {
        let ret = 0;
        a %= this.mod;
        b %= this.mod;
        while (b) {
            if (b & 1) { // If the last bit of b is 1
                ret += a;
                if (ret > this.mod) { // Keep ret within [0, mod-1]
                    ret -= this.mod;
                }
            }
            a <<= 1; // Double a
            if (a > this.mod) { // Keep a within [0, mod-1]
                a -= this.mod;
            }
            b >>= 1; // Halve b
        }
        return ret;
    }

    // Modular exponentiation (a ^ b) % mod.
    // Uses binary exponentiation (exponentiation by squaring).
    pow(a, b) {
        let ret = 1;
        while (b) {
            if (b & 1) { // If the last bit of b is 1
                ret = this.mult(ret, a);
            }
            a = this.mult(a, a); // Square a
            b >>= 1; // Halve b
        }
        return ret;
    }

    // Modular division (a / b) % mod.
    // Equivalent to (a * b^(mod-2)) % mod by Fermat's Little Theorem.
    div(a, b) {
        return this.mult(a, this.pow(b, this.mod - 2));
    }

    // Modular combination (nCk) % mod.
    // Requires precomputed factorial and inverse factorial tables.
    comb(n, k) {
        // Assumes MOD, factTable, and invFactTable are globally accessible.
        return MOD.mult(factTable[n], MOD.mult(invFactTable[k], invFactTable[n - k]));
    }
}

// Global instance of the Mod class with a common prime modulo.
const MOD = new Mod(1e9 + 7);


// Utility class providing common array manipulation and search functions.
class Underscore {

    // Calculates the sum of elements in an array.
    sum(arr) {
        return arr.reduce((a, b) => a + b);
    }

    // Calculates the modular sum of elements in an array.
    modSum(arr, mod) {
        if (mod == null) {
            mod = MOD.mod;
        }
        return arr.reduce((a, b) => (a + b) % mod);
    }

    // Finds the minimum element in an array.
    // An optional comparison function can be provided.
    min(arr, func) {
        if (func == null) {
            func = (a, b) => a - b;
        }
        return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
    }

    // Finds the maximum element in an array.
    // An optional comparison function can be provided.
    max(arr, func) {
        if (func == null) {
            func = (a, b) => a - b;
        }
        return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
    }

    // Sorts an array in-place.
    // An optional comparison function can be provided.
    sort(arr, func) {
        if (func == null) {
            func = (a, b) => a - b;
        }
        return arr.sort(func);
    }

    // Returns a new array with unique elements.
    // Modifies the original array during the process.
    uniq(arr) {
        arr.sort(); // Sort first to group duplicates.
        for (let i = 0; i < arr.length - 1; ++i) {
            // Mark duplicates as null.
            arr[i] = arr[i + 1] == arr[i] ? null : arr[i];
        }
        // Filter out nulls to get unique elements.
        return arr.filter(e => e != null);
    }

    // Generates a range of numbers.
    // Similar to Python's range function.
    range(start, stop, step) {
        if (stop == null) { // Handle (stop) case
            stop = start || 0;
            start = 0;
        }
        if (!step) { // Determine step direction if not provided.
            step = stop < start ? -1 : 1;
        }
        // Calculate length of the range.
        const length = Math.max(Math.ceil((stop - start) / step), 0);
        const range  = Array(length);
        // Populate the array.
        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }
        return range;
    }

    // Returns the first element(s) of an array.
    first(array, n) {
        if (array == null || array.length < 1) {
            return n == null ? void 0 : []; // Undefined if no n, empty array if n is specified.
        }
        if (n == null) {
            return array[0]; // Just the first element.
        }
        return this.initial(array, array.length - n); // Use initial to get first n elements.
    }

    // Returns all but the last element(s) of an array.
    initial(array, n) {
        // Slice from beginning up to (length - n) elements.
        return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
    }

    // Returns all but the first element(s) of an array.
    tail(array, n) {
        // Slice from (n) elements onwards.
        return array.slice.call(array, n == null ? 1 : n);
    }

    // Returns the last element(s) of an array.
    last(array, n) {
        if (n == null) {
            return array[array.length - 1]; // Just the last element.
        }
        return this.tail(array, Math.max(0, array.length - n)); // Use tail to get last n elements.
    }

    // Calculates the cumulative sum of an array.
    // Returns an array where each element is the sum of all preceding elements plus itself.
    sumArray(arr) {
        // Uses reduce to accumulate sums into a new array.
        return this.tail(arr.reduce(((a, b, i) => {
            a.push(b + a[i]);
            return a;
        }), [0])); // Start with 0 for the initial sum.
    }

    // Calculates the differences between adjacent elements in an array.
    diffArray(arr) {
        const s = [];
        for (let i = 1; i < arr.length; ++i) {
            s.push(arr[i] - arr[i - 1]);
        }
        return s;
    }

    // Performs a binary search on a sorted array.
    // Returns the index where 'key' would be inserted to maintain sort order.
    // 'iteratee' specifies a property name if array elements are objects.
    binarySearch(array, key, iteratee) {
        // Helper function to get the value for comparison (either primitive or object property).
        const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
        const value = itr(key); // The value to search for.

        let low  = 0;
        let high = array.length;

        while (low < high) {
            let mid = Math.floor((low + high) / 2);
            if (itr(array[mid]) < value) {
                low = mid + 1; // Value is in the upper half.
            } else {
                high = mid; // Value is in the lower half or is array[mid].
            }
        }
        return low; // Return the insertion point.
    }
}

// Global instance of the Underscore utility class.
const _ = new Underscore();


// Class for handling input from stdin.
class Input {

    // Constructor initializes the cursor and reads all input.
    constructor() {
        this.cursor = 0;
        this.inputAll();
    }

    // Reads all input from /dev/stdin and splits it by newlines.
    inputAll() {
        this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
        return this.data;
    }

    /* Retrieves one or multiple lines of input. */
    nextLine(n) {
        if (n) { // If n is provided, return n lines.
            const ret = this.data.slice(this.cursor, this.cursor + n);
            this.cursor += n;
            return ret;
        }
        // Otherwise, return a single line.
        return this.data[this.cursor++];
    }

    /* Retrieves a single integer. */
    nextInt() {
        return parseInt(this.nextLine());
    }

    /* Retrieves a line of space-separated strings as an array. */
    nextStrArr() {
        return this.nextLine().split(' ');
    }

    /* Retrieves a line of space-separated integers as an array. */
    nextIntArr() {
        return this.nextStrArr().map((e) => parseInt(e));
    }

    /* Retrieves a line of space-separated floats as an array. */
    nextFloatArr() {
        return this.nextStrArr().map((e) => parseFloat(e));
    }

    /* Retrieves N lines, each parsed as a single integer. */
    nextIntLine(n) {
        return this.nextLine(n).map((e) => parseInt(e));
    }

    /* Retrieves N lines, each parsed as a single float. */
    nextFloatLine(n) {
        return this.nextLine(n).map((e) => parseFloat(e));
    }

    /* Retrieves N lines, each split into an array of strings. */
    nextStrRange(n) {
        return this.nextLine(n).map((line) => line.split(' '));
    }

    /* Retrieves N lines, each split into an array of integers. */
    nextIntRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
    }

    /* Retrieves N lines, each split into an array of floats. */
    nextFloatRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
    }
}

// Global instance of the Input class.
const input = new Input();


// Class for handling output to stdout.
class Out {

    // Constructor initializes boolean output options.
    constructor() {
        this.option = {
            'true': 'Yes',
            'false': 'No',
        };
    }

    // Writes the given output to console.
    // Handles special cases for boolean values.
    write(output) {
        let ret;
        if (output == null) {
            return; // Do nothing if output is null or undefined.
        }
        if (output === true) {
            ret = this.option['true']; // Map true to 'Yes' or custom string.
        } else if (output === false) {
            ret = this.option['false']; // Map false to 'No' or custom string.
        } else {
            ret = output; // For other types, use the output directly.
        }
        console.log(ret);
    }

    // Sets custom strings for boolean output.
    bool(option) {
        this.option['false'] = option[0]; // Custom string for false.
        this.option['true'] = option[1]; // Custom string for true.
        return this; // Allow chaining.
    }
}

// Global instance of the Out class.
const out = new Out();

// Execute the main solution and print its result.
out.write(new Main().solve());