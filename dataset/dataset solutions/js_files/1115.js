(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
  console.log(' ' + buildMaxHeap(lines.shift().split(' ')).join(' '));
})();

function buildMaxHeap(arr) {
  const n = arr.length;
  const maxHeapify = (i) => {
    let left, right, largest = i;
    left = 2 * i + 1;
    right = 2 * i + 2;
    if (left < n && Number(arr[left]) > Number(arr[largest])) largest = left;
    if (right < n && Number(arr[right]) > Number(arr[largest])) largest = right;
    if (largest != i) {
      arr[largest] = [arr[i], arr[i] = arr[largest]][0];
      maxHeapify(largest);
    }
  };

  for (let i = Math.floor(arr.length / 2); i >= 0; i--) maxHeapify(i);
  return arr;
}

