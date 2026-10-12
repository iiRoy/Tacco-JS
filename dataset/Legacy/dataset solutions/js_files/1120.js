class priorityQueue {
  constructor() {
    this.keys = [];
    Number.prototype.parentIdx = function() { return Math.ceil(this/2 - 1); };
    Number.prototype.leftIdx = function() { return this<<1 + 1; };
    Number.prototype.rightIdx = function() { return this<<1 + 2; };
  }

  insert(key) { this.heapIncrease(this.keys.push(key) - 1); }

  heapIncrease(idx) {
    const keys = this.keys;
    for (let i=idx, p=idx.parentIdx(); i > 0 && keys[i] > keys[p]; i=p, p=i.parentIdx()) {
      keys[p] = [keys[i], keys[i] = keys[p]][0];
    }
  }

  extract() {
    const res = this.keys[0];
    this.keys[0] = this.keys.pop();
    this.maxHeapify(0);
    return res;
  }

  maxHeapify(idx) {
    const keys = this.keys, n = keys.length;
    const innerMaxHeapify = (i) => {
      let left, right, largest = i;
      left = i.leftIdx();
      right = i.rightIdx();
      if (left < n && keys[left] > keys[largest]) largest = left;
      if (right < n && keys[right] > keys[largest]) largest = right;
      if (largest != i) {
        keys[largest] = [keys[i], keys[i] = keys[largest]][0];
        innerMaxHeapify(largest);
      }
    };
    innerMaxHeapify(idx);
  }
}

(function main() {
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').slice(0, -1);
  const queue = new priorityQueue();
  let str = '';
  lines.forEach(function(cmd) {
    switch(cmd.charAt(0)) {
      case 'i': queue.insert(Number(cmd.split(' ')[1])); break;
      case 'e': str += `${queue.extract()}\n`; break;
    }
  });
  process.stdout.write(str);
})();


