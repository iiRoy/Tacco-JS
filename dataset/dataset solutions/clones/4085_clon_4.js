'use strict'
class Solver {
  solve() {
    const sizeAndK = input.nextIntArr();
    const pointCount = sizeAndK[0];
    const squareSize = sizeAndK[1];
    const gridDimension = 2 * squareSize;

    // Step 1: Populate a grid with point counts based on transformed coordinates.
    // Transformed coordinates:
    // x: (original_x + (is_black ? k : 0)) % (2k)
    // y: original_y % (2k)
    const pointOccurrenceGrid = Array(gridDimension).fill(0).map(() => Array(gridDimension).fill(0));
    const rawPoints = input.nextStrRange(pointCount);
    rawPoints.forEach(pointData => {
      const xVal = parseInt(pointData[0]);
      const yVal = parseInt(pointData[1]);
      const typeChar = pointData[2];

      const transformedX = (xVal + (typeChar === 'B' ? squareSize : 0)) % gridDimension;
      const transformedY = yVal % gridDimension;
      pointOccurrenceGrid[transformedX][transformedY]++;
    });

    // Step 2: Create a grid where cells only count points that are "black"
    // relative to a (0,0) origin. A point (x,y) is "black" if it falls into
    // quadrants [0,k)x[0,k) or [k,2k)x[k,2k).
    const blackOnlyGrid = Array(gridDimension).fill(0).map(() => Array(gridDimension).fill(0));
    for (let x = 0; x < gridDimension; ++x) {
      for (let y = 0; y < gridDimension; ++y) {
        const isBlackQuadrant = ((x < squareSize && y < squareSize) || (x >= squareSize && y >= squareSize));
        if (isBlackQuadrant) {
          blackOnlyGrid[x][y] = pointOccurrenceGrid[x][y];
        }
      }
    }

    // Step 3: Create an extended grid by tiling the blackOnlyGrid 2x2 times.
    // This handles the toroidal (wrap-around) nature of the sliding window
    // when using 2D prefix sums.
    const extendedBlackGrid = Array(2 * gridDimension).fill(0).map(() => Array(2 * gridDimension).fill(0));
    for (let x = 0; x < 2 * gridDimension; ++x) {
      for (let y = 0; y < 2 * gridDimension; ++y) {
        extendedBlackGrid[x][y] = blackOnlyGrid[x % gridDimension][y % gridDimension];
      }
    }

    // Step 4: Compute a 2D prefix sum (also known as summed-area table)
    // on the extended black point grid. This allows O(1) query for the sum
    // of points within any rectangle.
    const prefixSumMatrix = Array(2 * gridDimension).fill(0).map(() => Array(2 * gridDimension).fill(0));
    for (let x = 0; x < 2 * gridDimension; ++x) {
      for (let y = 0; y < 2 * gridDimension; ++y) {
        const currentVal = extendedBlackGrid[x][y];
        const sumAbove = (x > 0) ? prefixSumMatrix[x - 1][y] : 0;
        const sumLeft = (y > 0) ? prefixSumMatrix[x][y - 1] : 0;
        const sumDiag = (x > 0 && y > 0) ? prefixSumMatrix[x - 1][y - 1] : 0;
        prefixSumMatrix[x][y] = currentVal + sumAbove + sumLeft - sumDiag;
      }
    }

    // Step 5: Iterate through all possible top-left corners (startX, startY)
    // of a squareSize x squareSize window within the original gridDimension x gridDimension area.
    // For each window, query the prefix sum matrix to find the total count of "black" points.
    // The maximum count found is the answer.
    let maximumBlackPoints = 0;
    for (let startX = 0; startX < gridDimension; ++startX) {
      for (let startY = 0; startY < gridDimension; ++startY) {
        const endX = startX + squareSize - 1;
        const endY = startY + squareSize - 1;

        let currentWindowSum = prefixSumMatrix[endX][endY];
        if (startX > 0) {
          currentWindowSum -= prefixSumMatrix[startX - 1][endY];
        }
        if (startY > 0) {
          currentWindowSum -= prefixSumMatrix[endX][startY - 1];
        }
        if (startX > 0 && startY > 0) {
          currentWindowSum += prefixSumMatrix[startX - 1][startY - 1];
        }
        maximumBlackPoints = Math.max(maximumBlackPoints, currentWindowSum);
      }
    }

    return maximumBlackPoints;
  }
}

class ModularArithmetic {
  constructor(mod) {
    if (mod == null) { mod = ModularArithmetic.DefaultMod; }
    this.mod = mod;
  }
  mult(a,b) {
    let ret = 0;
    a %= this.mod;
    b %= this.mod;
    while (b) {
      if (b&1) {
        ret += a;
        if (ret >= this.mod) { ret -= this.mod; }
      }
      a <<= 1;
      if (a >= this.mod) { a -= this.mod; }
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
  // comb(n,k) { return MOD_INST.mult(factTable[n],MOD_INST.mult(invFactTable[k],invFactTable[n-k])); } // Not used by Solver
}
const MOD_INST = new ModularArithmetic(1e9+7);

class UtilityBelt {
  sum(arr) { return arr.reduce((a,b)=>a+b); }
  modSum(arr,mod) { if (mod == null) { mod = MOD_INST.mod; } return arr.reduce((a,b)=>(a+b)%mod); }
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
const util = new UtilityBelt();

class Input {
  constructor() {
    this.cursor = 0;
    this.inputAll();
  }

  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }
  nextInt() { return parseInt(this.nextLine()); } 
  nextStrArr() { return this.nextLine().split(' '); } 
  nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }
  nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }
  nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }
  nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }
  nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
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

out.write(new Solver().solve());
