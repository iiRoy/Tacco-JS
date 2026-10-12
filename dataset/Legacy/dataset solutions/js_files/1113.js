(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
  const arr = lines.shift().split(' ');
  buildMaxHeap(arr);
  console.log(arr.reduce((s, e) => s += ' ' + e, ''));
})();

function buildMaxHeap(arr) {
  const n = arr.length;
  let left, right, largest;
  const maxHeapify = (i) => {
    left = 2 * i + 1;
    right = 2 * i + 2;
    if (left < n && Number(arr[left]) > Number(arr[i])) largest = left;
    else largest = i;
    if (right < n && Number(arr[right]) > Number(arr[largest])) largest = right;
    if (largest != i) {
      arr[largest] = [arr[i], arr[i] = arr[largest]][0];
      maxHeapify(largest);
    }
  };

  for (let i = Math.floor(arr.length / 2 - 1); i >= 0; i--) maxHeapify(i);
}

