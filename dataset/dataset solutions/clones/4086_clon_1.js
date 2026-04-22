/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical equivalence.
 * Only whitespace and comments have been altered significantly.
 * The purpose is to demonstrate a Type I clone as per the definition.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Extensive modifications to:
 * - Indentation (inconsistent, varied)
 * - Spacing (extra spaces, removed spaces)
 * - Blank lines (added, removed)
 * - Comments (added, removed, modified)
 *
 * This version should look visually distinct but operate identically.
 */


'use strict'
class Main { // Main class definition starts here
  solve() { // The core solving method
    const nk = input.nextIntArr(); // Read N and K from input
    const n = nk[0], k = nk[1]; // Destructure N and K
    const k2 = 2 * k; // Pre-calculate 2*K for efficiency, a common optimization
    // Map input strings to an array of objects with calculated x and y coordinates.
    // The x coordinate handles 'B' color type by adding k before modulo.
    const list = input.nextStrRange(n).map(e => {
      // This lambda function processes each element 'e' from the input range.
      return { // Return a new object for each element.
        x: (parseInt(e[0]) + (e[2] === 'B' ? k : 0)) % k2, // Calculate x-coordinate, handling 'B' color.
        y: parseInt(e[1]) % k2, // Calculate y-coordinate.
      }
    });
    // Create a CGrid instance from the processed list.
    const grid = CGrid.from(list);
    // Define a helper function 'color' to determine the color based on x and y coordinates.
    // This uses XOR to determine if the cell is 'white' (0) or 'black' (1).
    const color = (x, y) => (x < k ? 0 : 1) ^ (y < k ? 0 : 1);
    let count = list.filter(e => color(e.x, e.y) === 0).length; // Initial count of 'white' cells.
    let max = count; // Initialize max with the initial count.

    // Loop through possible dy values, representing vertical shifts.
    for (let dy = 0; dy < k; ++dy) {
      // Nested loop for possible dx values, representing horizontal shifts.
      for (let dx = 0; dx < k2; ++dx) {
        // Calculate dxk, which is dx shifted by k, wrapping around k2 if necessary.
        const dxk = dx + ((dx + k) >= k2 ? -k : k);
        max = Math.max(max, count); // Update max count found so far.
        // Calculate 'white' cells in the left column (dx).
        const wl = grid.count(dx, dy, dx, dy + k);
        // Calculate 'black' cells in the left column.
        const bl = grid.size('x', dx) - wl;
        // Calculate 'white' cells in the right column (dxk).
        const wr = grid.count(dxk, dy, dxk, dy + k);
        // Calculate 'black' cells in the right column.
        const br = grid.size('x', dxk) - wr;
        // Update count based on cells moving in and out of the active window.
        // (-wl + bl) removes cells from the left column (white become black, black become white if shifted)
        // (+wr - br) adds cells from the right column
        count += (-wl + bl) + (+wr - br);
      }
      // Skip empty rows to optimize the loop.
      while (dy < k && grid.size('y', dy) === 0 && grid.size('y', dy + k) === 0) {
        ++dy; // Increment dy if current and shifted rows are empty.
      }
      if (dy == k) {
        break; // If dy reached k, break the outer loop.
      }
      // After horizontal sweep, adjust count for vertical shift.
      // Calculate 'white' cells in the top row (dy).
      const wl = grid.count(0, dy, k, dy);
      // Calculate 'black' cells in the top row.
      const bl = grid.size('y', dy) - wl;
      // Calculate 'white' cells in the bottom row (dy+k).
      const wr = grid.count(0, dy + k, k, dy + k);
      // Calculate 'black' cells in the bottom row.
      const br = grid.size('y', dy + k) - wr;
      // Update count for the vertical shift.
      count += (-wl + bl) + (+wr - br);
    }
    return max; // Return the maximum count found.
  }
}

// Compressed Grid Array class definition.
// This class provides efficient counting of points within rectangular regions.
class CGrid {
  static get DefaultParams() { // Default parameters for the grid.
    return ['x', 'y'];
  }
  static get DefaultSortKeys() { // Default sorting keys for different dimensions.
    return {
      'x': (a, b) => a.y - b.y,
      'y': (a, b) => a.x - b.x
    };
  }
  static from(list, addParams, addSortKeys) { // Static factory method to create a CGrid instance.
    return new CGrid().init(list, addParams, addSortKeys);
  }
  size(p, i) { // Get the size of a specific list for a parameter 'p' at index 'i'.
    return this.lists[p][i] == null ? 0 : this.lists[p][i].length;
  }
  init(list, addParams, addSortKeys) { // Initializes the CGrid with a list of elements.
    if (addParams == null) {
      addParams = [];
    }
    if (addSortKeys == null) {
      addSortKeys = {};
    }
    this.params = CGrid.DefaultParams.concat(addParams); // Combine default and additional parameters.
    this.sortKeys = Object.assign(CGrid.DefaultSortKeys, addSortKeys); // Combine default and additional sort keys.
    this.lists = {}; // Initialize an empty object to store lists.
    this.params.forEach(p => {
      this.lists[p] = {};
    }); // Initialize an empty object for each parameter.
    list.forEach(e => { // Iterate through the input list.
      this.params.forEach(p => { // For each parameter 'p'.
        if (this.lists[p][e[p]] === undefined) {
          this.lists[p][e[p]] = []; // If the list for this parameter and value doesn't exist, create it.
        }
        this.lists[p][e[p]].push(e); // Add the element to the corresponding list.
      });
    });
    // this.keys = {}; // Commented out: This line was probably for caching keys, but is not used.
    this.params.forEach(p => { // Iterate through each parameter again.
      const elements = this.lists[p]; // Get the elements for the current parameter.
      for (const key in elements) {
        elements[key].sort(this.sortKeys[p]);
      } // Sort each sub-list based on the defined sort key.
      // this.keys[p] = Object.keys(this.lists[p]); // Commented out: Similar to above, not used.
    });
    return this; // Return the initialized CGrid instance.
  }

  get(x, y) { // Get a specific element at (x,y).
    const i = _.binarySearch(this.lists.x[x], y, 'y'); // Use binary search to find the element.
    if (this.lists.x[i] == null || this.lists.x[i].y !== y) {
      return null;
    } // Check if the element exists and matches the y-coordinate.
    return this.lists.x[i]; // Return the found element.
  }

  // Count points within a half-open rectangle [(x1,y1),(x2,y2)).
  count(x1, y1, x2, y2) {
    if (x1 == x2) { // If it's a vertical line segment.
      if (this.lists.x[x1] == null) return 0; // No points on this x-coordinate.
      const l = _.binarySearch(this.lists.x[x1], y1, 'y'); // Find start index.
      const r = _.binarySearch(this.lists.x[x1], y2, 'y'); // Find end index.
      return r - l; // Count points in the range.
    }
    if (y1 == y2) { // If it's a horizontal line segment.
      if (this.lists.y[y1] == null) return 0; // No points on this y-coordinate.
      const l = _.binarySearch(this.lists.y[y1], x1, 'x'); // Find start index.
      const r = _.binarySearch(this.lists.y[y1], x2, 'x'); // Find end index.
      return r - l; // Count points in the range.
    }
    return -1; // Not supported for general rectangles (currently only lines).
  }

  getSome(x1, y1, x2, y2) { // Get some elements within a region.
    if (x1 == x2) { // Vertical line.
      const ret = []; // Result array.
      if (this.lists.x[x1] == null) return ret; // No points.
      const l = _.binarySearch(this.lists.x[x1], y1, 'y'); // Find start.
      const r = _.binarySearch(this.lists.x[x1], y2, 'y'); // Find end.
      for (let x = l; x < r; ++x) {
        ret.push(this.lists.y[x])
      } // Push elements to result.
      return ret;
    }
    if (y1 == y2) { // Horizontal line.
      const ret = []; // Result array.
      if (this.lists.y[y1] == null) return ret; // No points.
      const l = _.binarySearch(this.lists.y[y1], x1, 'x'); // Find start.
      const r = _.binarySearch(this.lists.y[y1], x2, 'x'); // Find end.
      for (let y = l; y < r; ++y) {
        ret.push(this.lists.x[y])
      } // Push elements to result.
      return ret;
    }
    return -1; // Not supported for general rectangles.
  }
}

// Modulo arithmetic class.
class Mod {
  constructor(mod) { // Constructor for Mod class.
    if (mod == null) {
      mod = Combinatorics.DefaultMod;
    } // Use default mod if not provided.
    this.mod = mod; // Store the modulo value.
  }
  mult(a, b) { // Modular multiplication (a * b) % mod.
    let ret = 0; // Initialize return value.
    a %= this.mod; // Reduce a modulo mod.
    b %= this.mod; // Reduce b modulo mod.
    while (b) { // Loop while b is not zero.
      if (b & 1) { // If b is odd.
        ret += a; // Add a to ret.
        if (ret > this.mod) {
          ret -= this.mod;
        } // Keep ret within modulo range.
      }
      a <<= 1; // Double a.
      if (a > this.mod) {
        a -= this.mod;
      } // Keep a within modulo range.
      b >>= 1; // Halve b.
    }
    return ret; // Return the result.
  }
  pow(a, b) { // Modular exponentiation (a^b) % mod.
    let ret = 1; // Initialize result to 1.
    while (b) { // Loop while b is not zero.
      if (b & 1) {
        ret = this.mult(ret, a);
      } // If b is odd, multiply ret by a.
      a = this.mult(a, a); // Square a.
      b >>= 1; // Halve b.
    }
    return ret; // Return the result.
  }
  div(a, b) {
    return this.mult(a, this.pow(b, this.mod - 2))
  } // Modular division (a / b) % mod using Fermat's Little Theorem.
  comb(n, k) {
    return MOD.mult(factTable[n], MOD.mult(invFactTable[k], invFactTable[n - k]));
  } // Modular combination (nCk).
}
const MOD = new Mod(1e9 + 7); // Create a global MOD instance with a common prime modulo.

// Underscore-like utility class.
class Underscore {
  sum(arr) {
    return arr.reduce((a, b) => a + b);
  } // Sum of array elements.
  modSum(arr, mod) {
    if (mod == null) {
      mod = MOD.mod;
    }
    return arr.reduce((a, b) => (a + b) % mod);
  } // Modular sum of array elements.
  min(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
  } // Minimum element in an array.
  max(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
  } // Maximum element in an array.
  sort(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.sort(func)
  } // Sort an array.
  uniq(arr) {
    arr.sort(); // Sort for uniqueness detection.
    for (let i = 0; i < arr.length - 1; ++i) {
      arr[i] = arr[i + 1] == arr[i] ? null : arr[i]; // Mark duplicates as null.
    }
    return arr.filter(e => e != null); // Filter out nulls.
  }
  range(start, stop, step) { // Generate a range of numbers.
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    } // Determine step direction.
    const length = Math.max(Math.ceil((stop - start) / step), 0); // Calculate length.
    const range = Array(length); // Create array.
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    } // Populate array.
    return range;
  }
  first(array, n) { // Get the first 'n' elements or the first element.
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.initial(array, array.length - n);
  };
  initial(array, n) {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  } // Get all but the last 'n' elements.
  tail(array, n) {
    return array.slice.call(array, n == null ? 1 : n);
  } // Get all but the first 'n' elements.
  last(array, n) {
    if (n == null) return array[array.length - 1];
    return this.tail(array, Math.max(0, array.length - n));
  } // Get the last 'n' elements or the last element.
  sumArray(arr) {
    return this.tail(arr.reduce(((a, b, i) => {
      a.push(b + a[i]);
      return a
    }), [0]));
  } // Calculate cumulative sum.
  diffArray(arr) {
    const s = [];
    for (let i = 1; i < arr.length; ++i) {
      s.push(arr[i] - arr[i - 1]);
    }
    return s;
  } // Calculate differences between adjacent elements.
  // binarySearch: Returns the index of the first element in `array` that is greater than or equal to `value`.
  binarySearch(array, key, iteratee) {
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj; // Helper to get value for comparison.
    const value = itr(key); // Get the value to search for.
    let low = 0,
      high = array.length; // Initialize search range.
    while (low < high) { // Binary search loop.
      let mid = Math.floor((low + high) / 2); // Calculate middle index.
      if (itr(array[mid]) < value) low = mid + 1;
      else high = mid; // Adjust search range.
    }
    return low; // Return the found index.
  };
}
const _ = new Underscore(); // Create a global Underscore instance.

// Input utility class for reading from stdin.
class Input {
  constructor() { // Constructor initializes cursor and reads all input.
    this.cursor = 0; // Cursor to track current line.
    this.inputAll(); // Read all input.
  }

  inputAll() { // Reads entire stdin into an array of lines.
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data; // Return the read data.
  }

  /* Reads 1 line or multiple lines as strings. */
  nextLine(n) {
    if (n) { // If 'n' is provided, read 'n' lines.
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++]; // Read a single line and increment cursor.
  }
  /* Reads 1 integer. */
  nextInt() {
    return parseInt(this.nextLine());
  }
  /* Reads 1 line as a string array. */
  nextStrArr() {
    return this.nextLine().split(' ');
  }
  /* Reads 1 line as an integer array. */
  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  }
  /* Reads 1 line as a float array. */
  nextFloatArr() {
    return this.nextStrArr().map((e) => parseFloat(e));
  }
  /* Reads multiple lines as an integer array. */
  nextIntLine(n) {
    return this.nextLine(n).map((e) => parseInt(e))
  }
  /* Reads multiple lines as a float array. */
  nextFloatLine(n) {
    return this.nextLine(n).map((e) => parseFloat(e))
  }
  /* Reads multiple lines as a 2D string array. */
  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  }
  /* Reads multiple lines as a 2D integer array. */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
  /* Reads multiple lines as a 2D float array. */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
}
const input = new Input(); // Create a global Input instance.

// Output utility class for writing to stdout.
class Out {
  constructor() { // Constructor sets default options for boolean output.
    this.option = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  write(output) { // Writes output to console.
    let ret; // Variable to hold formatted output.
    if (output == null) return; // Do nothing if output is null.
    if (output === true) {
      ret = this.option['true'];
    } // Map true to 'Yes' or custom.
    else if (output === false) {
      ret = this.option['false'];
    } // Map false to 'No' or custom.
    else {
      ret = output;
    } // Use output as is for other types.
    console.log(ret); // Print to console.
  }
  bool(option) { // Customize boolean output strings.
    this.option['false'] = option[0]; // Set string for false.
    this.option['true'] = option[1]; // Set string for true.
    return this; // Allow chaining.
  }
}
const out = new Out(); // Create a global Out instance.

// Execute the main solution and print the result.
out.write(new Main().solve());