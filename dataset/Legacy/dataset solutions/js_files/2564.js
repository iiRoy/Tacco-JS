input = require('fs').readFileSync('/dev/stdin', 'utf8')
lines = input.split('\n')
line = lines.shift().split(' ')
N = line[0] * 1
K = line[1] * 1 
A = lines.shift().split(' ')

_Heap = {
  heap: [],
  compare: (a, b) => a < b,
  create(arr, desc) {
    this.heap = [0]
    if (desc) {
        this.compare = (a, b) => a > b
    }
    for(var i=0; i < arr.length; i++) {
      this.push(arr[i] * 1)
    }
  },
  push(v) {
    var idx = this.heap.length
    while(idx > 1) {
        var parent = ~~(idx / 2)
        if (this.compare(v, this.heap[parent])) {
            this.heap[idx] = this.heap[parent]
            idx = parent
        } else {
            break;
        }
    }
    this.heap[idx] = v
  },
  pop() {
    if (this.heap.length == 1) {
        return
    } else if (this.heap.length == 2) {
        return this.heap.pop()
    }
    
    var val = this.heap[1]
    var last = this.heap.pop()
    var idx = 1
    while(true) {
        var left = idx * 2
        var right = idx * 2 + 1
        var next = idx
        if (left < this.heap.length && this.compare(this.heap[left], last)) {
          next = left
        }
        if (right < this.heap.length
			&& this.compare(this.heap[right], last)
			&& this.compare(this.heap[right], this.heap[left])) {
          next = right
        }
        if (next != idx) {
          this.heap[idx] = this.heap[next]
          idx = next
        } else {
            break;
        }
    }
    this.heap[idx] = last
    return val
  }
}

_Heap.create(A, true)

for(i=0; i<K; i++) {
    a = _Heap.pop()
    _Heap.push(~~(a / 2))
}

sum = 0
for(i=1; i<_Heap.heap.length; i++) {
    sum += _Heap.heap[i]
}

console.log(sum)