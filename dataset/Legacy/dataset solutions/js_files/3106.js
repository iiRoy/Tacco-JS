'use strict'

class Main {
  solve() {
    const mod = 1e9 + 7;
    const n = parseInt(input.nextLine());
    const chars = [ 'A','T','G','C' ];
    const ng = ['.AGC','AG.C','A.GC','.GAC','.ACG'].map((p) => new RegExp(p));
    const dp=[];
    for (let i = 0; i <= n; ++i) { dp[i] = []; }
    dp[0]['TTT'] = 1;

    for (let i = 1; i <= n; ++i) {
      for (const key of chars) {
        for (const prev in dp[i-1]) {
          if (ng.some((p) => p.test(prev+key))) { continue; };
          const cur = prev.substr(1)+key;
          dp[i][cur] = dp[i][cur] !== undefined ? dp[i][cur] : 0;
          dp[i][cur] += dp[i-1][prev];
          dp[i][cur] %= mod;
        }
      }
    }
    let ret = [];

    for (let k in dp[n]) { ret.push(dp[n][k]); }
    console.log(ret.reduce((a,b)=>(a+b) % mod));
  } 
}

/* Underscore.js の移植および便利メソッド群 */
class Underscore {
  sum(arr) { return arr.reduce((a,b)=>a+b); }
  min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
  max(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); }

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

	for (var idx = 0; idx < length; idx++, start += step) {
	  range[idx] = start;
	}
	return range;
  }

  first (array, n) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null) return array[0];
    return this.initial(array, array.length - n);
  };

  initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }

  tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }

  last (array, n) { 
    if (n == null) return array[array.length - 1];
    return this.tail(array, Math.max(0, array.length - n)); 
  }

  sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }

  binarySearch (array, key, iteratee) {
	const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
	const value = itr(obj);
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
(new Main()).solve();
