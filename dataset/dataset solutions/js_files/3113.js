'use strict'

class Main {
  solve() {
    let n = input.nextIntArr()[0];
    const pairs = [];
    if (n % 2) pairs.push([n]);
    let m = n % 2 ? n - 1 : n;
    for (let i = 0; i < m/2; ++i) {
      pairs.push([i+1,m-i]);
    }
    let ret = [];
    for (let i = 0; i < pairs.length; ++i) {
      pairs[i].forEach((e1) => ret = ret.concat(pairs[(i+1)%pairs.length].map((e2) => [e1,e2])));
    }
    console.log(ret.length);
    console.log(ret.map((e)=>e.join(' ')).join('\n'));
  }
}

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
