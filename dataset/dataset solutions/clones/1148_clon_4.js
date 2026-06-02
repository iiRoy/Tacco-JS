'use strict';

class BinaryMinHeap {
  constructor() {
    this._data = [];
  }

  push(item) {
    this._data.push(item);
    let child = this._data.length - 1;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      if (this._data[parent][0] <= item[0]) break;
      this._data[child] = this._data[parent];
      child = parent;
    }
    this._data[child] = item;
  }

  pop() {
    if (this._data.length === 0) return undefined;
    const top = this._data[0];
    const tail = this._data.pop();
    if (this._data.length > 0) {
      let parent = 0;
      while (true) {
        let child = parent * 2 + 1;
        if (child >= this._data.length) break;
        const right = child + 1;
        if (right < this._data.length && this._data[right][0] < this._data[child][0]) {
          child = right;
        }
        if (this._data[child][0] >= tail[0]) break;
        this._data[parent] = this._data[child];
        parent = child;
      }
      this._data[parent] = tail;
    }
    return top;
  }

  get length() {
    return this._data.length;
  }
}

function measureEditRoute(referenceText, observedText) {
  const reference = referenceText.split('');
  const observed = observedText.split('');

  const rows = observed.length + 1;
  const cols = reference.length + 1;
  const total = rows * cols;
  const best = Array(total).fill(Infinity);

  const encode = (r, c) => r * cols + c;
  const queue = new BinaryMinHeap();
  best[0] = 0;
  queue.push([0, 0, 0]);

  while (queue.length > 0) {
    const [cost, r, c] = queue.pop();
    const here = encode(r, c);
    if (cost !== best[here]) continue;
    if (r === observed.length && c === reference.length) return cost;

    if (r < observed.length && c < reference.length) {
      const step = observed[r] === reference[c] ? 0 : 1;
      const next = encode(r + 1, c + 1);
      const candidate = cost + step;
      if (candidate < best[next]) {
        best[next] = candidate;
        queue.push([candidate, r + 1, c + 1]);
      }
    }

    if (r < observed.length) {
      const next = encode(r + 1, c);
      const candidate = cost + 1;
      if (candidate < best[next]) {
        best[next] = candidate;
        queue.push([candidate, r + 1, c]);
      }
    }

    if (c < reference.length) {
      const next = encode(r, c + 1);
      const candidate = cost + 1;
      if (candidate < best[next]) {
        best[next] = candidate;
        queue.push([candidate, r, c + 1]);
      }
    }
  }

  return best[total - 1];
}

const main = stdin => {
  const [word, input] = stdin.split('\n');
  console.log(measureEditRoute(word, input));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
