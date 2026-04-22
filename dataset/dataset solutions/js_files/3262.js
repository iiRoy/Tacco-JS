'use strict'

class Main {
  solve() {
    const nums = input.nextIntArr();
    const k = nums[1];
    const table = input.nextIntRange(nums[0]);
    const score = [];

    table.sort(e => e[1]).reverse();
    const s = _.first(table, k);
    const kinds = {};
    s.forEach(e => kinds[e[0]] = (kinds[e[0]] ? kinds[e[0]] + 1: 1));
    let kind = Object.keys(kinds).length;
    score[kind] = _.sum(s.map(s => s[1]));

    const heap = new BinaryHeap();
    s.forEach(e => {
      if (kinds[e[0]] > 1) {
        heap.push(e[1], e);
      }
    });

    let cur = s.length;
    while (heap.length > 0 && cur < table.length) {
      const target = heap.pop();
      if (kinds[target[0]] >= 2) {
        --kinds[target[0]];
        do {
          let next = table[cur];
          ++cur;
          if (!kinds[next[0]]) {
            kinds[next[0]] = 1;
            heap.push(next[1],next);
            ++kind;
            score[kind] = score[kind - 1] + next[1] - target[1];
            break;
          }
        } while(cur < table.length);
      }
    }

    const scores = score.map((e,i) => e ? (e + i * i) : 0);
    console.log(_.max(scores));
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

  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }

  nextStrArr() {
    return this.nextLine().split(' ');
  }

  nextIntArr() {
    return this.nextStrArr().map((e) => parseInt(e));
  }

  nextStrRange(n) {
    return this.nextLine(n).map((line) => line.split(' '));
  }

  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
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

  tail(arr, n) { return array.slice.call(arr, n == null ? 1 : n); }

  last (array, n) { 
    if (n == null) return array[array.length - 1];
    return this.tail(array, Math.max(0, array.length - n)); 
  }

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
/* ２分木による最大ヒープ */
class BinaryHeap {
  constructor() {
    this._data = [];
    this._length = 0;
  }

  /* データ追加 priority value */
  push(priority, value) {
    const data = this._data;
    data.push({p: priority, v: value});
    let i = this._length;
    let p = (i - 1) >> 1; // parent
    // up heap
    while (p >= 0 && data[p].p < data[i].p) {
      const tmp = data[i]; data[i] = data[p]; data[p] = tmp;
      i = p;
      p = (i - 1) >> 1;
    }
    ++this._length;
  }

  /* データ取出 */
  pop() {
    if (this.length <= 0) {
      return null;
    }
    const length = this._length - 1;
    const data = this._data;
    const _top = this.top;
    data[0] = data[length];
    data.pop();
    let i = 0;
    let c1 = (i<<1) + 1; let c2 = (i<<1) + 2;
    // down heap
    let p0,p1,p2;
    while(c1 < length) {
      if (c2 < length) {
        // both child exists
        p0 = data[i].p; p1 = data[c1].p; p2 = data[c2].p;
        if ((p1 < p2) && (p0 < p2)) {
          // swap 0 & 2
          const tmp = data[i]; data[i] = data[c2]; data[c2] = tmp;
          i = c2;
        }
        else {
          // swap 0 & 1 
          const tmp = data[i]; data[i] = data[c1]; data[c1] = tmp;
          i = c1;
        }
        c1 = (i<<1) + 1; c2 = (i<<1) + 2;
      }
      else {
        // right child not exists
        p0 = data[i].p; p1 = data[c1].p;
        if (p0 < p1) {
          // swap
          const tmp = data[i]; data[i] = data[c1]; data[c1] = tmp;
        }
        break;
      }
    }

    this._length = length;
    return _top;
  }

  /* 最大の要素 */
  get top() {
    return this._data[0].v;
  }

  /* 要素数 */
  get length() {
    return this._length;
  } 
}

const input = new Input();
(new Main()).solve();
