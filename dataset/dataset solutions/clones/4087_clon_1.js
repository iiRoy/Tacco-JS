'use strict' /* Ensure strict mode for better code quality. */

class Main /* Main class definition for the application logic. */
{
  solve() /* Solves the main problem. */
  {
    // Read N and K from input.
    const nk     = input.nextIntArr();
    const n      = nk[0], k = nk[1];
    const k2     = 2 * k; // Pre-calculate 2*k for efficiency.
    
    // Process input list, mapping to objects with normalized coordinates.
    const list   = input.nextStrRange(n).map(  e => {
      /* Normalize coordinates based on 'B' character and k. */
      return {
        x: (parseInt(e[0]) + (e[2] === 'B' ? k : 0)) % k2,
        y: parseInt(e[1]) % k2,
      }
    });
    
    // Create a compressed grid from the list of points.
    const grid   = CGrid.from(list);
    
    // Define a color function based on coordinates relative to k.
    const color  = (x, y) => (x < k ? 0 : 1) ^ (y < k ? 0 : 1);
    
    // Initial count of points with color 0.
    let count    = list.filter(  e => color(e.x, e.y) === 0  ).length;
    let max      = count; // Initialize max with the initial count.
    
    // Iterate through possible shifts (dy) and grid positions (dx).
    for (let dy = 0; dy < k; ++dy) /* Loop for vertical shifts. */
    {
      for (let dx = 0; dx < k2; ++dx) /* Loop for horizontal shifts. */
      {
        /* Optimization: Skip empty columns to speed up processing. */
        while (dx < k && grid.size('x', dx) === 0 && grid.size('x', dx + k) === 0)
        {
          ++dx; // Increment dx to the next non-empty column.
        }
        
        max = Math.max(max, count); // Update the maximum count found so far.
        
        // Calculate counts for the current window.
        const wl = grid.count(dx, dy, dx, dy + k); // White points in left column.
        const bl = grid.size('x', dx) - wl;        // Black points in left column.
        
        const wr = grid.count((dx + k) % k2, dy, (dx + k) % k2, dy + k); // White points in right column.
        const br = grid.size('x', (dx + k) % k2) - wr;                  // Black points in right column.
        
        // Adjust count based on points entering and leaving the window.
        count += (-wl + bl) + (+wr - br);
      }
      
      /* Optimization: Skip empty rows to speed up processing. */
      while (dy < k && grid.size('y', dy) === 0 && grid.size('y', dy + k) === 0)
      {
        ++dy; // Increment dy to the next non-empty row.
      }
      
      if (dy == k) // If dy reached k, break the outer loop.
      {
        break;
      }
      
      // Calculate counts for row changes after a full column sweep.
      const wl = grid.count(0, dy, k, dy);      // White points in top row.
      const bl = grid.size('y', dy) - wl;       // Black points in top row.
      
      const wr = grid.count(0, dy + k, k, dy + k); // White points in bottom row.
      const br = grid.size('y', dy + k) - wr;      // Black points in bottom row.
      
      // Adjust count based on points entering and leaving the row.
      count += (-wl + bl) + (+wr - br);
    }
    
    return max; // Return the maximum count found.
  }
}

// Compressed Grid Array implementation.
class CGrid {
  /* Default parameters for grid dimensions. */
  static get DefaultParams() {
    return ['x', 'y'];
  }
  /* Default sorting keys for grid elements. */
  static get DefaultSortKeys() {
    return { 'x': (a, b) => a.y - b.y, 'y': (a, b) => a.x - b.x };
  }
  
  /* Factory method to create and initialize a CGrid instance. */
  static from(list, addParams, addSortKeys) {
    return new CGrid().init(list, addParams, addSortKeys);
  }
  
  /* Returns the size (length) of the list for a given parameter and index. */
  size(p, i) {
    return this.lists[p][i] == null ? 0 : this.lists[p][i].length;
  }
  
  /* Initializes the CGrid with a list of elements. */
  init(list, addParams, addSortKeys) {
    if (addParams == null) {
      addParams = [];
    }
    if (addSortKeys == null) {
      addSortKeys = {};
    }
    
    this.params   = CGrid.DefaultParams.concat(addParams);
    this.sortKeys = Object.assign(CGrid.DefaultSortKeys, addSortKeys);
    this.lists    = {};
    
    this.params.forEach(  p => {
      this.lists[p] = {};
    });
    
    list.forEach(  e => {
      this.params.forEach(  p => {
        if (this.lists[p][e[p]] === undefined) {
          this.lists[p][e[p]] = [];
        }
        this.lists[p][e[p]].push(e);
      });
    });
    
    this.keys = {};
    
    this.params.forEach(  p => {
      const elements = this.lists[p];
      for (const key in elements) {
        elements[key].sort(this.sortKeys[p]);
      }
      this.keys[p] = Object.keys(this.lists[p]);
    });
    
    return this;
  }

  /* Retrieves an element at specific x, y coordinates. */
  get(x, y) {
    const i = _.binarySearch(this.lists.x[x], y, 'y');
    if (this.lists.x[i] == null || this.lists.x[i].y !== y) {
      return null;
    }
    return this.lists.x[i];
  }

  /* Counts points within a given range [(x1,y1),(x2,y2)). */
  count(x1, y1, x2, y2) {
    if (x1 == x2) // If counting along a vertical line.
    {
      if (this.lists.x[x1] == null) return 0;
      const l = _.binarySearch(this.lists.x[x1], y1, 'y');
      const r = _.binarySearch(this.lists.x[x1], y2, 'y');
      return r - l;
    }
    
    if (y1 == y2) // If counting along a horizontal line.
    {
      if (this.lists.y[y1] == null) return 0;
      const l = _.binarySearch(this.lists.y[y1], x1, 'x');
      const r = _.binarySearch(this.lists.y[y1], x2, 'x');
      return r - l;
    }
    
    return -1; // Not supported for general rectangular ranges.
  }

  /* Gets some elements within a given range (currently only for lines). */
  getSome(x1, y1, x2, y2) {
    if (x1 == x2) // If getting elements along a vertical line.
    {
      const ret = [];
      if (this.lists.x[x1] == null) return ret;
      const l = _.binarySearch(this.lists.x[x1], y1, 'y');
      const r = _.binarySearch(this.lists.x[x1], y2, 'y');
      for (let x = l; x < r; ++x) {
        ret.push(this.lists.y[x])
      }
      return ret;
    }
    
    if (y1 == y2) // If getting elements along a horizontal line.
    {
      const ret = [];
      if (this.lists.y[y1] == null) return ret;
      const l = _.binarySearch(this.lists.y[y1], x1, 'x');
      const r = _.binarySearch(this.lists.y[y1], x2, 'x');
      for (let y = l; y < r; ++y) {
        ret.push(this.lists.x[y])
      }
      return ret;
    }
    
    return -1; // Not supported for general rectangular ranges.
  }
}

/* Modulo arithmetic utility class. */
class Mod {
  constructor(mod) {
    if (mod == null) {
      mod = Combinatorics.DefaultMod;
    }
    this.mod = mod;
  }
  
  /* Multiplies two numbers modulo this.mod. */
  mult(a, b) {
    let ret = 0;
    a %= this.mod;
    b %= this.mod;
    while (b) {
      if (b & 1) {
        ret += a;
        if (ret > this.mod) {
          ret -= this.mod;
        }
      }
      a <<= 1;
      if (a > this.mod) {
        a -= this.mod;
      }
      b >>= 1;
    }
    return ret;
  }
  
  /* Calculates a^b modulo this.mod using binary exponentiation. */
  pow(a, b) {
    let ret = 1;
    while (b) {
      if (b & 1) {
        ret = this.mult(ret, a);
      }
      a = this.mult(a, a);
      b >>= 1;
    }
    return ret;
  }
  
  /* Divides a by b modulo this.mod (a * b^(mod-2)). */
  div(a, b) {
    return this.mult(a, this.pow(b, this.mod - 2))
  }
  
  /* Calculates nCk modulo this.mod (requires precomputed factorials). */
  comb(n, k) {
    return MOD.mult(factTable[n], MOD.mult(invFactTable[k], invFactTable[n - k]));
  }
}
const MOD = new Mod(1e9 + 7); // Global modulo constant.

/* Utility class with various helper functions (similar to Lodash/Underscore.js). */
class Underscore {
  /* Calculates the sum of array elements. */
  sum(arr) {
    return arr.reduce((a, b) => a + b);
  }
  
  /* Calculates the sum of array elements modulo a given value. */
  modSum(arr, mod) {
    if (mod == null) {
      mod = MOD.mod;
    }
    return arr.reduce((a, b) => (a + b) % mod);
  }
  
  /* Finds the minimum element in an array using an optional comparator function. */
  min(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.reduce((a, b) => func(a, b) < 0 ? a : b);
  }
  
  /* Finds the maximum element in an array using an optional comparator function. */
  max(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.reduce((a, b) => func(a, b) > 0 ? a : b);
  }
  
  /* Sorts an array using an optional comparator function. */
  sort(arr, func) {
    if (func == null) {
      func = (a, b) => a - b
    }
    return arr.sort(func)
  }
  
  /* Returns a new array with unique elements. */
  uniq(arr) {
    arr.sort(); // Sort to group identical elements.
    for (let i = 0; i < arr.length - 1; ++i) {
      arr[i] = arr[i + 1] == arr[i] ? null : arr[i];
    }
    return arr.filter(e => e != null); // Filter out nulls (duplicates).
  }
  
  /* Generates a range of numbers. */
  range(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }
    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range  = Array(length);
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }
    return range;
  }
  
  /* Returns the first element(s) of an array. */
  first(array, n) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.initial(array, array.length - n);
  };
  
  /* Returns all but the last element(s) of an array. */
  initial(array, n) {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n)));
  }
  
  /* Returns all but the first element(s) of an array. */
  tail(array, n) {
    return array.slice.call(array, n == null ? 1 : n);
  }
  
  /* Returns the last element(s) of an array. */
  last(array, n) {
    if (n == null) return array[array.length - 1];
    return this.tail(array, Math.max(0, array.length - n));
  }
  
  /* Calculates the cumulative sum of an array. */
  sumArray(arr) {
    return this.tail(arr.reduce(((a, b, i) => {
      a.push(b + a[i]);
      return a
    }), [0]));
  }
  
  /* Calculates the difference between adjacent elements in an array. */
  diffArray(arr) {
    const s = [];
    for (let i = 1; i < arr.length; ++i) {
      s.push(arr[i] - arr[i - 1]);
    }
    return s;
  }
  
  /* Performs binary search to find the index of the largest element less than or equal to the key. */
  // 配列の値以下の最大のindex
  binarySearch(array, key, iteratee) {
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
    const value = itr(key);
    let low = 0,
      high = array.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (itr(array[mid]) < value) low = mid + 1;
      else high = mid;
    }
    return low;
  };
}
const _ = new Underscore(); // Global Underscore utility instance.

/* Input handling utility class. */
class Input {
  constructor() {
    this.cursor = 0;
    this.inputAll();
  }

  /* Reads all input from stdin. */
  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  /* Reads one or multiple lines of input as strings. */
  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }
  
  /* Reads a single integer. */
  nextInt() {
    return parseInt(this.nextLine());
  }
  
  /* Reads a line as an array of strings. */
  nextStrArr() {
    return this.nextLine().split(' ');
  }
  
  /* Reads a line as an array of integers. */
  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  }
  
  /* Reads a line as an array of floats. */
  nextFloatArr() {
    return this.nextStrArr().map((e) => parseFloat(e));
  }
  
  /* Reads multiple lines as an array of integers. */
  nextIntLine(n) {
    return this.nextLine(n).map((e) => parseInt(e))
  }
  
  /* Reads multiple lines as an array of floats. */
  nextFloatLine(n) {
    return this.nextLine(n).map((e) => parseFloat(e))
  }
  
  /* Reads multiple lines as a 2D array of strings. */
  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  }
  
  /* Reads multiple lines as a 2D array of integers. */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
  
  /* Reads multiple lines as a 2D array of floats. */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
}
const input = new Input(); // Global Input utility instance.

/* Output handling utility class. */
class Out {
  constructor() {
    this.option = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  
  /* Writes output to the console. */
  write(output) {
    let ret;
    if (output == null) return;
    if (output === true) {
      ret = this.option['true'];
    } else if (output === false) {
      ret = this.option['false'];
    } else {
      ret = output;
    }
    console.log(ret);
  }
  
  /* Sets custom string representations for boolean true/false. */
  bool(option) {
    this.option['false'] = option[0];
    this.option['true'] = option[1];
    return this;
  }
}
const out = new Out(); // Global Out utility instance.

/* Execute the main solution and output the result. */
out.write(new Main().solve());