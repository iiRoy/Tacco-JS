(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
  const arr = lines.shift().split(' ').map(Number);
  buildMaxHeap(arr, n);
  console.log(arr.reduce((s, e) => s += ` ${e}`, ''));
})();

function buildMaxHeap(arr, n) {
  const maxHeapify = (i) => {
    let left, right, largest;
    left = 2 * i + 1;
    right = 2 * i + 2;
    largest = left < n && arr[left] > arr[i] ? left : i;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
      arr[largest] = [arr[i], arr[i] = arr[largest]][0];
      maxHeapify(largest);
    }
  };

  for (let i = n << 1; i >= 0; i--) maxHeapify(i);
}

