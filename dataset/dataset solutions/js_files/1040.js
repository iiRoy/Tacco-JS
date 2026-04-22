const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const Arr = (input.trim()).split("\n");
const N1 = Number(Arr[0]);
const arr1 = Arr[1].split(" ").map(Number);
// const N2 = Number(Arr[2]);
const arr2 = Arr[3].split(" ").map(Number);

const binarySearch = (function(arr, N) {
  return (key) => {   
    let mid;
    let left = 0;
    let right = N;
    if (key < arr[0] || arr[N-1] < key) return 0;
    while (left < right) {
      mid = Math.floor((left + right) / 2);
      if (key < arr[mid]) right = mid;
      else if (key > arr[mid]) left = mid + 1;
      else return 1;
    }
    return 0;
  }
})(arr1, N1);

const summing = (a, b) => a + b;
console.log(arr2.map(binarySearch(e)).reduce((a, b) => a + b, 0));
