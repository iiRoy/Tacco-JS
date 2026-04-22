'use strict' // This line indicates strict mode for the entire script.

// The main class containing the solution logic.
class Main {

    // The primary method to solve the problem.
    solve() {

        // Read two integers, n and k, from the input.
        const nk = input.nextIntArr();
        const n = nk[0] , k = nk[1];

        // Calculate 2*k, which is a frequently used value.
        const k2 = 2 * k;

        // Process the input list of points.
        // Each element 'e' is an array [x_str, y_str, color_char].
        // x and y coordinates are normalized based on k and k2.
        const list = input.nextStrRange(n).map( e => {
            return {
                x : ( parseInt(e[0]) + ( e[2] === 'B' ? k : 0 ) ) % k2 ,
                y : parseInt(e[1]) % k2 ,
            }
        } ) ;

        // Create a CGrid instance from the processed list.
        const grid = CGrid.from(list);

        // Define a helper function to determine the "color" of a grid cell.
        // This is based on a checkerboard pattern.
        const color = (x,y) => ( x < k ? 0 : 1 ) ^ ( y < k ? 0 : 1 ) ;

        // Initialize 'count' with the number of points matching a specific color (0).
        let count = list.filter(e => color(e.x, e.y) === 0).length;

        // Initialize 'max' with the initial count. This will store the maximum count found.
        let max = count;

        // Loop through possible y-offsets (dy) from 0 to k-1.
        for (let dy = 0 ; dy < k ; ++dy) {

            // 'temp' array to store pre-calculated counts for optimization.
            const temp = [];

            // Inner loop for x-offsets (dx) from 0 to k2-1.
            for (let dx = 0 ; dx < k2 ; ++dx) {

                // Calculate a related x-coordinate for the other half of the grid.
                const dxk = dx + ( ( dx + k ) >= k2 ? -k : k ) ;

                // Update the maximum count found so far.
                max = Math.max(max, count);

                // Calculate and cache counts for the current (dx, dy) and related (dxk, dy) regions.
                // These counts represent points in a specific kxk square.
                temp[dx] = temp[dx] ? temp[dx] : grid.count(dx, dy, dx, dy + k) ;
                temp[dxk] = temp[dxk] ? temp[dxk] : grid.count(dxk, dy, dxk, dy + k) ;

                // 'wl' (white-like) count for the current column dx.
                const wl = temp[dx];
                // 'bl' (black-like) count for the current column dx.
                const bl = grid.size('x', dx) - wl;

                // 'wr' (white-like) count for the related column dxk.
                const wr = temp[dxk];
                // 'br' (black-like) count for the related column dxk.
                const br = grid.size('x', dxk) - wr;

                // Update 'count' based on the change in points when shifting.
                // This is a crucial step in the sliding window / 2D prefix sum approach.
                count += ( -wl + bl ) + ( +wr - br ) ;

            } // End of inner dx loop.

            // Skip empty rows to optimize if no points are present in the current or shifted row.
            while ( dy < k && grid.size('y',dy) === 0 && grid.size('y', dy + k) === 0 ) {
                ++dy;
            }

            // If dy reaches k, all rows have been processed or skipped.
            if (dy == k) {
                break;
            }

            // Calculate 'wl' (white-like) count for the current row dy.
            const wl = grid.count(0, dy, k, dy);
            // 'bl' (black-like) count for the current row dy.
            const bl = grid.size('y', dy) - wl;

            // 'wr' (white-like) count for the shifted row dy+k.
            const wr = grid.count(0, dy + k, k, dy + k);
            // 'br' (black-like) count for the shifted row dy+k.
            const br = grid.size('y', dy + k) - wr;

            // Update 'count' based on the change in points when shifting rows.
            count += ( -wl + bl ) + ( +wr - br ) ;

        } // End of outer dy loop.

        // Return the maximum count found.
        return max;

    }
} // End of Main class.

// A class for managing a compressed grid, useful for counting points in ranges.
class CGrid {

    // Default parameters for point coordinates.
    static get DefaultParams() {
        return ['x', 'y'];
    }

    // Default sorting keys for lists based on coordinate.
    static get DefaultSortKeys() {
        return { 'x': (a,b) => a.y - b.y , 'y': (a,b) => a.x - b.x };
    }

    // Static factory method to create and initialize a CGrid instance.
    static from(list, addParams, addSortKeys) {
        return new CGrid().init(list, addParams, addSortKeys);
    }

    // Returns the number of points at a specific coordinate 'i' for parameter 'p'.
    size(p, i) {
        return this.lists[p][i] == null ? 0 : this.lists[p][i].length;
    }

    // Initializes the CGrid with a list of points.
    init(list, addParams, addSortKeys) {

        // Handle optional parameters.
        if (addParams == null) {
            addParams = [];
        }
        if (addSortKeys == null) {
            addSortKeys = {};
        }

        // Combine default and additional parameters and sort keys.
        this.params = CGrid.DefaultParams.concat(addParams);
        this.sortKeys = Object.assign(CGrid.DefaultSortKeys, addSortKeys);

        // Initialize lists to store points grouped by coordinate.
        this.lists = {};
        this.params.forEach(p => {
            this.lists[p] = {};
        });

        // Populate lists: group points by their x and y coordinates.
        list.forEach(e => {
            this.params.forEach(p => {
                if (this.lists[p][e[p]] === undefined) {
                    this.lists[p][e[p]] = [];
                }
                this.lists[p][e[p]].push(e);
            });
        });

        // Sort the lists for efficient range queries.
        this.params.forEach(p => {
            const elements = this.lists[p];
            for (const key in elements) {
                elements[key].sort(this.sortKeys[p]);
            }
        });

        return this; // Allow method chaining.
    }

    // Retrieves a point at exact (x, y) coordinates.
    get(x, y) {
        // Use binary search to find the point.
        const i = _.binarySearch(this.lists.x[x], y, 'y');
        // Check if the point exists and matches the y-coordinate.
        if (this.lists.x[i] == null || this.lists.x[i].y !== y) {
            return null;
        }
        return this.lists.x[i];
    }

    // Counts the number of points within a given range.
    // Supports only axis-aligned ranges (x1=x2 or y1=y2).
    // The range is inclusive for the start and exclusive for the end (e.g., [x1, x2)).
    count(x1, y1, x2, y2) {

        // Case 1: Vertical line segment (x1 == x2).
        if (x1 == x2) {
            if (this.lists.x[x1] == null) return 0; // No points at this x-coordinate.
            const l = _.binarySearch(this.lists.x[x1], y1, 'y'); // Index of first point >= y1.
            const r = _.binarySearch(this.lists.x[x1], y2, 'y'); // Index of first point >= y2.
            return r - l; // Count is the difference of indices.
        }

        // Case 2: Horizontal line segment (y1 == y2).
        if (y1 == y2) {
            if (this.lists.y[y1] == null) return 0; // No points at this y-coordinate.
            const l = _.binarySearch(this.lists.y[y1], x1, 'x'); // Index of first point >= x1.
            const r = _.binarySearch(this.lists.y[y1], x2, 'x'); // Index of first point >= x2.
            return r - l; // Count is the difference of indices.
        }

        return -1; // Not supported for arbitrary rectangles.
    }

    // Retrieves some points within a given range.
    // Similar to count, only supports axis-aligned ranges.
    getSome(x1, y1, x2, y2) {

        const ret = []; // Array to store results.

        // Case 1: Vertical line segment (x1 == x2).
        if (x1 == x2) {
            if (this.lists.x[x1] == null) return ret; // No points.
            const l = _.binarySearch(this.lists.x[x1], y1, 'y');
            const r = _.binarySearch(this.lists.x[x1], y2, 'y');
            // Iterate and collect points. Note: potential bug here, should be this.lists.x[x1][x]
            for (let x = l; x < r; ++x) {
                ret.push(this.lists.y[x]);
            }
            return ret;
        }

        // Case 2: Horizontal line segment (y1 == y2).
        if (y1 == y2) {
            if (this.lists.y[y1] == null) return ret; // No points.
            const l = _.binarySearch(this.lists.y[y1], x1, 'x');
            const r = _.binarySearch(this.lists.y[y1], x2, 'x');
            // Iterate and collect points. Note: potential bug here, should be this.lists.y[y1][y]
            for (let y = l; y < r; ++y) {
                ret.push(this.lists.x[y]);
            }
            return ret;
        }

        return -1; // Not supported for arbitrary rectangles.
    }
} // End of CGrid class.


// Modulo arithmetic utility class.
class Mod {

    // Constructor, sets the modulo value.
    constructor(mod) {
        if (mod == null) {
            mod = Combinatorics.DefaultMod; // Assumes a global Combinatorics.
        }
        this.mod = mod;
    }

    // Multiplies two numbers modulo this.mod.
    // Uses binary multiplication to prevent overflow before modulo.
    mult(a, b) {
        let ret = 0;
        a %= this.mod;
        b %= this.mod;
        while (b) {
            if (b & 1) { // If b is odd.
                ret += a;
                if (ret > this.mod) {
                    ret -= this.mod; // Keep ret within [0, mod-1].
                }
            }
            a <<= 1; // Double a.
            if (a > this.mod) {
                a -= this.mod; // Keep a within [0, mod-1].
            }
            b >>= 1; // Halve b.
        }
        return ret;
    }

    // Calculates a^b modulo this.mod using binary exponentiation (exponentiation by squaring).
    pow(a, b) {
        let ret = 1;
        while (b) {
            if (b & 1) {
                ret = this.mult(ret, a); // If b is odd, multiply result by a.
            }
            a = this.mult(a, a); // Square a.
            b >>= 1; // Halve b.
        }
        return ret;
    }

    // Divides a by b modulo this.mod (a * b^(mod-2) mod mod).
    // Requires mod to be a prime number (Fermat's Little Theorem).
    div(a, b) {
        return this.mult(a, this.pow(b, this.mod - 2));
    }

    // Calculates nCk (n choose k) modulo this.mod.
    // Assumes `factTable` and `invFactTable` are pre-computed global arrays.
    comb(n, k) {
        return MOD.mult(factTable[n], MOD.mult(invFactTable[k], invFactTable[n - k]));
    }
} // End of Mod class.

// Global instance of Mod with a common prime modulo.
const MOD = new Mod(1e9 + 7);


// Utility class for common array and collection operations.
class Underscore {

    // Sums all elements in an array.
    sum(arr) {
        return arr.reduce((a,b) => a + b);
    }

    // Sums all elements modulo `mod`.
    modSum(arr, mod) {
        if (mod == null) {
            mod = MOD.mod;
        }
        return arr.reduce((a,b) => (a + b) % mod);
    }

    // Finds the minimum element in an array.
    min(arr, func) {
        if (func == null) {
            func = (a,b) => a - b;
        }
        return arr.reduce((a,b) => func(a,b) < 0 ? a : b);
    }

    // Finds the maximum element in an array.
    max(arr, func) {
        if (func == null) {
            func = (a,b) => a - b;
        }
        return arr.reduce((a,b) => func(a,b) > 0 ? a : b);
    }

    // Sorts an array in place.
    sort(arr, func) {
        if (func == null) {
            func = (a,b) => a - b;
        }
        return arr.sort(func);
    }

    // Returns a new array with unique elements. Modifies the original array during sorting.
    uniq(arr) {
        arr.sort(); // Sort to group identical elements.
        for (let i = 0 ; i < arr.length - 1 ; ++i) {
            arr[i] = arr[i + 1] == arr[i] ? null : arr[i]; // Mark duplicates as null.
        }
        return arr.filter(e => e != null); // Filter out nulls.
    }

    // Generates a sequence of numbers.
    // range(stop) -> [0, 1, ..., stop-1]
    // range(start, stop) -> [start, ..., stop-1]
    // range(start, stop, step) -> [start, start+step, ...]
    range(start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        if (!step) {
            step = stop < start ? -1 : 1;
        }
        const length = Math.max(Math.ceil((stop - start) / step), 0);
        const range = Array(length);
        for (var idx = 0 ; idx < length ; idx++ , start += step) {
            range[idx] = start;
        }
        return range;
    }

    // Gets the first element(s) of an array.
    first(array, n) {
        if (array == null || array.length < 1) return n == null ? void 0 : [];
        if (n == null) return array[0];
        return this.initial(array, array.length - n);
    }

    // Gets all but the last 'n' elements of an array.
    initial(array, n) {
        return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
    }

    // Gets all but the first 'n' elements of an array.
    tail(array, n) {
        return array.slice.call(array, n == null ? 1 : n);
    }

    // Gets the last element(s) of an array.
    last(array, n) {
        if (n == null) return array[array.length - 1];
        return this.tail(array, Math.max(0, array.length - n));
    }

    // Computes the prefix sums (cumulative sum) of an array.
    sumArray(arr) {
        return this.tail(arr.reduce(((a,b,i) => {
            a.push(b + a[i]);
            return a;
        }), [0]));
    }

    // Computes the differences between adjacent elements in an array.
    diffArray(arr) {
        const s = [];
        for (let i = 1 ; i < arr.length ; ++i) {
            s.push(arr[i] - arr[i - 1]);
        }
        return s;
    }

    // Performs a binary search on a sorted array to find the index
    // of the first element greater than or equal to `key`.
    // `iteratee` specifies which property of array elements to compare.
    binarySearch(array, key, iteratee) {
        const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
        const value = itr(key);
        let low = 0 , high = array.length;
        while (low < high) {
            let mid = ( low + high ) >> 1; // Integer division.
            if (itr(array[mid]) < value) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    }
} // End of Underscore class.

// Global instance of the Underscore utility class.
const _ = new Underscore();


// Input handler class to read data from stdin.
class Input {

    // Constructor initializes cursor and reads all input.
    constructor() {
        this.cursor = 0; // Current line number for input.
        this.inputAll(); // Read all input into memory.
    }

    // Reads all lines from standard input.
    inputAll() {
        this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
        return this.data;
    }

    /* Reads one or multiple lines of string input. */
    nextLine(n) {
        if (n) { // If 'n' is provided, read 'n' lines.
            const ret = this.data.slice(this.cursor, this.cursor + n);
            this.cursor += n;
            return ret;
        }
        // Otherwise, read a single line.
        return this.data[this.cursor++];
    }

    /* Reads a single integer. */
    nextInt() {
        return parseInt(this.nextLine());
    }

    /* Reads a line and splits it into an array of strings. */
    nextStrArr() {
        return this.nextLine().split(' ');
    }

    /* Reads a line and splits it into an array of integers. */
    nextIntArr() {
        return this.nextStrArr().map((e) => parseInt(e));
    }

    /* Reads a line and splits it into an array of floating-point numbers. */
    nextFloatArr() {
        return this.nextStrArr().map((e) => parseFloat(e));
    }

    /* Reads 'n' lines and converts each to an integer. */
    nextIntLine(n) {
        return this.nextLine(n).map((e) => parseInt(e));
    }

    /* Reads 'n' lines and converts each to a floating-point number. */
    nextFloatLine(n) {
        return this.nextLine(n).map((e) => parseFloat(e));
    }

    /* Reads 'n' lines, each split into an array of strings. */
    nextStrRange(n) {
        return this.nextLine(n).map((line) => line.split(' '));
    }

    /* Reads 'n' lines, each split into an array of integers. */
    nextIntRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
    }

    /* Reads 'n' lines, each split into an array of floating-point numbers. */
    nextFloatRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
    }
} // End of Input class.

// Global instance of the Input handler.
const input = new Input();


// Output handler class to write data to stdout.
class Out {

    // Constructor initializes options for boolean output.
    constructor() {
        this.option = {
            'true': 'Yes',
            'false': 'No',
        };
    }

    // Writes the given output to the console.
    // Handles boolean conversion to 'Yes'/'No' based on options.
    write(output) {
        let ret;
        if (output == null) return; // Do nothing if output is null or undefined.

        if (output === true) {
            ret = this.option['true'];
        } else if (output === false) {
            ret = this.option['false'];
        } else {
            ret = output; // For non-boolean values, use as is.
        }
        console.log(ret);
    }

    // Sets custom string representations for true/false.
    bool(option) {
        this.option['false'] = option[0];
        this.option['true'] = option[1];
        return this; // Allows method chaining.
    }
} // End of Out class.

// Global instance of the Out handler.
const out = new Out();

// Main execution block:
// Creates a new Main instance, calls its solve method, and writes the result.
out.write(new Main().solve());