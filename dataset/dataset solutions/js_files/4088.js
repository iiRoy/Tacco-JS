'use strict'
class Main {
  solve() {
    const nk = input.nextIntArr();
    const n = nk[0], k = nk[1];
    const k2 = 2*k;
    const list = input.nextStrRange(n).map(e=>{
      return {
        x: (parseInt(e[0]) + (e[2]==='B'?k:0)) % k2,
        y: parseInt(e[1]) % k2,
      }
    });
    const grid = CGrid.from(list);
    const color = (x,y) => (x<k?0:1)^(y<k?0:1);
    let count = list.filter(e=>color(e.x,e.y) === 0).length;
    let max = count;
    for (let dy = 0; dy < k; ++dy) {
      const temp = [];
      for (let dx = 0; dx < k2; ++dx) {
        const dxk = dx+((dx+k)>=k2?-k:k);
        max = Math.max(max,count);
        temp[dx] = temp[dx] ? temp[dx] : grid.count(dx,dy,dx,dy+k);
        temp[dxk] = temp[dxk] ? temp[dxk] : grid.count(dxk,dy,dxk,dy+k);
        const wl = temp[dx];
        const bl = grid.size('x',dx) - wl;
        const wr = temp[dxk];
        const br = grid.size('x',dxk) - wr;
        count += (-wl+bl)+(+wr-br);
      }
      while(dy < k && grid.size('y',dy) === 0 && grid.size('y',dy+k) === 0) { ++dy; }
      if (dy == k) { break; }
      const wl = grid.count(0,dy,k,dy);
      const bl = grid.size('y',dy) - wl;
      const wr = grid.count(0,dy+k,k,dy+k);
      const br = grid.size('y',dy+k) - wr;
      count += (-wl+bl)+(+wr-br);
    }
    return max;
  }
}

// Compressed Grid Array
class CGrid {
  static get DefaultParams() {
    return ['x','y'];
  }
  static get DefaultSortKeys() {
    return { 'x': (a,b)=>a.y-b.y, 'y': (a,b)=>a.x-b.x };
  }
  static from(list,addParams,addSortKeys) {
    return new CGrid().init(list,addParams,addSortKeys);
  }
  size(p,i) { return this.lists[p][i] == null ? 0 : this.lists[p][i].length; }
  init(list,addParams,addSortKeys) {
    if (addParams==null){addParams=[];}
    if (addSortKeys==null){addSortKeys={};}
    this.params = CGrid.DefaultParams.concat(addParams);
    this.sortKeys = Object.assign(CGrid.DefaultSortKeys,addSortKeys);
    this.lists = {};
    this.params.forEach(p=>{ this.lists[p] = {}; });
    list.forEach(e=>{
      this.params.forEach(p=>{
        if (this.lists[p][e[p]] === undefined) { this.lists[p][e[p]] = []; }
        this.lists[p][e[p]].push(e);
      });
    });
    // this.keys = {};
    this.params.forEach(p=>{
      const elements = this.lists[p];
      for (const key in elements) { elements[key].sort(this.sortKeys[p]); }
      // this.keys[p] = Object.keys(this.lists[p]);
    });
    return this;
  }

  get(x,y) {
    const i = _.binarySearch(this.lists.x[x],y,'y');
    if (this.lists.x[i] == null || this.lists.x[i].y !== y) { return null; }
    return this.lists.x[i];
  }

  // [(x1,y1),(x2,y2))の点の数
  count(x1,y1,x2,y2) {
    if (x1 == x2) {
      if (this.lists.x[x1] == null) return 0;
      const l = _.binarySearch(this.lists.x[x1], y1,'y');
      const r = _.binarySearch(this.lists.x[x1], y2,'y');
      return r-l;
    }
    if (y1 == y2) {
      if (this.lists.y[y1] == null) return 0;
      const l = _.binarySearch(this.lists.y[y1], x1,'x');
      const r = _.binarySearch(this.lists.y[y1], x2,'x');
      return r-l;
    }
    return -1;
  }

  getSome(x1,y1,x2,y2) {
    if (x1 == x2) {
      const ret = [];
      if (this.lists.x[x1] == null) return ret;
      const l = _.binarySearch(this.lists.x[x1], y1,'y');
      const r = _.binarySearch(this.lists.x[x1], y2,'y');
      for (let x=l;x<r;++x) {ret.push(this.lists.y[x])}
      return ret;
    }
    if (y1 == y2) {
      const ret = [];
      if (this.lists.y[y1] == null) return ret;
      const l = _.binarySearch(this.lists.y[y1], x1,'x');
      const r = _.binarySearch(this.lists.y[y1], x2,'x');
      for (let y=l;y<r;++y) {ret.push(this.lists.x[y])}
      return ret;
    }
    return -1;
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
      let mid = (low + high)>>1;
      if (itr(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  }
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
