'use strict'
class Main {
  solve() {
    const nk = input.nextIntArr();
    const n = nk[0], k = nk[1];
    const k2 = 2 * k;

    // Step 1: Process points and populate a 2D grid with values (+1 for color 0, -1 for color 1)
    // Also, count total points that are color 1 (B_total)
    // The grid dimensions are k2 x k2, representing the base toroidal space.
    const pointValueGrid = Array(k2).fill(0).map(() => Array(k2).fill(0));
    let totalColor1Points = 0; // This will store the count of points that are 'color 1' after transformation

    for (let i = 0; i < n; ++i) {
      const currentPointData = input.nextStrArr(); // Read one line at a time
      const originalX = parseInt(currentPointData[0]);
      const originalY = parseInt(currentPointData[1]);
      const originalColorChar = currentPointData[2];

      // Apply the transformation: shift 'B' points by k in x-coordinate
      const transformedX = (originalX + (originalColorChar === 'B' ? k : 0)) % k2;
      const transformedY = originalY % k2;

      // Determine the 'color type' of the transformed point based on its quadrant
      // color_type = 0 for (0,0)-(k-1,k-1) and (k,k)-(2k-1,2k-1)
      // color_type = 1 for (k,0)-(2k-1,k-1) and (0,k)-(k-1,2k-1)
      const transformedPointColorType = ((transformedX < k ? 0 : 1) ^ (transformedY < k ? 0 : 1));
      
      if (transformedPointColorType === 0) {
        pointValueGrid[transformedX][transformedY]++;
      } else {
        pointValueGrid[transformedX][transformedY]--;
        totalColor1Points++; // Increment B_total
      }
    }

    // Step 2: Create a 4k x 4k extended grid for toroidal prefix sums
    // This duplicates the k2 x k2 grid four times to handle wrapping queries easily.
    const tiledGrid = Array(k2 * 2).fill(0).map(() => Array(k2 * 2).fill(0));
    for (let r = 0; r < k2; ++r) {
      for (let c = 0; c < k2; ++c) {
        tiledGrid[r][c] = pointValueGrid[r][c];
        tiledGrid[r + k2][c] = pointValueGrid[r][c];
        tiledGrid[r][c + k2] = pointValueGrid[r][c];
        tiledGrid[r + k2][c + k2] = pointValueGrid[r][c];
      }
    }

    // Step 3: Compute 2D prefix sum array from the extended grid
    // sumAccumulator[r][c] stores the sum of tiledGrid[x][y] for 0 <= x < r, 0 <= y < c
    const sumAccumulator = Array(k2 * 2 + 1).fill(0).map(() => Array(k2 * 2 + 1).fill(0));
    for (let r = 0; r < k2 * 2; ++r) {
      for (let c = 0; c < k2 * 2; ++c) {
        sumAccumulator[r + 1][c + 1] = tiledGrid[r][c] + sumAccumulator[r + 1][c] + sumAccumulator[r][c + 1] - sumAccumulator[r][c];
      }
    }

    // Step 4: Slide a k x k window over the base k2 x k2 region and find the maximum sum (W_in - B_in)
    let maximumDifference = 0; // Max (W_in - B_in), initialized to 0 for n=0 case

    for (let startX = 0; startX < k2; ++startX) {
      for (let startY = 0; startY < k2; ++startY) {
        const endX = startX + k;
        const endY = startY + k;

        // Query the sum for the current k x k window using the prefix sum table
        const currentWindowDifference = sumAccumulator[endX][endY] - sumAccumulator[startX][endY] - sumAccumulator[endX][startY] + sumAccumulator[startX][startY];
        
        if (currentWindowDifference > maximumDifference) {
          maximumDifference = currentWindowDifference;
        }
      }
    }
    
    // The final answer is max(W_in - B_in) + B_total
    // Where W_in is count of transformed points with color 0 in window,
    // B_in is count of transformed points with color 1 in window,
    // B_total is total count of transformed points with color 1.
    return maximumDifference + totalColor1Points;
  }
}

class Mod {
  constructor(mod) {
    if (mod == null) { mod = Combinatorics.DefaultMod; }
    this.mod = mod;
  }
  mult(a,b) {
    let ret = 0;
    a %= this.mod;
    b %= this.mod;
    while (b) {
      if (b&1) {
        ret += a;
        if (ret > this.mod) { ret -= this.mod; }
      }
      a <<= 1;
      if (a > this.mod) { a -= this.mod; }
      b >>= 1;
    }
    return ret;
  }
  pow(a,b) {
    let ret = 1;
    while(b) {
      if (b&1) { ret = this.mult(ret,a); }
      a = this.mult(a,a);
      b >>= 1;
    }
    return ret;
  }
  div(a,b) { return this.mult(a, this.pow(b, this.mod-2)) }
  comb(n,k) { return MOD.mult(factTable[n],MOD.mult(invFactTable[k],invFactTable[n-k])); }
}
const MOD = new Mod(1e9+7);

class Underscore {
  sum(arr) { return arr.reduce((a,b)=>a+b); }
  modSum(arr,mod) { if (mod == null) { mod = MOD.mod; } return arr.reduce((a,b)=>(a+b)%mod); }
  min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
  max(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); }
  sort(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.sort(func) }
  uniq(arr) { 
    arr.sort();
    for(let i = 0; i < arr.length - 1; ++i) { 
      arr[i] = arr[i+1] == arr[i] ? null : arr[i]; 
    }
    return arr.filter(e => e != null);
  }
  range(start, stop, step) {
    if (stop == null) { stop = start || 0; start = 0; }
    if (!step) { step = stop < start ? -1 : 1; }
    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);
    for (var idx = 0; idx < length; idx++, start += step) { range[idx] = start; }
    return range;
  }
  first (array, n) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.initial(array, array.length - n);
  };
  initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }
  tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }
  last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
  sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }
  diffArray (arr) { const s = []; for (let i = 1; i < arr.length; ++i) { s.push(arr[i] - arr[i-1]); } return s; }
  // 配列の値以下の最大のindex
  binarySearch (array, key, iteratee) {
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
    const value = itr(key);
    let low = 0, high = array.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (itr(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };
}
const _ = new Underscore();

class Input {
  constructor() {
    this.cursor = 0;
    this.inputAll();
  }

  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  /* 1行 or 複数行文字列 */
  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }
  /* 1整数 */
  nextInt() { return parseInt(this.nextLine()); } 
  /* 一行文字配列 */
  nextStrArr() { return this.nextLine().split(' '); } 
  /* 一行整数配列 */
  nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }
  /* 一行浮動小数点配列 */
  nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }
  /* 複数行整数配列 */
  nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }
  /* 複数行浮動小数点配列 */
  nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }
  /* 複数行文字列二次元配列 */
  nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
  /* 複数行整数二次元配列 */
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
  /* 複数行浮動小数点数二次元配列 */
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
} 
const input = new Input();

class Out {
  constructor() {
    this.option = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  write(output){
    let ret;
    if (output == null) return;
    if (output === true) { ret = this.option['true']; }
    else if (output === false) { ret = this.option['false']; }
    else { ret = output; }
    console.log(ret);
  }
  bool(option) {
    this.option['false'] = option[0];
    this.option['true'] = option[1];
    return this;
  }
}
const out = new Out();

out.write(new Main().solve());
