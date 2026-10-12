'use strict'

class Main {
  solve() {
    const n = input.nextInt();
    const ab = input.nextIntRange(n);
    if (ab.every(e=>e[0]==e[1])) return 0;
    const larger = ab.filter(e=>e[0]>e[1])
    return _.sum(ab.map(e=>e[0])) - larger.length == 0  ? 0 :_.min(ab.filter(e=>e[0]>e[1]).map(e=>e[1]));
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
